import { Request, Response, NextFunction } from 'express'
import AdminSession from '../Models/AdminSession'
import { verifyAdminToken, type AdminTokenPayload } from '../Utils/auth'
import { errorHandler } from '../Utils/errorHandler'

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return next(new errorHandler('Unauthorized', 401))

  const payload = verifyAdminToken(token)
  console.log(
    "Admin payload",payload
  )
  if (!payload) return next(new errorHandler('Unauthorized', 401))

  if (!payload.sid) return next(new errorHandler('Unauthorized', 401))

  const session = await AdminSession.findOne({ sid: payload.sid })
    .select({ sid: 1, userId: 1, revokedAt: 1, expiresAt: 1 })
    .lean()

  const sessionUserId = session?.userId ? String(session.userId) : null
  if (!session || !sessionUserId || sessionUserId !== payload.sub) return next(new errorHandler('Unauthorized', 401))
  if (session.revokedAt) return next(new errorHandler('Unauthorized', 401))
  const expiresAt = session?.expiresAt ? new Date(session.expiresAt as any) : null
  if (expiresAt && expiresAt < new Date()) return next(new errorHandler('Unauthorized', 401))

  ;(req as Request & { admin?: AdminTokenPayload }).admin = payload
  next()
}
