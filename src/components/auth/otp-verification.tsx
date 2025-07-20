/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Phone, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface OTPVerificationProps {
  onVerificationSuccess: (phoneNumber: string) => void
  initialPhoneNumber?: string
}

export function OTPVerification({ onVerificationSuccess, initialPhoneNumber = '' }: OTPVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })

      const data = await response.json()

      if (data.success) {
        setStep('otp')
        setSuccess(data.message)
        setCountdown(60) // 60 seconds before allowing resend
        toast.success('OTP sent to your mobile number')
      } else {
        setError(data.error)
        toast.error(data.error)
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Phone number verified successfully!')
        toast.success('Verification successful!')
        setTimeout(() => {
          onVerificationSuccess(phoneNumber)
        }, 1000)
      } else {
        setError(data.error)
        setAttemptsRemaining(data.attemptsRemaining || 0)
        if (data.attemptsRemaining === 0) {
          setStep('phone') // Reset to phone step
          setOtp('')
        }
        toast.error(data.error)
      }
    } catch (error) {
      setError('OTP verification failed. Please try again.')
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendOTP()
  }

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyOTP()
  }

  const resendOTP = () => {
    if (countdown === 0) {
      setOtp('')
      setError('')
      sendOTP()
    }
  }

  const goBack = () => {
    setStep('phone')
    setOtp('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            {step === 'phone' ? (
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
          </div>
          <CardTitle>
            {step === 'phone' ? 'Verify Your Phone Number' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'We need to verify your phone number to show your orders'
              : `We've sent a 6-digit code to +91${phoneNumber}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || phoneNumber.length !== 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-wider"
                  maxLength={6}
                  required
                />
                {attemptsRemaining < 3 && (
                  <p className="text-sm text-orange-600 mt-1">
                    {attemptsRemaining} attempts remaining
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={resendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-sm"
                >
                  {countdown > 0 
                    ? `Resend code in ${countdown}s` 
                    : 'Resend verification code'
                  }
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
