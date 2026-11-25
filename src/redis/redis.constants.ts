export const REDIS_CLIENT = 'REDIS_CLIENT';

export enum RedisKeyPrefix {
  RefreshToken = 'refresh_token',
  EmailVerificationOtp = 'email_otp',
  PasswordResetOtp = 'password_otp',
  OtpSendLimit = 'otp_send_limit',
  OtpAttempts = 'otp_attempts',
}

export const OTP_CONFIG = {
  MAX_SEND_REQUESTS: 5,         // Max OTP requests per email within time window
  SEND_WINDOW_SECONDS: 15 * 60, // 15 minutes window
  MAX_VERIFY_ATTEMPTS: 5,       // Max invalid guesses before OTP is invalidated
};
