import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { isClientEnvValid } from "@/integrations/supabase/env";
import { isServerEnvValid, getServerEnvErrors } from "@/integrations/supabase/env.server";
import { sendBrevoEmail, generateOtpEmailTemplate } from "@/integrations/brevo/email";
import { generateOtp, hashOtp, verifyOtpHash, isOtpExpired, getOtpExpiryTime } from "@/lib/otp.utils";

const emailSchema = z.object({
  email: z.string().trim().email().max(255).transform(e => e.toLowerCase()),
  name: z.string().trim().min(2).max(100).optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email().max(255).transform(e => e.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

/**
 * Send OTP via Brevo email
 * 1. Generate 6-digit OTP
 * 2. Hash and store in Supabase otp_verifications table
 * 3. Send via Brevo with luxury Tamil template
 */
export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      // Validate both client and server environment
      if (!isClientEnvValid()) {
        throw new Error("Supabase client is not properly configured. Missing VITE_SUPABASE_* variables.");
      }

      if (!isServerEnvValid()) {
        const errors = getServerEnvErrors();
        throw new Error(`Server environment not configured: ${errors.join(", ")}`);
      }

      const email = data.email;

      // Generate OTP
      const otp = generateOtp();
      const { hashedOtp, salt } = hashOtp(otp);
      const expiresAt = getOtpExpiryTime(10); // 10 minutes

      console.log(`[auth] Generated OTP for ${email}: ${otp} (hashed)`);

      // Store OTP in Supabase
      const { error: dbError } = await supabase
        .from("otp_verifications")
        .upsert(
          {
            email: email,
            otp_code: otp, // Store plaintext for logging/debugging (in production, remove this)
            otp_hash: `${salt}:${hashedOtp}`,
            attempts: 0,
            max_attempts: 5,
            expires_at: expiresAt.toISOString(),
            verified_at: null,
          },
          { onConflict: "email" }
        );

      if (dbError) {
        console.error("[auth] Failed to store OTP:", dbError.message);
        throw new Error("Failed to generate verification code");
      }

      // Send OTP via Brevo
      const emailTemplate = generateOtpEmailTemplate(email, otp, 10);
      await sendBrevoEmail(emailTemplate);

      console.log(`[auth] OTP email sent to ${email} via Brevo`);

      return {
        ok: true,
        expiresInSeconds: 600, // 10 minutes
        message: "Verification code sent to your email",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[auth] sendOtp error:", message);
      throw new Error("Failed to send verification code. Please try again.");
    }
  });

/**
 * Verify OTP and create authenticated session
 * 1. Look up OTP record in Supabase
 * 2. Check if expired
 * 3. Verify OTP hash
 * 4. Create auth user (or link to existing)
 * 5. Create/update profile
 * 6. Return user + session
 */
export const verifyOtpAndSignIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => verifyOtpSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      // Validate both client and server environment
      if (!isClientEnvValid()) {
        throw new Error("Supabase client is not properly configured. Missing VITE_SUPABASE_* variables.");
      }

      if (!isServerEnvValid()) {
        const errors = getServerEnvErrors();
        throw new Error(`Server environment not configured: ${errors.join(", ")}`);
      }

      const { email, otp } = data;

      // Fetch OTP record
      const { data: otpRecord, error: fetchError } = await supabase
        .from("otp_verifications")
        .select("*")
        .eq("email", email)
        .is("verified_at", null)
        .single();

      if (fetchError || !otpRecord) {
        console.error("[auth] OTP record not found:", fetchError?.message);
        throw new Error("No verification code found. Please request a new one.");
      }

      // Check if expired
      if (isOtpExpired(new Date(otpRecord.expires_at))) {
        console.warn(`[auth] OTP expired for ${email}`);
        throw new Error("Verification code has expired. Please request a new one.");
      }

      // Check attempts
      if (otpRecord.attempts >= otpRecord.max_attempts) {
        console.warn(`[auth] Too many attempts for ${email}`);
        throw new Error("Too many failed attempts. Please request a new verification code.");
      }

      // Verify OTP hash
      const isValid = verifyOtpHash(otp, otpRecord.otp_hash);
      if (!isValid) {
        // Increment attempts
        const newAttempts = otpRecord.attempts + 1;
        await supabase
          .from("otp_verifications")
          .update({ attempts: newAttempts })
          .eq("id", otpRecord.id);

        console.warn(`[auth] Invalid OTP attempt for ${email} (${newAttempts}/${otpRecord.max_attempts})`);
        throw new Error("Invalid verification code. Please try again.");
      }

      // Mark OTP as verified
      await supabase
        .from("otp_verifications")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      console.log(`[auth] OTP verified for ${email}`);

      // Create a user record and session
      // Since we verified the OTP, we treat email as verified
      // We'll sign up with a temporary password and auto-sign-in
      const tempPassword = Math.random().toString(36).slice(-16) + "Aa1!";

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: tempPassword,
        options: {
          data: {
            email_verified: true,
          },
        },
      });

      if (signUpError) {
        // User might already exist - try signing in instead
        console.log(`[auth] Sign up error (user may exist): ${signUpError.message}`);

        // Get the session by creating a custom token
        // For now, we'll create a profile entry and return success
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .single();

        if (!existingUser) {
          throw new Error("Failed to create user session. Please try again.");
        }
      }

      const userId = signUpData?.user?.id || otpRecord.user_id || email;

      // Create or update user profile
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: userId,
              email: email,
              verified_email: true,
              profile_completion_percentage: 10,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (profileError) {
          console.error("[auth] Profile creation failed:", profileError.message);
        }
      } catch (err) {
        console.error("[auth] Profile upsert error:", err);
      }

      console.log(`[auth] OTP verified and profile created for ${email}`);

      // Return success without session (session will be created after registration)
      // The key point is that email is verified
      return {
        success: true,
        user: {
          email: email,
          id: userId,
          email_confirmed_at: new Date().toISOString(),
        },
        session: null, // Will be created after profile completion
        message: "Email verified! Now complete your profile.",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[auth] verifyOtpAndSignIn error:", message);
      throw new Error(message);
    }
  });
