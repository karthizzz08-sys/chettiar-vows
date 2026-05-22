/**
 * OTP Utilities
 * Server-side OTP generation, hashing, and verification
 */

import * as crypto from "crypto";

/**
 * Generate a 6-digit random OTP
 */
export function generateOtp(): string {
  const randomNum = Math.floor(Math.random() * 1000000);
  return String(randomNum).padStart(6, "0");
}

/**
 * Hash OTP using bcrypt-like approach (PBKDF2 for server-side)
 * Returns { hashedOtp: string, salt: string }
 * Note: In production, use bcryptjs package for better security
 */
export function hashOtp(otp: string, salt?: Buffer): { hashedOtp: string; salt: string } {
  const s = salt || crypto.randomBytes(16);
  const hash = crypto
    .pbkdf2Sync(otp, s, 100000, 64, "sha512")
    .toString("hex");
  const saltHex = s.toString("hex");
  return {
    hashedOtp: hash,
    salt: saltHex,
  };
}

/**
 * Verify OTP against hash
 */
export function verifyOtpHash(otp: string, hashedOtp: string): boolean {
  const [saltHex, storedHash] = hashedOtp.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const hash = crypto
    .pbkdf2Sync(otp, salt, 100000, 64, "sha512")
    .toString("hex");
  return hash === storedHash;
}

/**
 * Check if OTP has expired
 */
export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Calculate expiry time (default 10 minutes from now)
 */
export function getOtpExpiryTime(minutesFromNow: number = 10): Date {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}
