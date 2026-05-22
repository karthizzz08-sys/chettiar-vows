# Testing Guide - Complete Step-by-Step Instructions

## Pre-Testing Checklist

### ✅ Code Setup
- [ ] All files created successfully
- [ ] npm install completed
- [ ] npm run build successful (0 errors)
- [ ] TypeScript checks passing
- [ ] No console errors

### ✅ Configuration
- [ ] .env file updated with variables
- [ ] BREVO_API_KEY obtained from brevo.com
- [ ] BREVO_SENDER_EMAIL configured
- [ ] Supabase credentials in .env
- [ ] Environment variables test completed

### ✅ Database
- [ ] Supabase project created
- [ ] Database migration SQL executed
- [ ] otp_verifications table exists
- [ ] profiles table exists
- [ ] RLS policies enabled
- [ ] Tables visible in Supabase dashboard

---

## Phase 1: Local Setup Testing

### Step 1.1: Verify Environment Variables
```bash
# Open .env file and verify these exist:
VITE_SUPABASE_URL=https://kuwhoodnbbvwtiyfwfhc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
BREVO_API_KEY=xkeysib_...
BREVO_SENDER_EMAIL=noreply@yourapp.com
BREVO_SENDER_NAME=Chettiar Matrimony
```

### Step 1.2: Verify Supabase Connection
```bash
# Check if Supabase client initializes correctly
npm run build
# Look for any Supabase-related errors in output
```

### Step 1.3: Verify Database Tables
```
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Run:
   SELECT tablename FROM pg_tables 
   WHERE tablename IN ('otp_verifications', 'profiles');
4. Should return both table names
```

### Step 1.4: Verify Brevo Configuration
```bash
# Test Brevo API key by running this in terminal:
curl -X POST https://api.brevo.com/v3/smtp/email \
  -H "api-key: YOUR_BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {"email": "test@example.com", "name": "Test"},
    "to": [{"email": "your-test-email@gmail.com"}],
    "subject": "Test",
    "htmlContent": "<h1>Test</h1>",
    "textContent": "Test"
  }'

# Should return {"messageId": "..."}
```

---

## Phase 2: Local Development Testing

### Step 2.1: Start Development Server
```bash
cd c:\chettiar-vows
npm run dev

# Expected output:
# Vite dev server running at http://localhost:8080
# Or http://localhost:8081 (if 8080 in use)
```

### Step 2.2: Navigate to Register Page
```
1. Open browser: http://localhost:8080/register
2. Should see:
   - Navbar at top
   - "Register" heading
   - Email input field
   - Name input field
   - "Send Verification Code" button
   - Footer at bottom
3. No console errors (F12 to check)
```

### Step 2.3: Test Email Validation
```
Test Case 1: Empty Email
Input: Leave email blank, click "Send"
Expected: Form error "Email is required"

Test Case 2: Invalid Email
Input: "notanemail", click "Send"
Expected: Form error "Invalid email"

Test Case 3: Valid Email
Input: "user@gmail.com"
Expected: No error, ready to proceed
```

### Step 2.4: Test OTP Generation & Sending
```
1. Enter valid email: test@yourname.com
2. Enter name: Test User
3. Click "Send Verification Code"
4. Watch for:
   - Loading state (spinning icon)
   - "Sending..." message (optional)
   - Modal appears with countdown timer (600 seconds)
   - 6 empty input fields for OTP digits
5. Check browser console (F12):
   - Should see sendOtpFn response
   - No errors logged
6. Check email inbox:
   - Should receive email within 5-10 seconds
   - From: BREVO_SENDER_EMAIL
   - Subject: Contains "Verification Code"
   - Email contains 6-digit code
```

### Step 2.5: Test OTP Input Modal
```
Test Case 1: Single Digit
Input: Click first field, type "1"
Expected: Moves to next field automatically

Test Case 2: Paste Full Code
Input: Copy "123456" from email, paste into first field
Expected: All 6 fields populate, verification starts

Test Case 3: Invalid Code (Wrong Digits)
Input: "999999"
Expected: 
- Error message: "Invalid verification code"
- Attempts counter increases
- Can try again

Test Case 4: Expired Code (Manual Test)
Input: Wait 10+ minutes
Expected: Countdown reaches 0, error: "Code expired"

Test Case 5: Too Many Attempts (Simulate)
Input: Try 5+ different codes
Expected: Error: "Too many attempts, please request new code"

Test Case 6: Correct Code
Input: "123456" (from email)
Expected:
- Modal closes
- Registration form appears (10-step form)
- Success message/notification
```

### Step 2.6: Test OTP Resend
```
1. Send OTP (get to modal screen)
2. Click "Resend Code" button
3. Wait 30 seconds cooldown
4. Button should:
   - Show timer: "Resend in 29s"
   - Become disabled
   - After 30s, become enabled again
5. Click "Resend Code" again
6. Should receive new email within 5 seconds
7. Old code should be invalid
8. New code should work
```

### Step 2.7: Test 10-Step Registration Form
```
After OTP verification, form should appear with:

Step 1: Full Name (pre-filled from registration)
Step 2: Phone Number
Step 3: Gender (Male/Female/Other)
Step 4: Date of Birth
Step 5: Location (City)
Step 6: Location (State)
Step 7: Caste/Community (Optional)
Step 8: Occupation
Step 9: Education
Step 10: Bio (Optional)

Test Each Step:
- Fill with valid data
- Click Next/Previous buttons
- Progress bar updates
- Can go back and edit
- Final step shows "Complete Registration"
```

### Step 2.8: Test Registration Submission
```
1. Complete all 10 steps with valid data
2. Click "Complete Registration" button
3. Watch for:
   - Loading state
   - No errors in console
4. Should redirect to: /dashboard
5. Dashboard should load with:
   - Welcome message
   - User's profile data
   - No authentication errors
```

### Step 2.9: Test Dashboard Access
```
1. After successful registration, you're on /dashboard
2. Verify:
   - Profile information displays correctly
   - Session persists (refresh page - still logged in)
   - localStorage contains session (F12 → Application → localStorage)
   - Navigation menu works
   - No 403 errors in console

Test Session Persistence:
- Navigate to dashboard: http://localhost:8080/dashboard
- Press F5 to refresh
- Should stay logged in
- No redirect to login
- Session restored from localStorage
```

### Step 2.10: Test Protected Routes
```
Test Case 1: Access Protected Route Without Auth
1. Delete localStorage.sb-session (F12 → Application → localStorage)
2. Visit http://localhost:8080/dashboard
3. Expected: Redirect to /login or /register

Test Case 2: Invalid Session Token
1. Modify localStorage.sb-session to invalid value
2. Refresh page
3. Expected: Error handling, redirect to login

Test Case 3: After Logout (Future Feature)
1. Click logout button
2. localStorage.sb-session should be cleared
3. Should redirect to home page
4. Cannot access /dashboard
```

---

## Phase 3: Email Verification

### Step 3.1: Check Email Delivery
```
1. Send OTP to test email address
2. Check inbox for email from BREVO_SENDER_NAME
3. Verify email contains:
   ✓ Professional header with logo
   ✓ "Verification Code" title
   ✓ 6-digit code prominently displayed
   ✓ Expiry message: "Code expires in 10 minutes"
   ✓ Security warning about not sharing code
   ✓ Link to app or instructions
   ✓ Tamil and English text
   ✓ Maroon (#8b1a1a) and gold (#d4af37) colors
   ✓ Professional footer
   ✓ Unsubscribe link
```

### Step 3.2: Test Email Formatting
```
1. Open email in different clients:
   - Gmail (web)
   - Gmail (mobile)
   - Outlook
   - Apple Mail
2. Verify rendering:
   - Text is readable
   - Colors display correctly
   - Images load (if any)
   - Links are clickable
   - Layout is responsive
```

### Step 3.3: Test Email Spam Filtering
```
1. Check if email goes to spam folder
2. If yes:
   - Mark as "Not Spam"
   - Check Brevo dashboard for delivery status
   - May be due to new Brevo account
   - Usually resolves after reputation builds
3. Check Brevo dashboard:
   - Login to brevo.com
   - Dashboard → Transactional → Email Logs
   - Verify email shows "Delivered"
   - Check bounce/complaint rates
```

---

## Phase 4: Database Verification

### Step 4.1: Check OTP Storage
```
1. After sending OTP, go to Supabase Dashboard
2. SQL Editor → New Query:

   SELECT * FROM otp_verifications 
   WHERE email = 'test@example.com'
   ORDER BY created_at DESC LIMIT 1;

3. Verify columns:
   ✓ email: matches test email
   ✓ otp_code: 6 digits (e.g., "123456")
   ✓ otp_hash: long hex string (not plaintext)
   ✓ attempts: 0 (no attempts yet)
   ✓ max_attempts: 5
   ✓ expires_at: timestamp 10 minutes from now
   ✓ verified_at: NULL (not verified yet)
   ✓ created_at: current timestamp
```

### Step 4.2: Check Profile Creation
```
1. After successful OTP verification, query:

   SELECT * FROM profiles 
   WHERE email = 'test@example.com';

2. Verify columns:
   ✓ user_id: UUID (matches auth.users)
   ✓ email: matches entered email
   ✓ full_name: matches entered name
   ✓ verified_email: true
   ✓ is_active: true
   ✓ created_at: current timestamp
   ✓ profile_completion_percentage: 10 (from OTP flow)
```

### Step 4.3: Check Auth User Creation
```
1. After successful registration, query:

   SELECT id, email, email_confirmed_at 
   FROM auth.users 
   WHERE email = 'test@example.com';

2. Verify:
   ✓ User exists in auth.users
   ✓ email matches
   ✓ email_confirmed_at: timestamp (not null)
```

### Step 4.4: Check OTP Verification Mark
```
1. After entering correct OTP, query:

   SELECT * FROM otp_verifications 
   WHERE email = 'test@example.com'
   ORDER BY created_at DESC LIMIT 1;

2. Verify:
   ✓ verified_at: timestamp (no longer NULL)
   ✓ attempts: 1 (was attempted)
   ✓ Can only verify once
```

---

## Phase 5: Error Handling Testing

### Test 5.1: Network Errors
```
Test Case: Brevo API Down
1. Disconnect internet or block Brevo domain
2. Click "Send Verification Code"
3. Expected: Error message "Failed to send code. Please try again."
4. Check console for error details

Test Case: Supabase Down
1. Disconnect internet or block Supabase domain
2. Click "Send Verification Code"
3. Expected: Error message "Database error. Please try again."
4. Check console for error details
```

### Test 5.2: Rate Limiting
```
Test Case: Multiple Rapid Requests
1. Send OTP request
2. Immediately click "Send" again (before first completes)
3. Expected:
   - Second request ignored or queued
   - Loading state shows only once
   - No duplicate records
```

### Test 5.3: Duplicate Email
```
Test Case: Already Registered Email
1. Register with email: test@gmail.com
2. Complete registration
3. Try to register again with same email
4. Expected: Error "Email already registered" (if implemented)
OR
4. Current behavior: Creates new OTP (replaces old one)
```

### Test 5.4: Invalid OTP Hash Verification
```
Database Level Test:
1. Manually corrupt OTP hash in database
2. Try to verify with correct code
3. Expected: Error "Invalid verification code"
4. Attempts counter increments
```

---

## Phase 6: Performance Testing

### Test 6.1: OTP Generation Time
```
Expected: < 50ms
1. Open DevTools: Network tab
2. Send OTP
3. Check sendOtp request time
4. Should be 200-800ms total (mostly Brevo API)
```

### Test 6.2: OTP Verification Time
```
Expected: < 150ms
1. Open DevTools: Network tab
2. Enter correct OTP
3. Check verifyOtpAndSignIn request time
4. Should be 100-200ms total
```

### Test 6.3: Dashboard Load Time
```
Expected: < 2 seconds
1. After successful registration
2. Use DevTools: Performance tab
3. Measure dashboard load time
4. Should be < 2 seconds on broadband
5. Check Lighthouse score (should be 80+)
```

### Test 6.4: Build Performance
```
Expected: < 10 seconds
1. npm run build
2. Check output time
3. Should be 7-9 seconds
4. Bundle size should be reasonable
   - Router chunk: ~750 kB
   - SSR chunk: ~750 kB
   - Client chunk: ~900 kB
```

---

## Phase 7: Mobile Testing

### Test 7.1: Responsive Design
```
Test on Mobile Viewport (375x812):
1. Register page layout
   ✓ Email input takes full width
   ✓ Name input takes full width
   ✓ Button is thumb-accessible
   ✓ No horizontal scroll
2. OTP modal layout
   ✓ 6 input fields stack properly
   ✓ Inputs are touch-friendly (large)
   ✓ Keyboard doesn't cover inputs
3. Registration form layout
   ✓ Form fields are full width
   ✓ Buttons are full width
   ✓ Navigation between steps works
   ✓ Progress bar visible
4. Dashboard layout
   ✓ Profile card is readable
   ✓ Navigation works
   ✓ Content doesn't overflow
```

### Test 7.2: Touch Interaction
```
1. OTP modal on mobile:
   ✓ Tapping field focuses it
   ✓ Keyboard appears automatically
   ✓ Paste functionality works
   ✓ Can tab between fields
2. Form on mobile:
   ✓ Selects are accessible
   ✓ Date picker works
   ✓ Text inputs work
   ✓ Buttons are tappable
```

### Test 7.3: Virtual Keyboard
```
1. Open register page on mobile
2. Tap email input
3. Virtual keyboard should:
   ✓ Appear at bottom
   ✓ Not cover top of screen
   ✓ Show email-optimized keyboard
4. Form should scroll to keep focused field visible
```

---

## Phase 8: Browser Compatibility Testing

### Test 8.1: Desktop Browsers
```
Test on:
- Chrome (latest): Should work perfectly
- Firefox (latest): Should work perfectly
- Safari (latest): Should work perfectly
- Edge (latest): Should work perfectly

Verify:
✓ No console errors
✓ All functionality works
✓ Styling is correct
✓ Responsive design works
```

### Test 8.2: Mobile Browsers
```
Test on:
- Chrome Mobile: Should work perfectly
- Safari Mobile (iOS): Should work perfectly
- Firefox Mobile: Should work perfectly
- Samsung Internet: Should work perfectly

Verify:
✓ No console errors
✓ Touch interactions work
✓ Keyboard handling correct
✓ Layout responsive
```

---

## Phase 9: Security Testing

### Test 9.1: API Key Exposure
```
1. Open Network tab in DevTools
2. Send OTP
3. Verify:
   ✓ BREVO_API_KEY not in network requests
   ✓ BREVO_API_KEY not in frontend code
   ✓ Only server receives API key
4. Check source code:
   - BREVO_API_KEY should only be in .env
   - Should only be read in server functions
```

### Test 9.2: Token Security
```
1. After registration, check localStorage:
   F12 → Application → localStorage
2. Verify:
   ✓ Session token present
   ✓ Token is long and complex
   ✓ Token is not readable plaintext
3. Check Network tab:
   ✓ Token sent in Authorization header
   ✓ Only sent over HTTPS (in production)
   ✓ Not in query parameters
```

### Test 9.3: Password Hashing
```
Database Level:
1. After sending OTP, check otp_verifications table
2. Verify:
   ✓ otp_code: 6 digits (for dev only)
   ✓ otp_hash: long hex string (NOT plaintext)
   ✓ Hash cannot be reversed to get plaintext
3. Verify hash format: "salt_hex:hash_hex"
```

### Test 9.4: RLS Policy Test
```
1. Create two accounts: user1@test.com, user2@test.com
2. Login as user1
3. Try to access user2's profile via Supabase:
   ✓ Should get 403 Forbidden
   ✓ Cannot read other user's data
4. Verify RLS policies in Supabase:
   - Each user can only read own data
   - Server can read all data
```

---

## Phase 10: Production Build Testing

### Test 10.1: Production Build
```bash
npm run build

Verify:
✓ Build completes without errors
✓ No TypeScript errors
✓ Output folder generated (dist/)
✓ All chunks created successfully
✓ Build time < 10 seconds
```

### Test 10.2: Serve Production Build Locally
```bash
# Install serve globally (if not already)
npm install -g serve

# Serve production build
serve dist -l 3000

# Visit http://localhost:3000/register
# Test full flow in production build
```

### Test 10.3: Verify Build Contents
```
dist/ folder should contain:
✓ index.html
✓ assets/ folder with:
   - JS chunks (main, router, etc)
   - CSS files
   - Images/assets
✓ No .env files (not included)
✓ No source maps (for security)
✓ All files minified
✓ No uncompiled TypeScript
```

---

## Checklist Template

Print and use this checklist for comprehensive testing:

```
PHASE 1: LOCAL SETUP ☐
  ☐ Environment variables verified
  ☐ Supabase connection working
  ☐ Database tables created
  ☐ Brevo API key valid

PHASE 2: DEVELOPMENT TESTING ☐
  ☐ Dev server starts successfully
  ☐ Register page loads
  ☐ Email validation works
  ☐ OTP sends successfully
  ☐ OTP email received
  ☐ OTP input works
  ☐ Resend functionality works
  ☐ Registration form completes
  ☐ Dashboard loads after registration
  ☐ Session persists on refresh
  ☐ Protected routes work

PHASE 3: EMAIL VERIFICATION ☐
  ☐ Email format is professional
  ☐ Email contains correct code
  ☐ Email renders in Gmail
  ☐ Email renders in Outlook
  ☐ Email not in spam folder
  ☐ Email delivery confirmed in Brevo

PHASE 4: DATABASE VERIFICATION ☐
  ☐ OTP stored correctly
  ☐ OTP hash is secure (not plaintext)
  ☐ Profile created after verification
  ☐ Auth user created in auth.users
  ☐ OTP marked as verified
  ☐ Attempts counter works correctly

PHASE 5: ERROR HANDLING ☐
  ☐ Network errors handled gracefully
  ☐ Rate limiting works
  ☐ Duplicate email handling
  ☐ Invalid OTP rejected
  ☐ Expired OTP rejected
  ☐ Too many attempts rejected

PHASE 6: PERFORMANCE ☐
  ☐ OTP generation < 50ms
  ☐ OTP sending < 800ms
  ☐ OTP verification < 150ms
  ☐ Dashboard load < 2s
  ☐ Build time < 10s

PHASE 7: MOBILE ☐
  ☐ Responsive on 375px width
  ☐ Touch interactions work
  ☐ Virtual keyboard handled
  ☐ Inputs are readable
  ☐ No horizontal scroll

PHASE 8: BROWSERS ☐
  ☐ Chrome desktop
  ☐ Firefox desktop
  ☐ Safari desktop
  ☐ Chrome mobile
  ☐ Safari mobile

PHASE 9: SECURITY ☐
  ☐ API keys not exposed
  ☐ Tokens are secure
  ☐ Hashing is secure
  ☐ RLS policies work
  ☐ No plaintext storage

PHASE 10: PRODUCTION ☐
  ☐ Production build succeeds
  ☐ Build has no errors
  ☐ Serve build locally works
  ☐ All assets present
  ☐ Production build tested

READY FOR DEPLOYMENT: ☐ ALL PHASES COMPLETE
```

---

## Troubleshooting During Testing

### OTP Not Sending
```
1. Check .env has BREVO_API_KEY
2. Check Brevo API key is valid (try curl test)
3. Check browser console for errors
4. Check terminal output for server errors
5. Verify Supabase connection working
6. Check Brevo account has email credit
```

### Email Not Received
```
1. Wait 5-10 seconds (Brevo is slow sometimes)
2. Check spam/promotions folder
3. Check Brevo dashboard for delivery status
4. Verify Brevo API key and sender email match
5. Check inbox rules don't filter emails
6. Try different email address
```

### Database Error
```
1. Check Supabase project is running
2. Verify migration was executed
3. Check tables exist: SELECT * FROM otp_verifications;
4. Verify RLS policies aren't blocking reads
5. Check Supabase connection string in .env
6. Check database has enough space
```

### Session Not Persisting
```
1. Check localStorage is enabled (F12 → Application)
2. Verify session token is stored
3. Check cookie settings (may be blocked)
4. Check if private browsing blocks storage
5. Try in normal browsing mode
6. Clear cache and try again
```

### Build Errors
```
1. Clear node_modules: rm -r node_modules
2. Clear npm cache: npm cache clean --force
3. Reinstall: npm install
4. Try build again: npm run build
5. Check for TypeScript errors: npm run type-check
6. Check console for specific error messages
```

---

## Success Criteria

Your implementation is **complete and working** when:

✅ User can register with email + name
✅ OTP sends within 5 seconds
✅ Email arrives within 10 seconds
✅ User can enter 6-digit code
✅ Correct code verifies successfully
✅ User redirected to dashboard
✅ Dashboard shows user profile
✅ Session persists on page refresh
✅ Cannot access dashboard without auth
✅ No errors in browser console
✅ No errors in server logs
✅ Mobile responsive
✅ Works on all major browsers
✅ Production build succeeds
✅ All security checks pass

---

## Next Steps After Testing

1. **If all tests pass**: Proceed to Vercel deployment
2. **If tests fail**: Check troubleshooting section above
3. **If specific feature broken**: Check documentation in ARCHITECTURE.md
4. **If need to customize**: See code comments for extension points
5. **Ready for users**: Deploy to Vercel and share URL

---

Good luck with testing! 🎉
