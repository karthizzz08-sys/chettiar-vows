/**
 * POST /api/send-otp
 * 
 * TanStack Start server route for sending OTP via email
 * - Validates name and email
 * - Generates 6-digit OTP
 * - Hashes OTP with PBKDF2
 * - Stores in Supabase otp_verifications table
 * - Sends via Brevo email service
 * - Implements rate limiting
 * - Returns JSON response with proper status codes
 */

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { isServerEnvValid } from '@/integrations/supabase/env.server';
import { isClientEnvValid } from '@/integrations/supabase/env';
import { supabase } from '@/integrations/supabase/client';
import { sendBrevoEmail, generateOtpEmailTemplate } from '@/integrations/brevo/email';
import { generateOtp, hashOtp, getOtpExpiryTime } from '@/lib/otp.utils';

// Validation schema
const sendOtpRequestSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255),
});

type SendOtpRequest = z.infer<typeof sendOtpRequestSchema>;

// In-memory rate limiting (production: use Redis)
const rateLimitMap = new Map<string, { attempts: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 3; // Max 3 OTP requests per minute per email

/**
 * Check and enforce rate limiting
 */
function checkRateLimit(email: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const limit = rateLimitMap.get(email);

  // Reset if window expired
  if (limit && now > limit.resetTime) {
    rateLimitMap.delete(email);
  }

  const currentLimit = rateLimitMap.get(email);

  if (!currentLimit) {
    rateLimitMap.set(email, {
      attempts: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (currentLimit.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      message: `Too many OTP requests. Please try again in ${Math.ceil((currentLimit.resetTime - now) / 1000)} seconds.`,
    };
  }

  currentLimit.attempts += 1;
  return { allowed: true };
}

/**
 * Check for duplicate unverified OTP
 */
async function hasPendingOtp(email: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('otp_verifications')
      .select('id')
      .eq('email', email)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    return !!data;
  } catch {
    // No pending OTP found (expected)
    return false;
  }
}

export const Route = createFileRoute('/api/send-otp')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.log('[OTP API] POST /api/send-otp');

        try {
          // ============================================
          // 1. Validate Environment
          // ============================================
          if (!isClientEnvValid()) {
            console.error('[OTP API] Client environment not configured');
            return Response.json(
              {
                success: false,
                message: 'Server configuration error: Supabase not configured',
              },
              { status: 500 }
            );
          }

          if (!isServerEnvValid()) {
            console.error('[OTP API] Server environment not configured');
            return Response.json(
              {
                success: false,
                message: 'Server configuration error: Missing environment variables',
              },
              { status: 500 }
            );
          }

          // ============================================
          // 2. Parse Request Body
          // ============================================
          let body: unknown;
          try {
            body = await request.json();
            console.log('[OTP API] Request body parsed');
          } catch (error) {
            console.error('[OTP API] Failed to parse request body:', error);
            return Response.json(
              {
                success: false,
                message: 'Invalid request: Expected valid JSON',
              },
              { status: 400 }
            );
          }

          // ============================================
          // 3. Validate Request Body
          // ============================================
          if (!body || typeof body !== 'object') {
            console.error('[OTP API] Body is not an object');
            return Response.json(
              {
                success: false,
                message: 'Invalid request: Body must be a JSON object',
              },
              { status: 400 }
            );
          }

          let validatedData: SendOtpRequest;
          try {
            validatedData = sendOtpRequestSchema.parse(body);
            console.log('[OTP API] Validation passed', { email: validatedData.email });
          } catch (error) {
            const zodError = error instanceof z.ZodError ? error.errors[0]?.message : 'Invalid input';
            console.error('[OTP API] Validation failed:', zodError);
            return Response.json(
              {
                success: false,
                message: `Validation error: ${zodError}`,
              },
              { status: 400 }
            );
          }

          const { name, email } = validatedData;

          // ============================================
          // 4. Rate Limiting
          // ============================================
          const rateLimitCheck = checkRateLimit(email);
          if (!rateLimitCheck.allowed) {
            console.warn('[OTP API] Rate limit exceeded:', email);
            return Response.json(
              {
                success: false,
                message: rateLimitCheck.message || 'Too many requests. Please try again later.',
              },
              { status: 429 } // Too Many Requests
            );
          }

          // ============================================
          // 5. Check for Duplicate Unverified OTP
          // ============================================
          const hasPending = await hasPendingOtp(email);
          if (hasPending) {
            console.warn('[OTP API] Pending OTP already exists:', email);
            return Response.json(
              {
                success: false,
                message: 'An OTP was recently sent to this email. Please check your inbox or wait a few minutes.',
              },
              { status: 429 }
            );
          }

          // ============================================
          // 6. Generate OTP
          // ============================================
          const otp = generateOtp();
          console.log('[OTP API] OTP generated');

          // ============================================
          // 7. Hash OTP
          // ============================================
          const { hashedOtp, salt } = hashOtp(otp);
          console.log('[OTP API] OTP hashed');

          // ============================================
          // 8. Calculate Expiry (5 minutes)
          // ============================================
          const expiresAt = getOtpExpiryTime(5); // 5 minutes
          console.log('[OTP API] Expiry set to 5 minutes');

          // ============================================
          // 9. Store OTP in Supabase
          // ============================================
          console.log('[OTP API] Storing OTP in database...');
          const { error: dbError } = await supabase
            .from('otp_verifications')
            .insert({
              email: email.toLowerCase(),
              otp_code: otp, // For development/testing
              otp_hash: `${salt}:${hashedOtp}`,
              attempts: 0,
              expires_at: expiresAt.toISOString(),
              verified_at: null,
            });

          if (dbError) {
            console.error('[OTP API] Database error:', dbError);
            return Response.json(
              {
                success: false,
                message: 'Failed to generate OTP. Please try again.',
              },
              { status: 500 }
            );
          }

          console.log('[OTP API] OTP stored in database');

          // ============================================
          // 10. Generate Email Template
          // ============================================
          const emailTemplate = generateOtpEmailTemplate(email, otp, 5);
          console.log('[OTP API] Email template generated');

          // ============================================
          // 11. Send OTP via Brevo
          // ============================================
          console.log('[OTP API] Sending email via Brevo...');
          const emailResult = await sendBrevoEmail({
            to: email,
            subject: emailTemplate.subject,
            htmlContent: emailTemplate.htmlContent,
            textContent: emailTemplate.textContent,
          });

          if (!emailResult.success) {
            console.error('[OTP API] Brevo email error:', emailResult.error);
            // Don't delete the OTP record - let user retry
            return Response.json(
              {
                success: false,
                message: emailResult.error || 'Failed to send OTP email. Please try again.',
              },
              { status: 500 }
            );
          }

          console.log('[OTP API] Email sent successfully');

          // ============================================
          // 12. Success Response
          // ============================================
          return Response.json(
            {
              success: true,
              message: 'OTP sent successfully to your email',
              expiresInSeconds: 300, // 5 minutes
            },
            { status: 200 }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('[OTP API] Unexpected error:', errorMessage, error instanceof Error ? error.stack : '');

          return Response.json(
            {
              success: false,
              message: 'An unexpected error occurred. Please try again later.',
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
