import { Router } from 'express'
import { z } from 'zod'
import { signJwt, setAuthCookie, clearAuthCookie, requireAuth } from '../middleware/auth.js'

const router = Router()

const LoginDto = z.object({
  username: z.string().min(3),
  password: z.string().min(1)
})

router.post('/login', (req, res) => {
  const parsed = LoginDto.safeParse(req.body)
  if(!parsed.success) return res.status(400).json({ error: 'Datos inválidos' })
  const { username } = parsed.data

  // Mock de usuarios: admin si incluye "admin"
  const role = /admin/i.test(username) ? 'admin' : 'operador'
  const user = { id: 1, name: username, role }
  const token = signJwt({ sub: user.id, name: user.name, role: user.role })

  setAuthCookie(res, token)
  return res.json({ user })
})

router.get('/me', requireAuth, (req, res)=>{
  const { sub, name, role } = req.user
  res.json({ id: sub, name, role })
})

router.post('/logout', (_req, res)=>{
  clearAuthCookie(res)
  res.json({ ok: true })
})

export default router