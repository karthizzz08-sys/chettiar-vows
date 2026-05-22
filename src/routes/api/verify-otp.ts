import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { verifyOtpHash, isOtpExpired } from "@/lib/otp.utils";
import { getServerEnvVar, validateServerEnv } from "@/lib/env.config";

// Validation schema
const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const Route = createFileRoute("/api/verify-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          console.log("[OTP Verify API] Starting verification process");

          // Parse request body
          let body: unknown;
          try {
            body = await request.json();
            console.log("[OTP Verify API] Received body:", { email: (body as any)?.email, otp: "***" });
          } catch (e) {
            console.error("[OTP Verify API] Failed to parse JSON:", e);
            return Response.json(
              {
                success: false,
                message: "Invalid request body - JSON parsing failed",
              },
              { status: 400 }
            );
          }

          // Validate body structure
          if (!body || typeof body !== "object") {
            console.error("[OTP Verify API] Body is not an object:", typeof body);
            return Response.json(
              {
                success: false,
                message: "Invalid request body - must be a JSON object",
              },
              { status: 400 }
            );
          }

          // Validate with Zod
          let validated;
          try {
            validated = verifyOtpSchema.parse(body);
            console.log("[OTP Verify API] ✓ Validation passed");
          } catch (e) {
            const errors = e instanceof z.ZodError ? e.errors : [];
            const firstError = errors[0];
            const message = firstError
              ? `Validation error: ${firstError.message}`
              : "Invalid email or OTP format";
            console.error("[OTP Verify API] Validation failed:", message);
            return Response.json(
              {
                success: false,
                message,
              },
              { status: 400 }
            );
          }

          const { email, otp } = validated;

          // Validate server environment variables
          const envValidation = validateServerEnv();
          if (!envValidation.isValid) {
            console.error("[OTP Verify API] ✗ Environment validation failed:");
            envValidation.errors.forEach((err) => console.error(`[OTP Verify API]   - ${err}`));
            return Response.json(
              {
                success: false,
                message:
                  "Server configuration error: Missing required environment variables. " +
                  "Contact support if this persists.",
              },
              { status: 500 }
            );
          }

          // Initialize Supabase client
          const supabaseUrl = getServerEnvVar("SUPABASE_URL");
          const supabaseKey = getServerEnvVar("SUPABASE_SERVICE_ROLE_KEY");

          if (!supabaseUrl || !supabaseKey) {
            console.error("[OTP Verify API] ✗ Missing Supabase configuration");
            return Response.json(
              { success: false, message: "Server configuration error" },
              { status: 500 }
            );
          }

          const supabase = createClient(supabaseUrl, supabaseKey);
          console.log("[OTP Verify API] ✓ Supabase client initialized");

          // Fetch OTP record from database
          const { data: otpRecord, error: fetchError } = await supabase
            .from("otp_verifications")
            .select("*")
            .eq("email", email)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (fetchError || !otpRecord) {
            console.error("[OTP Verify API] ✗ No OTP record found:", fetchError);
            return Response.json(
              { success: false, message: "No verification code found for this email" },
              { status: 400 }
            );
          }

          console.log("[OTP Verify API] ✓ OTP record found");

          // Check if OTP is expired
          if (isOtpExpired(new Date(otpRecord.expires_at))) {
            console.error("[OTP Verify API] ✗ OTP has expired");
            return Response.json(
              { success: false, message: "Verification code has expired - please request a new one" },
              { status: 400 }
            );
          }

          console.log("[OTP Verify API] ✓ OTP is not expired");

          // Check if already verified
          if (otpRecord.verified_at) {
            console.error("[OTP Verify API] ✗ OTP already verified");
            return Response.json(
              { success: false, message: "This code has already been used" },
              { status: 400 }
            );
          }

          console.log("[OTP Verify API] ✓ OTP not yet verified");

          // Check attempt count
          if ((otpRecord.attempts || 0) >= 3) {
            console.error("[OTP Verify API] ✗ Too many verification attempts");
            return Response.json(
              { success: false, message: "Too many failed attempts - request a new code" },
              { status: 400 }
            );
          }

          console.log("[OTP Verify API] ✓ Attempt count OK");

          // Verify OTP hash
          const isValid = verifyOtpHash(otp, otpRecord.otp_hash);
          if (!isValid) {
            console.error("[OTP Verify API] ✗ OTP verification failed");

            // Increment attempts
            await supabase
              .from("otp_verifications")
              .update({ attempts: (otpRecord.attempts || 0) + 1 })
              .eq("id", otpRecord.id);

            return Response.json(
              { success: false, message: "Invalid verification code" },
              { status: 400 }
            );
          }

          console.log("[OTP Verify API] ✓ OTP hash verified");

          // Mark OTP as verified
          const { error: updateError } = await supabase
            .from("otp_verifications")
            .update({ verified_at: new Date().toISOString() })
            .eq("id", otpRecord.id);

          if (updateError) {
            console.error("[OTP Verify API] ✗ Failed to mark OTP as verified:", updateError);
            return Response.json(
              { success: false, message: "Failed to verify - please try again" },
              { status: 500 }
            );
          }

          console.log("[OTP Verify API] ✓ OTP marked as verified in database");

          // Check if user exists
          const { data: existingUser } = await supabase.auth.admin.getUserById(
            otpRecord.user_id || ""
          );

          let userId = otpRecord.user_id;

          // If user doesn't exist, create one
          if (!existingUser) {
            console.log("[OTP Verify API] Creating new user...");

            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-12);

            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password: tempPassword,
              options: {
                data: { email_verified: true },
              },
            });

            if (signUpError || !signUpData.user) {
              console.error("[OTP Verify API] ✗ User creation failed:", signUpError);
              return Response.json(
                { success: false, message: "Failed to create user account" },
                { status: 500 }
              );
            }

            userId = signUpData.user.id;
            console.log("[OTP Verify API] ✓ New user created:", userId);

            // Create profile
            const { error: profileError } = await supabase.from("profiles").insert({
              user_id: userId,
              email,
              verified_email: true,
              profile_completion_percentage: 0,
            });

            if (profileError) {
              console.error("[OTP Verify API] ✗ Profile creation failed:", profileError);
              return Response.json(
                { success: false, message: "Failed to create user profile" },
                { status: 500 }
              );
            }

            console.log("[OTP Verify API] ✓ Profile created");
          } else {
            console.log("[OTP Verify API] ✓ Existing user found");

            // Update profile to mark email as verified
            const { error: updateProfileError } = await supabase
              .from("profiles")
              .update({ verified_email: true })
              .eq("user_id", userId);

            if (updateProfileError) {
              console.error("[OTP Verify API] ✗ Failed to update profile:", updateProfileError);
              return Response.json(
                { success: false, message: "Failed to update user profile" },
                { status: 500 }
              );
            }

            console.log("[OTP Verify API] ✓ Profile updated");
          }

          // Generate session token
          const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
            user_id: userId,
            isNotificationEmail: false,
          });

          if (sessionError || !sessionData.session) {
            console.error("[OTP Verify API] ✗ Session creation failed:", sessionError);
            // Don't fail here - session can be created after profile completion
            console.log("[OTP Verify API] Proceeding without session (will be created after profile)");
          }

          console.log("[OTP Verify API] ✓ Email verification successful");

          return Response.json(
            {
              success: true,
              message: "Email verified successfully! Please complete your profile.",
              user: {
                id: userId,
                email,
                email_confirmed_at: new Date().toISOString(),
              },
              session: sessionData?.session || null,
            },
            { status: 200 }
          );
        } catch (error) {
          console.error("[OTP Verify API] ✗ Unexpected error:", error);
          const message = error instanceof Error ? error.message : "Unexpected error";
          return Response.json(
            {
              success: false,
              message: `Verification error: ${message}`,
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
