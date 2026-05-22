# Brevo + Supabase OTP Architecture

## Overview
This system uses **Brevo** for sending OTP emails and **Supabase** as the backend database and session manager.

## Architecture Diagram
```
User Interface
     ↓
┌─────────────────────────────────────┐
│     Frontend Components             │
│  - register.tsx                     │
│  - OtpModal.tsx                     │
│  - RegistrationForm.tsx             │
└─────────────────────────────────────┘
     ↓ (Server Functions)
┌─────────────────────────────────────┐
│     Server-Side APIs                │
│  - sendOtp() → Generate OTP         │
│  - verifyOtpAndSignIn() → Verify    │
└─────────────────────────────────────┘
     ↓                          ↓
┌──────────────────┐    ┌──────────────────┐
│   Supabase DB    │    │   Brevo Email    │
│ - otp_verif...  │    │   Service        │
│ - profiles      │    │                  │
│ - auth.users    │    │  (SMTP API)      │
│ - sessions      │    │                  │
└──────────────────┘    └──────────────────┘
```

## Data Flow

### 1. User Requests OTP
```
User enters email → sendOtp() server function
  ↓
1. Generate 6-digit random OTP
2. Hash OTP using PBKDF2 (server-side)
3. Store in Supabase otp_verifications table
4. Send OTP via Brevo with luxury Tamil email template
5. Return success response
  ↓
User receives email with OTP
```

### 2. User Enters OTP & Verifies
```
User enters 6-digit code → verifyOtpAndSignIn() server function
  ↓
1. Look up OTP record in Supabase (email + active)
2. Check if OTP has expired (10 min default)
3. Check attempt count (max 5)
4. Verify OTP hash (constant-time comparison)
5. If valid:
   - Mark OTP as verified in Supabase
   - Sign in with Supabase Auth (create session)
   - Create/update user profile in Supabase
   - Return user + session
6. If invalid:
   - Increment attempt counter
   - Return error message
  ↓
Redirect to /dashboard with authenticated session
```

## File Structure

```
src/
├── lib/
│   ├── auth.functions.ts          # Server functions (sendOtp, verifyOtpAndSignIn)
│   ├── otp.utils.ts               # OTP generation, hashing, verification
│   └── hydration.tsx              # SSR safety utilities
├── integrations/
│   └── brevo/
│       └── email.ts               # Brevo email service + templates
├── components/
│   ├── OtpModal.tsx               # OTP input UI component
│   ├── RegistrationForm.tsx       # 10-step registration wizard
│   └── ErrorBoundary.tsx          # Error handling
├── routes/
│   ├── register.tsx               # Registration page
│   ├── __root.tsx                 # Root layout
│   └── _authenticated/
│       └── dashboard.tsx          # Protected dashboard
├── contexts/
│   └── AuthContext.tsx            # Auth state management
└── styles.css                     # Tailwind CSS

supabase/
├── migrations/
│   └── 001_create_otp_and_profiles.sql  # Database schema
└── config.toml
```

## Database Schema

### otp_verifications table
```sql
- id (UUID, Primary Key)
- email (TEXT, Unique when unverified)
- otp_code (TEXT) - 6-digit code (for dev, remove in production)
- otp_hash (TEXT) - PBKDF2 hash of OTP
- attempts (INT) - Current attempt count
- max_attempts (INT) - Max allowed attempts (5)
- expires_at (TIMESTAMP) - OTP expiry time
- verified_at (TIMESTAMP) - When verified
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### profiles table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- email (TEXT)
- full_name (TEXT)
- phone (TEXT)
- gender (TEXT)
- date_of_birth (DATE)
- location_city (TEXT)
- location_state (TEXT)
- caste (TEXT)
- occupation (TEXT)
- education (TEXT)
- bio (TEXT)
- profile_picture_url (TEXT)
- profile_completion_percentage (INT, default 10)
- verified_email (BOOLEAN, default false)
- is_active (BOOLEAN, default true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Environment Variables

### Client-Safe (Exposed in Frontend)
```bash
VITE_SUPABASE_URL=https://kuwhoodnbbvwtiyfwfhc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

### Server-Only (NEVER in Frontend)
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@chettiarconnect.com
BREVO_SENDER_NAME=Chettiar Connect
```

## Security Considerations

### OTP Hashing
- OTP is hashed using PBKDF2 (100,000 iterations)
- Plain OTP not stored in database
- Comparison uses constant-time verification

### Email Verification
- OTP stored with 10-minute expiry
- Maximum 5 failed attempts
- Automatic cleanup of expired OTPs
- Email uniqueness enforced (one pending OTP per email)

### Session Management
- Supabase Auth handles session tokens
- JWT tokens with 1-hour expiry (configurable)
- Refresh tokens for extended sessions
- Session data stored in browser localStorage

### API Security
- Brevo API key server-side only
- Supabase anon key restricted to auth & public data
- Service role key only used on server
- RLS policies enforce user data isolation

## OTP Utils Functions

### `generateOtp()`
Generates a random 6-digit OTP string

### `hashOtp(otp, salt?)`
Hashes OTP using PBKDF2. Returns salt:hash format for storage

### `verifyOtpHash(otp, hashedOtp)`
Verifies OTP against hash using constant-time comparison

### `isOtpExpired(expiresAt)`
Checks if OTP has expired

### `getOtpExpiryTime(minutesFromNow)`
Returns future timestamp for OTP expiry

## Brevo Email Template

The system uses a luxury Tamil wedding-themed email template:
- Maroon (#8b1a1a) and gold (#d4af37) colors
- Tamil + English text
- 6-digit OTP prominently displayed
- Security warnings
- 10-minute expiry notice
- Professional footer

## Error Handling

### Client-Side
- Toast notifications for all errors
- User-friendly error messages
- Automatic retry capability
- Request throttling (cooldown on resend)

### Server-Side
- Comprehensive console logging
- Error categorization (expired, invalid, too many attempts)
- Graceful fallbacks
- No sensitive data in error responses

## Testing

### Manual Testing Steps
1. Navigate to /register
2. Enter email and name
3. Click "Send Verification Code"
4. Check email inbox for OTP
5. Enter 6-digit code
6. Complete 10-step registration form
7. Verify redirect to /dashboard

### Test Cases
- Valid OTP → Success
- Invalid OTP → Error + retry
- Expired OTP → Error + resend option
- 5+ failed attempts → Blocked
- Resend while on cooldown → Disabled button

## Deployment

### Vercel Configuration
```json
{
  "env": {
    "BREVO_API_KEY": "@brevo-api-key",
    "BREVO_SENDER_EMAIL": "noreply@chettiarconnect.com",
    "VITE_SUPABASE_URL": "https://kuwhoodnbbvwtiyfwfhc.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Supabase Setup
1. Create otp_verifications table (run migration)
2. Create profiles table (run migration)
3. Enable RLS on both tables
4. Set up appropriate RLS policies
5. Create indexes for performance

### Brevo Setup
1. Create Brevo account
2. Generate API key
3. Verify sender email
4. Add to environment variables

## Monitoring & Logs

### Brevo Logs
- Monitor email delivery status
- Check bounce/complaint rates
- Review sender reputation

### Supabase Logs
- Check authentication events
- Monitor database queries
- Review RLS policy enforcement

### Application Logs
- Server function execution logs (console)
- OTP generation/verification events
- Email sending success/failure
- User registration completion

## Future Enhancements

- [ ] WhatsApp OTP option
- [ ] SMS OTP option
- [ ] Social login (Google, Facebook)
- [ ] Multi-factor authentication
- [ ] OTP history logging
- [ ] Rate limiting per IP
- [ ] Suspicious activity detection
