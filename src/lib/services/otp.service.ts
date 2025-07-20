import twilio from 'twilio';
import { AppError } from '@/lib/utils';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Lazy initialization of Twilio client
let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!client) {
    if (!accountSid || !authToken) {
      throw new AppError('Twilio credentials not configured', 500);
    }
    client = twilio(accountSid, authToken);
  }
  return client;
}

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map<string, {
  otp: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}>();

export class OTPService {
  // Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to user's phone
  static async sendOTP(phoneNumber: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!accountSid || !authToken || !twilioPhoneNumber) {
        throw new AppError('Twilio configuration is missing', 500);
      }

      // Clean phone number format
      const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      // Check if OTP was sent recently (rate limiting)
      const existingOTP = otpStorage.get(cleanPhone);
      if (existingOTP && existingOTP.expiresAt > new Date()) {
        const timeLeft = Math.ceil((existingOTP.expiresAt.getTime() - Date.now()) / 1000);
        if (timeLeft > 240) { // If more than 4 minutes left, don't send new OTP
          return {
            success: false,
            error: `OTP already sent. Please wait ${Math.ceil(timeLeft / 60)} minutes before requesting again.`
          };
        }
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      // Store OTP
      otpStorage.set(cleanPhone, {
        otp,
        expiresAt,
        attempts: 0,
        verified: false
      });

      // Send SMS
      const message = `🔐 Your Sonna's Cafe verification code is: ${otp}

This code will expire in 5 minutes.
Please do not share this code with anyone.

- Sonna's Cafe Team`;

      await getTwilioClient().messages.create({
        from: twilioPhoneNumber,
        to: cleanPhone,
        body: message,
      });

      return {
        success: true,
        message: 'OTP sent successfully to your mobile number'
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  }

  // Verify OTP
  static verifyOTP(phoneNumber: string, enteredOTP: string): { success: boolean; message?: string; error?: string } {
    try {
      const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const storedData = otpStorage.get(cleanPhone);

      if (!storedData) {
        return {
          success: false,
          error: 'No OTP found. Please request a new OTP.'
        };
      }

      // Check expiry
      if (storedData.expiresAt < new Date()) {
        otpStorage.delete(cleanPhone);
        return {
          success: false,
          error: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Check attempts (max 3 attempts)
      if (storedData.attempts >= 3) {
        otpStorage.delete(cleanPhone);
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (storedData.otp !== enteredOTP) {
        storedData.attempts += 1;
        otpStorage.set(cleanPhone, storedData);
        
        const remainingAttempts = 3 - storedData.attempts;
        return {
          success: false,
          error: `Invalid OTP. ${remainingAttempts} attempts remaining.`
        };
      }

      // OTP is correct
      storedData.verified = true;
      otpStorage.set(cleanPhone, storedData);

      return {
        success: true,
        message: 'OTP verified successfully!'
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: 'OTP verification failed. Please try again.'
      };
    }
  }

  // Check if phone number is verified
  static isPhoneVerified(phoneNumber: string): boolean {
    const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const storedData = otpStorage.get(cleanPhone);
    
    return storedData?.verified === true && storedData.expiresAt > new Date();
  }

  // Clear OTP data (for cleanup)
  static clearOTP(phoneNumber: string): void {
    const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    otpStorage.delete(cleanPhone);
  }

  // Get OTP attempts remaining
  static getAttemptsRemaining(phoneNumber: string): number {
    const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const storedData = otpStorage.get(cleanPhone);
    
    if (!storedData) return 3;
    return Math.max(0, 3 - storedData.attempts);
  }
}
