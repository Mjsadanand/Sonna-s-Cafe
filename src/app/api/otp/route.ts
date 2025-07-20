import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/services/otp.service';
import { z } from 'zod';

// POST /api/otp - Send OTP to phone number
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const sendOTPSchema = z.object({
      phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
    });

    const { phoneNumber } = sendOTPSchema.parse(body);
    
    // Clean and validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const result = await OTPService.sendOTP(cleanPhone);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// PUT /api/otp - Verify OTP
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const verifyOTPSchema = z.object({
      phoneNumber: z.string().min(10),
      otp: z.string().length(6, 'OTP must be 6 digits'),
    });

    const { phoneNumber, otp } = verifyOTPSchema.parse(body);
    
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    const result = OTPService.verifyOTP(cleanPhone, otp);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        verified: true
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          attemptsRemaining: OTPService.getAttemptsRemaining(cleanPhone)
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'OTP verification failed' },
      { status: 500 }
    );
  }
}

// GET /api/otp - Check verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const isVerified = OTPService.isPhoneVerified(cleanPhone);

    return NextResponse.json({
      success: true,
      verified: isVerified,
      attemptsRemaining: OTPService.getAttemptsRemaining(cleanPhone)
    });
  } catch (error) {
    console.error('Error checking OTP status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
