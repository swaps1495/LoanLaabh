# LoanLaabh Test Credentials

## Admin Panel
- URL: https://loanlaabh.com/admin (or http://localhost:3000/admin)
- Legacy Password Login: `Sw@ps9409` (from .env → ADMIN_PASSWORD)
- Alternative: Supabase Email OTP login — email must be present in `admins` table in Supabase

## Customer Login
- URL: https://loanlaabh.com/login
- Auth: Supabase Email OTP (6-digit code via Resend SMTP → noreply@loanlaabh.com)
- OTP length: 6 digits
- OTP expiry: 10 minutes
