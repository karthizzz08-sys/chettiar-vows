# Quick Start Guide - Brevo OTP Setup

## Step 1: Get Brevo API Key (5 minutes)

1. Go to [brevo.com](https://brevo.com)
2. Sign up for free account (or login if existing)
3. Go to Account Settings → SMTP & API
4. Under "API Keys" → Generate a new API key
5. Copy the API key

## Step 2: Update .env File

Replace `your_brevo_api_key_here` with your actual key:

```bash
# .env
BREVO_API_KEY=xkeysib_xxxxx... 
BREVO_SENDER_EMAIL=noreply@chettiarconnect.com
BREVO_SENDER_NAME=Chettiar Connect
```

## Step 3: Create Database Schema (5 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: kuwhoodnbbvwtiyfwfhc
3. Go to SQL Editor → New Query
4. Copy all content from: `supabase/migrations/001_create_otp_and_profiles.sql`
5. Click "Run"
6. Wait for success message

## Step 4: Test Locally

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:8081/register
# Enter your email
# Click "Send Verification Code"
# Check your email inbox (might be in spam)
# Enter the 6-digit code
# Complete registration
```

## Step 5: Deploy to Vercel

```bash
# 1. Commit and push to GitHub
git add .
git commit -m "Implement Brevo OTP authentication"
git push

# 2. In Vercel Dashboard:
# - Connect your GitHub repo
# - Add Environment Variables:
#   BREVO_API_KEY = your_key_here
#   VITE_SUPABASE_URL = https://kuwhoodnbbvwtiyfwfhc.supabase.co
#   VITE_SUPABASE_ANON_KEY = sb_publishable_...
# - Click Deploy

# Production URL will be: https://your-project.vercel.app
```

## Architecture Overview

### Flow Diagram
```
User Registration
     ↓
1. Enter email → sendOtp() called
     ↓
2. Server generates 6-digit OTP
     ↓
3. Hash OTP + Store in Supabase
     ↓
4. Send via Brevo email API
     ↓
5. User receives OTP in email (5-10 seconds)
     ↓
6. User enters 6-digit code
     ↓
7. verifyOtpAndSignIn() called
     ↓
8. Server verifies hash + checks expiry
     ↓
9. Creates Supabase Auth session
     ↓
10. Creates user profile
     ↓
11. Redirect to /dashboard
```

### Key Security Features
- ✅ OTP hashed with PBKDF2 (100K iterations)
- ✅ 10-minute expiry
- ✅ 5 failed attempt limit
- ✅ Brevo API key server-side only
- ✅ Constant-time hash verification
- ✅ RLS policies enforce data isolation

## Troubleshooting

### OTP Email Not Received
- Check email spam folder
- Verify BREVO_API_KEY is correct
- Check Brevo dashboard for delivery errors
- Test with different email address

### "Supabase not configured" Error
- Verify VITE_SUPABASE_URL in .env
- Verify VITE_SUPABASE_ANON_KEY in .env
- Restart dev server (npm run dev)

### "Failed to create OTP" Error
- Verify Supabase database migration ran
- Check if otp_verifications table exists
- Check Supabase database permissions

### "Invalid verification code" Error
- User exceeded 5 attempts → request new OTP
- OTP expired (10 minutes) → request new OTP
- User entered wrong code → try again

## Files Overview

```
Key Files:
- src/lib/auth.functions.ts     → sendOtp, verifyOtpAndSignIn
- src/lib/otp.utils.ts          → OTP generation, hashing
- src/integrations/brevo/email.ts → Brevo API + templates
- src/components/OtpModal.tsx   → OTP input UI
- src/routes/register.tsx       → Registration page
- supabase/migrations/001_...   → Database schema
```

## Environment Variables Required

**Frontend Safe** (exposed in compiled code):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

**Server Only** (never in frontend):
```
BREVO_API_KEY
SUPABASE_SERVICE_ROLE_KEY (optional, for admin operations)
```

## Email Template

Beautiful Tamil wedding-themed template with:
- Maroon (#8b1a1a) and gold (#d4af37) colors
- 6-digit OTP prominently displayed
- 10-minute expiry notice
- Security warnings
- Professional Tamil + English footer

## Testing Checklist

- [ ] OTP sends within 5 seconds
- [ ] Email arrives in inbox
- [ ] 6-digit code accepts only digits
- [ ] Valid code creates session
- [ ] Invalid code shows error
- [ ] 5+ attempts shows "too many attempts"
- [ ] Dashboard redirects logged-in users
- [ ] Session persists on page refresh
- [ ] Mobile responsive on all pages
- [ ] Production build successful (npm run build)

## Support

For issues:
1. Check console logs (npm run dev output)
2. Review Brevo dashboard for delivery errors
3. Verify Supabase tables with SQL queries
4. Check browser DevTools Network tab for API responses
