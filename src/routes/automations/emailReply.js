import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth.js'
import { parseEmail } from '../../services/parser.js'
import { lookupByDniOrExpediente } from '../../services/internalDb.js'
import { generateEmail } from '../../services/openai.js'
import { sendMail } from '../../services/msGraph.js'
import { insertLog, finishLog } from '../../services/logStore.js'

const router = Router()

router.post('/parse', requireAuth, (req, res)=>{
  const schema = z.object({ raw: z.string().min(5) })
  const { raw } = schema.parse(req.body)
  const data = parseEmail(raw)
  res.json(data)
})

router.get('/lookup', requireAuth, async (req, res)=>{
  const schema = z.object({
    dni: z.string().optional(),
    expediente: z.string().optional()
  })
  const { dni, expediente } = schema.parse(req.query)
  const info = await lookupByDniOrExpediente({ dni, expediente })
  res.json(info)
})

router.post('/generate', requireAuth, async (req, res, next)=>{
  try{
    const schema = z.object({
      mode: z.enum(['template','gpt']).default('template'),
      clientData: z.object({
        nombre: z.string().optional(),
        expediente: z.string().optional()
      }).default({}),
      lookup: z.object({
        estado: z.string().optional(),
        ultimaActualizacion: z.string().optional()
      }).default({})
    })
    const { mode, clientData, lookup } = schema.parse(req.body)
    const { nombre='', expediente='' } = clientData
    const { estado='En trámite', ultimaActualizacion='' } = lookup

    if(mode === 'template'){
      const body = `Hola ${nombre || 'estimado/a'},\n\nHemos recibido su denuncia judicial. El expediente ${expediente || '(s/n)'} se encuentra ${estado}.\nNos comunicaremos ante nuevas novedades.\n\nSaludos cordiales,\nEquipo de Fraudes`
      return res.json({ body })
    }else{
      const body = await generateEmail({ nombre, expediente, estado, ultimaActualizacion })
      return res.json({ body })
    }
  }catch(err){ next(err) }
})

router.post('/send', requireAuth, async (req, res, next)=>{
  const schema = z.object({
    to: z.string().email(),
    subject: z.string().min(3),
    body: z.string().min(5)
  })
  const { to, subject, body } = schema.parse(req.body)

  // Log de ejecución
  const startedAt = new Date()
  const logId = insertLog({
    automation: 'Respuesta de correo',
    status: 'running',
    startedAt: startedAt.toISOString(),
    runBy: req.user.name,
    detail: { to, subject }
  })

  try{
    const result = await sendMail({ to, subject, body })
    const finishedAt = new Date()
    const durationMs = finishedAt - startedAt
    finishLog(logId, { status:'ok', finishedAt: finishedAt.toISOString(), durationMs, detail: { messageId: result.id } })
    res.json({ ok: true, messageId: result.id, logId })
  }catch(err){
    const finishedAt = new Date()
    const durationMs = finishedAt - startedAt
    finishLog(logId, { status:'error', finishedAt: finishedAt.toISOString(), durationMs, detail: { error: err.message } })
    next(err)
  }
})

export default router