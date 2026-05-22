/**
 * Brevo Email Service
 * Handles sending OTP emails via Brevo (formerly Sendinblue)
 * Server-side only - never expose API key to frontend
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, isServerEnvValid, getServerEnvErrors } from "@/integrations/supabase/env.server";

interface BrevoEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Send email via Brevo API
 * Returns { success: boolean, error?: string }
 */
export async function sendBrevoEmail(options: BrevoEmailOptions): Promise<{ success: boolean; error?: string }> {
  // Validate server environment
  if (!isServerEnvValid()) {
    const errors = getServerEnvErrors();
    const errorMsg = `Server environment not configured: ${errors.join(", ")}`;
    console.error("[brevo]", errorMsg);
    return { success: false, error: errorMsg };
  }

  const apiKey = getServerEnv("brevoApiKey");
  if (!apiKey) {
    const errorMsg = "BREVO_API_KEY is not configured. Please add it to your .env file.";
    console.error("[brevo]", errorMsg);
    return { success: false, error: errorMsg };
  }

  const senderEmail = getServerEnv("brevoSenderEmail", "noreply@chettiarconnect.com")!;
  const senderName = getServerEnv("brevoSenderName", "Chettiar Connect")!;

  try {
    console.log(`[brevo] Sending email to ${options.to} from ${senderEmail}`);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: options.to,
            name: options.to.split("@")[0],
          },
        ],
        subject: options.subject,
        htmlContent: options.htmlContent,
        textContent: options.textContent || "Your OTP code",
        replyTo: {
          email: senderEmail,
          name: senderName,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.detail || response.statusText || "Unknown error";
      console.error("[brevo] Email send failed:", errorMsg);
      return { success: false, error: `Failed to send email: ${errorMsg}` };
    }

    const result = await response.json();
    console.log("[brevo] Email sent successfully:", result.messageId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[brevo] sendBrevoEmail error:", message);
    return { success: false, error: `Failed to send email: ${message}` };
  }
}

/**
 * Send OTP email with luxury Tamil wedding template
 */
export function generateOtpEmailTemplate(
  email: string,
  otp: string,
  expiresInMinutes: number = 10
): BrevoEmailOptions {
  const expiryTime = new Date(Date.now() + expiresInMinutes * 60 * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f5d77a 0%, #d4af37 100%); padding: 2px; }
    .content { background: #faf8f3; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #8b1a1a; margin-bottom: 10px; }
    .subtitle { color: #666; font-size: 14px; }
    .main-text { color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0; }
    .otp-section { background: linear-gradient(135deg, #8b1a1a 0%, #a52a2a 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 25px 0; }
    .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; }
    .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 15px 0; font-family: 'Courier New', monospace; }
    .expiry { font-size: 12px; opacity: 0.85; margin-top: 15px; }
    .security-note { background: #fff8e6; border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0; font-size: 13px; color: #666; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <!-- Header -->
      <div class="header">
        <div class="logo">✦ Chettiar Connect ✦</div>
        <div class="subtitle">Tamil Chettiar Matrimony | நாகரத்தர் சேட்டியார் திருமணம்</div>
      </div>

      <div class="divider"></div>

      <!-- Main Content -->
      <p class="main-text">
        Vanakkam! 🙏
      </p>
      <p class="main-text">
        Welcome to Chettiar Connect. We're honored to help you find your perfect match within our vibrant Chettiar community.
      </p>

      <!-- OTP Section -->
      <div class="otp-section">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry">Valid for ${expiresInMinutes} minutes • Expires at ${expiryTime} IST</div>
      </div>

      <!-- Security Warning -->
      <div class="security-note">
        <strong>🔒 Security Notice:</strong> This code is personal to you. Never share it with anyone, not even Chettiar Connect staff. We will never ask for this code.
      </div>

      <!-- Instructions -->
      <p class="main-text">
        Please use this code to verify your email address and complete your registration on Chettiar Connect. This is a one-time verification to ensure the security of your account.
      </p>

      <p class="main-text">
        If you did not request this verification code, please ignore this email or contact us immediately at support@chettiarconnect.com
      </p>

      <!-- Footer -->
      <div class="divider"></div>
      <div class="footer">
        <p>
          © 2026 Chettiar Connect. All rights reserved.<br>
          Crafted with devotion for the Chettiar community ✦<br>
          <strong>Chennai • Karaikudi • Madurai</strong><br>
          <a href="mailto:support@chettiarconnect.com" style="color: #d4af37; text-decoration: none;">support@chettiarconnect.com</a> | +91 98000 00000
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Vanakkam from Chettiar Connect! 🙏

Your Verification Code: ${otp}
Valid for ${expiresInMinutes} minutes • Expires at ${expiryTime} IST

Please use this code to verify your email address.

SECURITY NOTICE: This code is personal to you. Never share it with anyone.

If you did not request this, please ignore this email.

---
Chettiar Connect - Tamil Chettiar Matrimony
support@chettiarconnect.com | +91 98000 00000
  `;

  return {
    to: email,
    subject: `Your Chettiar Connect Verification Code: ${otp}`,
    htmlContent,
    textContent,
  };
}
