import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export function signJwt(payload){
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: `${config.jwt.days}d` })
  return token
}

export function setAuthCookie(res, token){
  res.cookie(config.jwt.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // en prod: true detrás de HTTPS
    maxAge: config.jwt.days * 24 * 60 * 60 * 1000
  })
}

export function clearAuthCookie(res){
  res.clearCookie(config.jwt.cookieName)
}

export function requireAuth(req, res, next){
  const token = req.cookies[config.jwt.cookieName]
  if(!token) return res.status(401).json({ error: 'No autorizado' })
  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

export function requireRole(...roles){
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ error: 'No autorizado' })
    if(roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Prohibido' })
    next()
  }
}