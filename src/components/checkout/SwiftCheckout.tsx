'use client';

import { useState } from 'react';
import { Smartphone, Zap, Lock, Timer } from 'lucide-react';

interface SwiftCheckoutProps {
  orderTotal: number;
  onCheckoutComplete: (phoneNumber: string, otp: string) => void;
  isLoading?: boolean;
  className?: string;
}

export default function SwiftCheckout({ orderTotal, onCheckoutComplete, isLoading = false, className = '' }: SwiftCheckoutProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, '$1-$2');
    }
    return cleaned.slice(0, 10).replace(/(\d{5})(\d{5})/, '$1-$2');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.replace(/\D/g, '').length === 10) {
      // Simulate OTP sending
      console.log('Sending OTP to:', phoneNumber);
      setStep('otp');
      startTimer();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }

      // Auto-submit when all fields filled
      if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
        handleOtpSubmit(newOtp.join(''));
      }
    }
  };

  const handleOtpSubmit = (otpCode: string) => {
    if (otpCode.length === 6) {
      onCheckoutComplete(phoneNumber, otpCode);
      setStep('success');
    }
  };

  const startTimer = () => {
    setTimeLeft(60);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    // Simulate resend delay
    setTimeout(() => {
      setIsResending(false);
      startTimer();
    }, 2000);
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Swift Checkout</h3>
        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">30s checkout</span>
      </div>

      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700 mb-2">
              <Smartphone className="w-4 h-4 inline mr-1" />
              Enter your mobile number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">+91</span>
              </div>
              <input
                id="phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="XXXXX-XXXXX"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                maxLength={11}
                required
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              We&apos;ll send you a 6-digit OTP for verification
            </div>
          </div>

          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Order Total:</span>
              <span className="text-xl font-bold text-blue-600">₹{orderTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={phoneNumber.replace(/\D/g, '').length !== 10 || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Send OTP & Place Order
          </button>

          <div className="text-xs text-gray-500 text-center">
            <Lock className="w-3 h-3 inline mr-1" />
            Secure checkout • No registration required
          </div>
        </form>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-4">
              Enter the 6-digit OTP sent to
              <div className="font-semibold text-blue-600">+91 {phoneNumber}</div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && index > 0) {
                    const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
                    prevInput?.focus();
                  }
                }}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                placeholder="0"
              />
            ))}
          </div>

          <div className="text-center">
            {timeLeft > 0 ? (
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Timer className="w-4 h-4" />
                Resend OTP in {timeLeft}s
              </div>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-sm text-blue-600 hover:text-blue-800 underline disabled:text-gray-400"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <button
            onClick={() => setStep('phone')}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
          >
            Change phone number
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">Order Placed Successfully!</h4>
            <p className="text-sm text-gray-600 mt-1">
              Your order will be prepared and delivered on time.
            </p>
          </div>
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <div className="text-green-800 text-sm">
              <div className="font-semibold">Order confirmed for +91 {phoneNumber}</div>
              <div>Total: ₹{orderTotal}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>30-second checkout</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            <span>No app required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
