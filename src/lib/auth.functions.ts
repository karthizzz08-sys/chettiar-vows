import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildOtpEmail } from "./email-template";

const emailSchema = z.object({
  email: z.string().trim().email().max(255).toLowerCase(),
});

export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: data.email,
    });

    if (error || !linkData?.properties?.email_otp) {
      console.error("[auth] generateLink failed", error);
      throw new Error("Could not start sign-in. Please try again.");
    }

    const otp = linkData.properties.email_otp;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!LOVABLE_API_KEY || !BREVO_API_KEY) {
      console.error("[auth] missing connector keys");
      throw new Error("Email service is not configured.");
    }

    const { subject, html } = buildOtpEmail(otp);

    const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@chettiarconnect.com";
    const senderName = process.env.BREVO_SENDER_NAME || "Chettiar Connect";

    const res = await fetch("https://connector-gateway.lovable.dev/brevo/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: data.email }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[auth] Brevo send failed", res.status, body);
      throw new Error("We couldn't send the code. Please check your email address.");
    }

    return { ok: true, expiresInSeconds: 300 };
  });
