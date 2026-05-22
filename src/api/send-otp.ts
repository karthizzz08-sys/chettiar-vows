import { z } from "zod";
import { isServerEnvValid, getServerEnv } from "@/integrations/supabase/env.server";
import { isClientEnvValid } from "@/integrations/supabase/env";
import { supabase } from "@/integrations/supabase/client";
import { sendBrevoEmail, generateOtpEmailTemplate } from "@/integrations/brevo/email";
import { generateOtp, hashOtp, getOtpExpiryTime } from "@/lib/otp.utils";

// Validation schema for OTP request
const sendOtpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).transform(e => e.toLowerCase()),
});

/**
 * POST /api/send-otp
 * 
 * Handles OTP generation and sending via Brevo email.
 * 
 * Request body:
 * {
 *   name: string (2-100 chars)
 *   email: string (valid email)
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   expiresInSeconds?: number (600 seconds = 10 minutes)
 * }
 */
export async function POST(request: Request): Promise<Response> {
  // Log incoming request
  console.log("[OTP API] POST /api/send-otp - Incoming request");

  try {
    // Validate environment variables
    if (!isClientEnvValid()) {
      console.error("[OTP API] Client environment not configured");
      return Response.json(
        {
          success: false,
          message: "Server configuration error: Supabase client not configured",
        },
        { status: 500 }
      );
    }

    if (!isServerEnvValid()) {
      const errors = getServerEnv.errors || [];
      console.error("[OTP API] Server environment not configured", errors);
      return Response.json(
        {
          success: false,
          message: "Server configuration error: Missing server environment variables",
        },
        { status: 500 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
      console.log("[OTP API] Request body parsed successfully", {
        email: (body as any)?.email ? "(redacted)" : undefined,
      });
    } catch (error) {
      console.error("[OTP API] Failed to parse request body", error);
      return Response.json(
        {
          success: false,
          message: "Invalid request body: Expected valid JSON",
        },
        { status: 400 }
      );
    }

    // Validate required fields exist
    if (!body || typeof body !== "object") {
      console.error("[OTP API] Request body is not an object", { body });
      return Response.json(
        {
          success: false,
          message: "Invalid request: Body must be a JSON object",
        },
        { status: 400 }
      );
    }

    const { name, email } = body as any;

    if (!name || !email) {
      console.error("[OTP API] Missing required fields", {
        namePresent: !!name,
        emailPresent: !!email,
      });
      return Response.json(
        {
          success: false,
          message: "Missing required fields: name and email are required",
        },
        { status: 400 }
      );
    }

    // Validate input against schema
    let validatedData: z.infer<typeof sendOtpSchema>;
    try {
      validatedData = sendOtpSchema.parse({ name, email });
      console.log("[OTP API] Input validation passed", {
        email: validatedData.email,
        nameLength: validatedData.name.length,
      });
    } catch (error) {
      const zodError = error instanceof z.ZodError ? error.errors[0]?.message : "Invalid input";
      console.error("[OTP API] Input validation failed", zodError);
      return Response.json(
        {
          success: false,
          message: `Validation error: ${zodError}`,
        },
        { status: 400 }
      );
    }

    const { email: validatedEmail, name: validatedName } = validatedData;

    // Generate 6-digit OTP
    const otp = generateOtp();
    console.log("[OTP API] OTP generated (redacted for security)");

    // Hash OTP using PBKDF2
    const { hashedOtp, salt } = hashOtp(otp);
    console.log("[OTP API] OTP hashed successfully");

    // Calculate expiry time (10 minutes from now)
    const expiresAt = getOtpExpiryTime(10);

    // Store OTP in Supabase
    console.log("[OTP API] Storing OTP in Supabase...");
    const { error: dbError } = await supabase.from("otp_verifications").insert({
      email: validatedEmail,
      otp_code: otp, // Store plaintext for this request, hashed version in otp_hash
      otp_hash: `${salt}:${hashedOtp}`,
      attempts: 0,
      expires_at: expiresAt.toISOString(),
      verified_at: null,
    });

    if (dbError) {
      console.error("[OTP API] Failed to store OTP in database", dbError);
      return Response.json(
        {
          success: false,
          message: "Failed to generate OTP. Please try again.",
        },
        { status: 500 }
      );
    }

    console.log("[OTP API] OTP stored in database successfully");

    // Generate email template
    const emailTemplate = generateOtpEmailTemplate(validatedEmail, otp, 10);
    console.log("[OTP API] Email template generated");

    // Send OTP via Brevo
    console.log("[OTP API] Sending OTP email via Brevo...");
    const emailSendResult = await sendBrevoEmail({
      to: validatedEmail,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.htmlContent,
      textContent: emailTemplate.textContent,
    });

    if (!emailSendResult.success) {
      console.error("[OTP API] Failed to send email via Brevo", emailSendResult.error);
      return Response.json(
        {
          success: false,
          message: emailSendResult.error || "Failed to send OTP email",
        },
        { status: 500 }
      );
    }

    console.log("[OTP API] OTP email sent successfully", {
      email: validatedEmail,
      timestamp: new Date().toISOString(),
    });

    // Success response
    return Response.json(
      {
        success: true,
        message: "OTP sent successfully to your email",
        expiresInSeconds: 600, // 10 minutes
      },
      { status: 200 }
    );
  } catch (error) {
    // Catastrophic error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[OTP API] Unexpected error", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
