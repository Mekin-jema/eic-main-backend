import crypto from 'crypto'

const TOKEN_BYTES = 24
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8 // 8 hours
export const ADMIN_TOKEN_TTL_MS = TOKEN_TTL_MS
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'dev-admin-secret'

export interface AdminTokenPayload {
  sub: string
  email: string
  role?: string | null
  sid: string
  iat: number
  exp: number
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function signAdminToken(user: { id: string; email: string; role?: string | null; sessionId: string }): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role || null,
    sid: user.sessionId,
    iat: now,
    exp: now + TOKEN_TTL_MS / 1000,
  }

  const payloadStr = JSON.stringify(payload)
  const payloadB64 = base64url(payloadStr)
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('base64url')
  return `${payloadB64}.${signature}`
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (!token.includes('.')) return null
  const [payloadB64, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString()) as AdminTokenPayload
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null
    return payload
  } catch {
    return null
  }
}

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err)
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = stored.split(':')
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err)
      resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey))
    })
  })
}

export function generateResetToken(bytes = TOKEN_BYTES) {
  return crypto.randomBytes(bytes).toString('hex')
}

export function generateSessionId(bytes = TOKEN_BYTES) {
  return crypto.randomBytes(bytes).toString('hex')
}

export const RESET_TOKEN_TTL_MINUTES = 60

export const OTP_TTL_MINUTES = 10

export function generateOtpCode(): string {
  const num = crypto.randomInt(0, 1_000_000)
  return num.toString().padStart(6, '0')
}
