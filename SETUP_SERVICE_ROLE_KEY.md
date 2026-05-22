# 🔑 Setup Guide: Supabase Service Role Key

## Issue
The `/api/verify-otp` endpoint requires `SUPABASE_SERVICE_ROLE_KEY` to:
- Create/manage user accounts
- Create authenticated sessions
- Query admin functions

Currently, this is commented out in `.env`:
```bash
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Solution: Get Your Service Role Key

### Step 1: Go to Supabase Dashboard
```
https://app.supabase.com/project/kuwhoodnbbvwtiyfwfhc
```

### Step 2: Navigate to API Settings
- Left sidebar: **Project Settings**
- Tab: **API**
- Section: **Project API keys**

### Step 3: Copy Service Role Key
You'll see two keys:
- `anon` - Public key (already in `.env` as `VITE_SUPABASE_ANON_KEY`)
- `service_role` - Private key (SECRET - DO NOT COMMIT)

Copy the `service_role` key.

### Step 4: Update .env File

**Open** `c:\chettiar-vows\.env`

**Find**:
```bash
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Replace with**:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Paste your actual service role key)

### Step 5: Verify Setup

```bash
cd c:\chettiar-vows

# Check the key is set (don't print it!)
grep "SUPABASE_SERVICE_ROLE_KEY" .env | grep -v "^#"
```

Should output:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 6: Restart Dev Server

```bash
npm run dev
```

---

## ⚠️ Security Notes

✅ **DO NOT commit `.env` to git** (already in `.gitignore`)
✅ **DO NOT share the service role key** (it's private)
✅ **DO NOT push with the key exposed** (GitHub will block it)
✅ **ROTATE the key** if it's ever exposed

### For Production/Deployment

Use your hosting platform's secrets:
- **Vercel**: Environment Variables in Settings
- **Netlify**: Build & Deploy → Environment
- **Docker**: Docker secrets or environment variables
- **Cloudflare Workers**: Environment Variables (via wrangler.toml)

Set the variable:
```
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

---

## Minimal Environment Variables Needed

**For Local Development** (in `.env`):
```bash
# Client-side (safe to expose)
VITE_SUPABASE_URL=https://kuwhoodnbbvwtiyfwfhc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# Server-side (SECRET - never expose)
SUPABASE_URL=https://kuwhoodnbbvwtiyfwfhc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Brevo Email Service (SECRET)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=your-email@gmail.com
BREVO_SENDER_NAME=Chettiar Connect
```

---

## Testing After Setup

### 1. Build
```bash
npm run build
```
Expected: ✓ built in ~8s, 0 errors

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test OTP Flow
```
http://localhost:8081/register
```

1. Enter email and name
2. Click "Send Verification Code"
3. Enter 6-digit OTP
4. ✅ Should verify successfully
5. ✅ Registration form should appear

### 4. Check Server Logs
Look for:
```
[OTP Verify API] ✓ Email verification successful
```

---

## Troubleshooting

### "Server configuration error" when verifying OTP

**Cause**: `SUPABASE_SERVICE_ROLE_KEY` is missing or empty

**Fix**: Follow steps 1-5 above to add the key

### "undefined" in logs for SUPABASE_SERVICE_ROLE_KEY

**Cause**: Environment variable not being read

**Fix**:
```bash
# Stop dev server (Ctrl+C)
# Edit .env
# Restart dev server
```

### "Missing Supabase configuration" error

**Cause**: Either `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is not set

**Fix**: Check both are uncommented in `.env`

---

## Command Reference

```bash
# Check if key is set (don't print the actual value)
grep "SUPABASE_SERVICE_ROLE_KEY=" .env

# Verify all required vars
echo "=== Client Vars ===" && \
grep "VITE_SUPABASE" .env && \
echo "=== Server Vars ===" && \
grep "SUPABASE_" .env | grep -v "VITE_" && \
echo "=== Email Vars ===" && \
grep "BREVO_" .env
```

---

## ✅ Complete

Once you've added the `SUPABASE_SERVICE_ROLE_KEY`:

1. ✅ `/api/verify-otp` will work
2. ✅ OTP verification will create users
3. ✅ Session management will work
4. ✅ Profile creation will succeed
5. ✅ Registration flow will complete

**Next Steps**:
1. Get your service role key from Supabase dashboard
2. Add it to `.env`
3. Restart dev server
4. Test the registration flow
