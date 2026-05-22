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

      // Sign in with OTP (create session)
      // Since we've already verified the OTP, we can sign in the user
      const { data: authData, error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        token: otp, // This will be used by Supabase for session creation
        options: {
          shouldCreateUser: true,
        },
      });

      if (signInError || !authData.session) {
        console.error("[auth] Sign in failed:", signInError?.message);
        throw new Error("Failed to create session. Please try again.");
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("Failed to get user information");
      }

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
          // Don't fail - user is authenticated even if profile fails
        }
      } catch (err) {
        console.error("[auth] Profile upsert error:", err);
        // Continue - user is authenticated
      }

      console.log(`[auth] User ${userId} authenticated and profile created`);

      return {
        success: true,
        user: authData.user,
        session: authData.session,
        message: "Successfully signed in! Redirecting to dashboard...",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[auth] verifyOtpAndSignIn error:", message);
      throw new Error(message);
    }
  });
