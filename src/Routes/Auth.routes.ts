import { Router,type Router as ExpressRouter } from 'express'
import { createAdmin, forgotPassword, login, logout, requestOtp, resetPassword, verifyOtp } from '../Controller/AuthController'

const router:ExpressRouter = Router()

router.post('/login', login)
router.post('/logout', logout)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/request-otp', requestOtp)
router.post('/verify-otp', verifyOtp)

// Optional: seed a new admin user
router.post('/seed-admin', createAdmin)

export default router
