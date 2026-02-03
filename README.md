# EIC Backend API

Backend service for attendee registration, admin authentication, attendance tracking, communications, badge/QR operations, and reporting for the Invest in Ethiopia event platforms.

## Tech Stack

- Node.js + TypeScript
- Express
- MongoDB (Mongoose)
- Nodemailer
- Multer (file uploads)

## Functional Scope (What This Backend Does)

### 1) Attendee Registration

- Accepts multi-step registration data from the public frontend.
- Validates required fields and conditional requirements (e.g., sector for investors, company name for existing companies, passport copy for visa assistance).
- Stores uploaded documents (business license, passport copy) under public storage and returns file URLs.
- Prevents duplicate registrations by email.

### 2) Badge & Export

- Generates a PDF badge for a specific attendee.
- Exports attendee data as JSON for admin use.

### 3) Attendance (Check-in / Check-out)

- Check-in and check-out endpoints for staff devices and QR scanners.
- Maintains check-in time, check-out time, scan count, and last scan timestamp.
- Provides attendance summary statistics (total, checked-in, attendance rate, recent check-ins).

### 4) QR Verification

- Verifies QR payloads and auto check-in users.
- QR payload format: `GREEN_ENERGY_EVENT:ATT:<attendeeId>`.
- Returns attendee identity and attendance status in a single response.

### 5) Admin Authentication

- Admin login with secure session tokens.
- OTP flow for login verification.
- Forgot-password / reset-password flow with time-limited tokens.
- Seed admin endpoint for first-time setup.

### 6) Admin Analytics & Data Access

- Aggregate analytics and counts.
- Admin access to attendee and contact lists.

### 7) Communications (Admin)

- Email templates (CRUD).
- Send campaigns to audiences or selected recipients.
- Schedule emails.
- Test email sending.
- Track summary stats, campaigns, notifications, and platform stats.

### 8) Contact Form

- Saves public inquiries and sends a confirmation email to the user.

### 9) Failed Email Tracking

- Stores failed email attempts.
- Provides filtering, retry status updates, and retry initiation.

### 10) Payment Webhook

- Receives webhook notifications for payments and records transactions.

## Public API Summary

Base path: `/api`

### Attendee Registration

- `POST /api/attendee/attendee-registration` — create attendee
- `GET /api/attendee/attendee-registration/:id` — fetch attendee
- `PUT /api/attendee/attendee-registration/:id` — update attendee
- `DELETE /api/attendee/attendee-registration/:id` — delete attendee
- `GET /api/attendee/attendee-registration/:id/badge` — generate badge PDF
- `GET /api/attendee/attendee-registration/:id/export` — export attendee JSON
- `POST /api/attendee/attendee-registration/:id/send-email` — send email to attendee

### Attendance

- `POST /api/attendance/check-in/:id`
- `POST /api/attendance/check-out/:id`
- `GET /api/attendance/status/:id`
- `GET /api/attendance/summary`

### QR Verification

- `POST /api/qr/verify` — verify QR and auto check-in
- `GET /api/qr/user/:id` — fetch user by ID

### Admin Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/seed-admin` (one-time)

### Admin Analytics & Data

- `GET /api/admin/analytics`
- `GET /api/admin/counts`
- `GET /api/admin/attendees`
- `GET /api/admin/contacts`

### Communications

- `GET /api/admin/communications/templates`
- `POST /api/admin/communications/templates`
- `PATCH /api/admin/communications/templates/:id`
- `DELETE /api/admin/communications/templates/:id`
- `GET /api/admin/communications/stats`
- `GET /api/admin/communications/recent`
- `POST /api/admin/communications/email/send`
- `POST /api/admin/communications/email/test`
- `POST /api/admin/communications/email/schedule`
- `POST /api/admin/communications/email/selected`
- `GET /api/admin/communications/email/campaigns`
- `GET /api/admin/communications/sms/stats`
- `GET /api/admin/communications/notifications/recent`
- `GET /api/admin/communications/notifications/platform`

### Contact

- `POST /api/contact`

### Failed Emails

- `GET /api/failed-emails`
- `GET /api/failed-emails/status/:status`
- `GET /api/failed-emails/type/:emailType`
- `GET /api/failed-emails/retryable`
- `GET /api/failed-emails/stats`
- `PATCH /api/failed-emails/:emailId/status`
- `POST /api/failed-emails/:emailId/retry`
- `DELETE /api/failed-emails/:emailId`

### Payments

- `POST /api/payment/webhook`

See full route definitions in [src/Routes](src/Routes).

## Data Flow (High Level)

1. Public user registers via frontend form → `POST /api/attendee/attendee-registration`.
2. Backend validates and stores attendee + uploads → responds with success and attendee record.
3. Admin dashboard fetches attendees and analytics from admin endpoints.
4. Attendance staff scans QR or checks in manually → attendance state updates in DB.
5. Admin communications send emails using templates and merge tags.

## Storage & Files

- Uploaded documents saved under `public/uploads/attendees`.
- Static files served from `public`.

## Environment Variables

Create a `.env` file in the backend folder:

```
PORT=3000
MONGODB_URI=mongodb://...
# or
DATABASE_URL=mongodb://...

NODE_ENV=DEVELOPMENT
ADMIN_TOKEN_SECRET=your-secret
ADMIN_APP_URL=http://localhost:3002

# Chapa webhook
webhook_secret_key=your-chapa-webhook-secret

# Optional seed defaults
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=ChangeMe123!
ADMIN_SEED_NAME=Admin
```

Notes:

- SMTP credentials are currently hardcoded in [src/Utils/emailService.ts](src/Utils/emailService.ts) and [src/Controller/AuthController.ts](src/Controller/AuthController.ts). Move these to environment variables before production delivery.

## Scripts

- `pnpm dev` — start with nodemon
- `pnpm build` — compile TypeScript
- `pnpm start` — run compiled build
- `pnpm watch` — TypeScript watch mode
- `pnpm prod` — run production build
- `pnpm db:seed` — seed admin user
- `pnpm preview:badges` — generate badge previews
- `pnpm preview:badges:advanced` — generate advanced badge previews
- `pnpm generate:attendee-qr` — generate attendee QR codes

## Project Structure

- [src/Config](src/Config) — DB configuration
- [src/Controller](src/Controller) — request handlers
- [src/Routes](src/Routes) — API routes
- [src/Models](src/Models) — Mongoose models
- [src/Services](src/Services) — business logic
- [src/Utils](src/Utils) — helpers (email, badge, QR)
- [src/Validator](src/Validator) — request validation
- [src/Middleware](src/Middleware) — error handling, auth, etc.
