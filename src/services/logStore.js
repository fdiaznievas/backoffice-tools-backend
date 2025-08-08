import Database from 'better-sqlite3'
import { config } from '../config.js'

let db

export async function initDb(){
  db = new Database(config.paths.dbFile)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS execution_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      automation TEXT NOT NULL,
      status TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      finishedAt TEXT,
      durationMs INTEGER,
      runBy TEXT,
      detail TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_logs_startedAt ON execution_logs(startedAt);
  `)
}

export function insertLog({ automation, status='ok', startedAt, finishedAt=null, durationMs=null, runBy='system', detail=null }){
  const stmt = db.prepare(`INSERT INTO execution_logs (automation, status, startedAt, finishedAt, durationMs, runBy, detail)
                           VALUES (?, ?, ?, ?, ?, ?, ?)`)
  const info = stmt.run(automation, status, startedAt, finishedAt, durationMs, runBy, detail ? JSON.stringify(detail) : null)
  return info.lastInsertRowid
}

export function finishLog(id, { status, finishedAt, durationMs, detail }){
  const stmt = db.prepare(`UPDATE execution_logs SET status=?, finishedAt=?, durationMs=?, detail=? WHERE id=?`)
  stmt.run(status, finishedAt, durationMs, detail ? JSON.stringify(detail) : null, id)
}

export function queryLogs({ q='', page=1, limit=20 }){
  const offset = (page-1)*limit
  const term = `%${q.toLowerCase()}%`
  const where = q ? `WHERE lower(automation) LIKE ? OR lower(status) LIKE ? OR lower(runBy) LIKE ?` : ''
  const params = q ? [term, term, term] : []
  const rows = db.prepare(`SELECT * FROM execution_logs ${where} ORDER BY startedAt DESC LIMIT ? OFFSET ?`).all(...params, limit, offset)
  const total = db.prepare(`SELECT COUNT(*) as c FROM execution_logs ${where}`).get(...params).c
  return { items: rows.map(r=>({...r, detail: r.detail ? JSON.parse(r.detail) : null})), total }
}