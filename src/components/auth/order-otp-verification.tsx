'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// Update the import path below if your Dialog components are located elsewhere
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Phone, Shield, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface OrderData {
  items: Array<{
    menuItemId: string
    quantity: number
    specialInstructions?: string
  }>
  deliveryAddressId: string
  customerNotes?: string
}

interface OrderOTPVerificationProps {
  isOpen: boolean
  onClose: () => void
  onVerificationSuccess: (orderId: string) => void
  phoneNumber: string
  orderData: OrderData
  timeLimit?: number // in seconds, default 300 (5 minutes)
}

export function OrderOTPVerification({ 
  isOpen, 
  onClose, 
  onVerificationSuccess, 
  phoneNumber: initialPhoneNumber,
  orderData,
  timeLimit = 300 
}: OrderOTPVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber.replace(/^\+91/, ''))
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)

  // Time limit countdown
  useEffect(() => {
    if (isOpen && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      setError('Time limit exceeded. Please try placing your order again.')
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }, [isOpen, timeRemaining, onClose])

  // OTP resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendOTP = useCallback(async () => {
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
    } catch {
      setError('Failed to send OTP. Please try again.')
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }, [phoneNumber])

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (isOpen && phoneNumber && step === 'phone') {
      sendOTP()
    }
  }, [isOpen, phoneNumber, step, sendOTP])

  const verifyOTPAndCompleteOrder = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      // First verify OTP
      const otpResponse = await fetch('/api/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      })

      const otpData = await otpResponse.json()

      if (otpData.success) {
        setIsProcessingOrder(true)
        toast.success('OTP verified! Processing your order...')
        
        // Now complete the order
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        const orderResult = await orderResponse.json()

        if (orderResult.success && orderResult.data) {
          setSuccess('Order placed successfully!')
          toast.success('Order confirmed! You will be redirected shortly.')
          const orderWithId = orderResult.data as { id: string }
          setTimeout(() => {
            onVerificationSuccess(orderWithId.id)
          }, 1500)
        } else {
          throw new Error(orderResult.error || 'Failed to place order')
        }
      } else {
        setError(otpData.error)
        setAttemptsRemaining(otpData.attemptsRemaining || 0)
        if (otpData.attemptsRemaining === 0) {
          setStep('phone') // Reset to phone step
          setOtp('')
        }
        toast.error(otpData.error)
      }
    } catch (error) {
      console.error('Order completion error:', error)
      setError(error instanceof Error ? error.message : 'Failed to complete order. Please try again.')
      toast.error('Order placement failed')
    } finally {
      setLoading(false)
      setIsProcessingOrder(false)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendOTP()
  }

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyOTPAndCompleteOrder()
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby="otp-description">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            {step === 'phone' ? (
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : isProcessingOrder ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
          </div>
          <DialogTitle className="text-center">
            {isProcessingOrder ? 'Processing Your Order' : 
             step === 'phone' ? 'Verify Your Phone Number' : 'Enter Verification Code'}
          </DialogTitle>
          <DialogDescription id="otp-description" className="text-center">
            {isProcessingOrder ? 'Please wait while we confirm your order...' :
             step === 'phone' 
              ? 'We need to verify your phone number to complete your order'
              : `We've sent a 6-digit code to +91${phoneNumber}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time remaining indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm text-orange-600 font-medium">
            <Clock className="w-4 h-4" />
            <span>Time remaining: {formatTime(timeRemaining)}</span>
          </div>

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

          {isProcessingOrder ? (
            <div className="flex flex-col items-center space-y-4 py-6">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="text-center text-gray-600">Processing your order...</p>
            </div>
          ) : step === 'phone' ? (
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
                  disabled={loading}
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
                    'Complete Order'
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
