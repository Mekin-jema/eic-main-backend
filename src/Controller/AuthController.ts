import mongoose from 'mongoose'
import AdminUser from '../Models/AdminUser'
import AdminSession from '../Models/AdminSession'
import PasswordResetToken from '../Models/PasswordResetToken'
import AdminOtpCode from '../Models/AdminOtpCode'
import catchAsyncError from '../Middleware/catchAsyncError'
import {
  generateOtpCode,
  generateResetToken,
  generateSessionId,
  hashPassword,
  ADMIN_TOKEN_TTL_MS,
  OTP_TTL_MINUTES,
  RESET_TOKEN_TTL_MINUTES,
  signAdminToken,
  verifyAdminToken,
  verifyPassword,
} from '../Utils/auth'
import { errorHandler } from '../Utils/errorHandler'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'mail.powerethio.com',
  port: 465,
  secure: true,
  auth: { user: 'noreply@powerethio.com', pass: 'YpirP1]KF+h0w7dW' },
  tls: { rejectUnauthorized: false },
})

async function sendEmail(to: string, subject: string, html: string) {
  console.log('[AuthController] sendEmail: sending', { to, subject })
  const info: any = await transporter.sendMail({ from: 'noreply@powerethio.com', to, subject, html })
  console.log('[AuthController] sendEmail: sent', { to, messageId: info?.messageId })
}

// Login: authenticate admin by email/password and set session cookie
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body as { email?: string | string[]; password?: string | string[] }
  const emailStr = Array.isArray(email) ? email[0] : email
  const passwordStr = Array.isArray(password) ? password[0] : password
  console.log('[AuthController] login: start', { email: emailStr })
  if (!emailStr || !passwordStr) return next(new errorHandler('Email and password are required', 400))

  const user = (await AdminUser.findOne({ email: emailStr })) as any
  if (!user) {
    console.warn('[AuthController] login: user not found', { email: emailStr })
    return next(new errorHandler('Invalid credentials', 401))
  }

  const valid = await verifyPassword(passwordStr, String(user.passwordHash))
  if (!valid) {
    console.warn('[AuthController] login: invalid password', { userId: user.id })
    return next(new errorHandler('Invalid credentials', 401))
  }

  const session = (await AdminSession.create({
    userId: user._id,
    sid: generateSessionId(),
    expiresAt: new Date(Date.now() + ADMIN_TOKEN_TTL_MS),
  })) as any
  const token = signAdminToken({
    id: String(user._id),
    email: String(user.email),
    role: (user.role ?? null) as string | null,
    sessionId: String(session.sid),
  })
  console.log('[AuthController] login: success', { userId: user._id })
  res
    .cookie('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'PRODUCTION',
      path: '/',
    })
    .status(200)
    .json({ success: true, user: { id: user._id, email: user.email, name: user.name, role: user.role }, token })
})

// Logout: clear admin session cookie
export const logout = catchAsyncError(async (req, res) => {
  const token = req.cookies?.admin_token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (token) {
    const payload = await Promise.resolve(verifyAdminToken(token))
    if (payload?.sid) {
      await AdminSession.updateMany({ sid: payload.sid, revokedAt: null }, { revokedAt: new Date() })
    }
  }
  console.log('[AuthController] logout: clearing admin_token')
  res
    .clearCookie('admin_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'PRODUCTION',
      path: '/',
    })
    .status(200)
    .json({ success: true })
})

// Forgot Password: generate reset token and email reset link
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body as { email?: string | string[] }
  const emailStr = Array.isArray(email) ? email[0] : email
  console.log('[AuthController] forgotPassword: start', { email: emailStr })
  if (!emailStr) return next(new errorHandler('Email is required', 400))

  const user = (await AdminUser.findOne({ email: emailStr }).lean()) as any
  if (!user) {
    console.warn('[AuthController] forgotPassword: no account for email', { email: emailStr })
    return next(new errorHandler('If that account exists, a reset email will be sent.', 200))
  }

  const token = generateResetToken()
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)

  await PasswordResetToken.create({ token, userId: user.id, expiresAt })
  console.log('[AuthController] forgotPassword: token created', { userId: user.id, expiresAt })

  const appBaseUrl = (process.env.ADMIN_APP_URL || 'http://localhost:3002').replace(/\/$/, '')
  const resetLink = `${appBaseUrl}/reset-password?token=${token}`
  const subject = 'Reset your administrator password'
  const html = `
    <p>Hello ${user.name || 'Admin'},</p>
    <p>We received a request to reset the password for your admin account.</p>
    <p><a href="${resetLink}">Click here to reset your password</a>. This link will expire in ${RESET_TOKEN_TTL_MINUTES} minutes.</p>
    <p>If you did not request this change, you can safely ignore this email.</p>
  `

  await sendEmail(String(user.email), subject, html)
  console.log('[AuthController] forgotPassword: reset email queued', { email: user.email })

  res.status(200).json({
    success: true,
    message: 'If that account exists, a reset email will be sent.',
    debugToken: process.env.NODE_ENV === 'development' ? token : undefined,
  })
})

// Reset Password: validate token, update password, mark token used
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token, password } = req.body as { token?: string | string[]; password?: string | string[] }
  const tokenStr = Array.isArray(token) ? token[0] : token
  const passwordStr = Array.isArray(password) ? password[0] : password
  console.log('[AuthController] resetPassword: start')
  if (!tokenStr || !passwordStr) return next(new errorHandler('Token and password are required', 400))

  const record = (await PasswordResetToken.findOne({ token: tokenStr }).lean()) as any
  if (!record || record.used || new Date(record.expiresAt) < new Date()) {
    console.warn('[AuthController] resetPassword: invalid or expired token')
    return next(new errorHandler('Reset link is invalid or has expired', 400))
  }

  const passwordHash = await hashPassword(passwordStr)
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    await AdminUser.updateOne({ _id: record.userId }, { passwordHash }, { session })
    await PasswordResetToken.updateOne({ _id: record.id }, { used: true }, { session })
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
  console.log('[AuthController] resetPassword: password updated', { userId: record.userId })

  res.status(200).json({ success: true })
})

// Request OTP: create 6-digit code, email it, set short expiry
export const requestOtp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body as { email?: string | string[] }
  const emailStr = Array.isArray(email) ? email[0] : email
  console.log('[AuthController] requestOtp: start', { email: emailStr })
  if (!emailStr) return next(new errorHandler('Email is required', 400))

  const user = (await AdminUser.findOne({ email: emailStr }).lean()) as any
  if (!user) {
    console.warn('[AuthController] requestOtp: no account for email', { email: emailStr })
    return res.status(200).json({ success: true, message: 'If that account exists, an OTP will be sent.' })
  }

  await AdminOtpCode.updateMany({ userId: user.id, used: false }, { used: true })
  console.log('[AuthController] requestOtp: invalidated previous OTPs', { userId: user.id })

  let code = generateOtpCode()
  for (let i = 0; i < 3; i++) {
    const existing = await AdminOtpCode.findOne({ code }).lean()
    if (!existing) break
    code = generateOtpCode()
  }
  console.log('[AuthController] requestOtp: generated OTP code')

  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
  await AdminOtpCode.create({ code, userId: user.id, expiresAt })
  console.log('[AuthController] requestOtp: stored OTP', { userId: user.id, expiresAt })

  const subject = 'Your verification code'
  const html = `
    <p>Hello ${user.name || 'Admin'},</p>
    <p>Your verification code is: <strong>${code}</strong></p>
    <p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>
  `

  await sendEmail(String(user.email), subject, html)
  console.log('[AuthController] requestOtp: OTP email queued', { email: user.email })

  res.status(200).json({ success: true, message: 'OTP sent if the account exists.', expiresInMinutes: OTP_TTL_MINUTES })
})

// Verify OTP: check code, mark used, issue admin session cookie
export const verifyOtp = catchAsyncError(async (req, res, next) => {
  const { code } = req.body as { code?: string | string[] }
  const codeStr = Array.isArray(code) ? code[0] : code
  console.log('[AuthController] verifyOtp: start')
  if (!codeStr) return next(new errorHandler('Code is required', 400))

  const record = (await AdminOtpCode.findOne({ code: codeStr }).lean()) as any
  if (!record || record.used || new Date(record.expiresAt) < new Date()) {
    console.warn('[AuthController] verifyOtp: invalid or expired code')
    return next(new errorHandler('Invalid or expired code', 400))
  }

  await AdminOtpCode.updateOne({ _id: record.id }, { used: true })
  console.log('[AuthController] verifyOtp: marked OTP as used', { id: record.id })

  const user = (await AdminUser.findById(record.userId)) as any
  if (!user) {
    return next(new errorHandler('Invalid or expired code', 400))
  }

  const session = (await AdminSession.create({
    userId: user._id,
    sid: generateSessionId(),
    expiresAt: new Date(Date.now() + ADMIN_TOKEN_TTL_MS),
  })) as any
  const token = signAdminToken({ id: String(user._id), email: String(user.email), role: user.role ?? null, sessionId: String(session.sid) })
  console.log('[AuthController] verifyOtp: issuing admin token', { userId: user._id })
  res
    .cookie('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'PRODUCTION',
      path: '/',
    })
    .status(200)
    .json({ success: true, token })
})

// Helper to create a seed admin (call manually if needed)
// Seed Admin: create a new admin account (restricted use)
export const createAdmin = catchAsyncError(async (req, res, next) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string }
  console.log('[AuthController] createAdmin: start', { email })
  if (!email || !password) return next(new errorHandler('Email and password are required', 400))
  const existing = await AdminUser.findOne({ email }).lean()
  if (existing) {
    console.warn('[AuthController] createAdmin: account already exists', { email })
    return next(new errorHandler('Admin already exists with this email', 400))
  }
  const passwordHash = await hashPassword(password)
  const user = (await AdminUser.create({ email, passwordHash, name: name || email })) as any
  console.log('[AuthController] createAdmin: success', { userId: user.id })
  res.status(201).json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
})
