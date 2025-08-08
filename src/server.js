import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import logsRoutes from './routes/logs.js'
import emailReplyRoutes from './routes/automations/emailReply.js'
import { initDb } from './services/logStore.js'

const app = express()

// Middlewares globales
app.use(helmet())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({
  origin: config.origin,
  credentials: true
}))

// Salud
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/logs', logsRoutes)
app.use('/api/automations/email-reply', emailReplyRoutes)

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }))

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

const start = async () => {
  await initDb()
  app.listen(config.port, () => {
    console.log(`[bf-backend] listening on http://localhost:${config.port}`)
  })
}

start().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})