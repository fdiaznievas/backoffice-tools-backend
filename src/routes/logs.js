import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { insertLog, queryLogs } from '../services/logStore.js'

const router = Router()

router.get('/', requireAuth, (req, res)=>{
  const schema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(200).default(50)
  })
  const { q, page, limit } = schema.parse(req.query)
  const result = queryLogs({ q, page, limit })
  res.json(result)
})

// Ruta demo para insertar logs de prueba
router.post('/demo', requireAuth, (req, res)=>{
  const id = insertLog({
    automation: 'Demo',
    status: 'ok',
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: 1234,
    runBy: req.user.name,
    detail: { note: 'insertado via /api/logs/demo' }
  })
  res.json({ id })
})

export default router