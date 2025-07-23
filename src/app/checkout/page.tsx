"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/cart-context-new'
import { CreditCard, MapPin, User, ArrowLeft, Lock, Plus, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { apiClient } from '@/lib/api/client'
import { OrderOTPVerification } from '@/components/auth/order-otp-verification'

interface OrderData {
  items: Array<{
    menuItemId: string
    quantity: number
    specialInstructions?: string
  }>
  deliveryAddressId: string
  customerNotes?: string
}

interface Address {
  id: string
  type: string
  label: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  landmark?: string
  instructions?: string
  isDefault: boolean
}

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  loyaltyPoints: number;
  createdAt: string;
}

interface ProfileData {
  user: UserProfile;
}

export default function CheckoutPage() {
  const { cart, clearCart, calculateTotals } = useCart()
  const router = useRouter()
  const { user } = useUser()

  // State for mobile vs. desktop view
  const [isMobile, setIsMobile] = useState(false)
  // Stepper state for mobile (only relevant if isMobile is true)
  const [step, setStep] = useState(0) // 0: Personal, 1: Address, 2: Payment, 3: Summary

  const [isProcessing, setIsProcessing] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [pendingOrderData, setPendingOrderData] = useState<OrderData | null>(null)

  const [, setProfileData] = useState<ProfileData | null>(null)
  const [databaseUserId, setDatabaseUserId] = useState<string | null>(null)

  const totals = calculateTotals()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    specialInstructions: '',
    selectedAddressId: ''
  })

  // Effect to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      // You can adjust this breakpoint as needed (e.g., 768px for tablet/mobile)
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile() // Initial check
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Automatically poll for UPI payment status after redirect
  useEffect(() => {
    const upiOrderId = localStorage.getItem('pendingUpiOrderId');
    const upiTransactionId = localStorage.getItem('pendingUpiTransactionId');
    if (upiOrderId && upiTransactionId) {
      let attempts = 0;
      const maxAttempts = 12;
      const poll = async () => {
        while (attempts < maxAttempts) {
          try {
            const response = await fetch(`/api/upi-payment-status?orderId=${upiOrderId}&transactionId=${upiTransactionId}`);
            const result = await response.json();
            if (result.success && result.status === 'completed') {
              toast.success('Payment successful! Redirecting...');
              clearCart();
              localStorage.removeItem('pendingUpiOrderId');
              localStorage.removeItem('pendingUpiTransactionId');
              router.push(`/success?orderId=${upiOrderId}`);
              return;
            } else if (result.success && result.status === 'failed') {
              toast.error('Payment failed. Please try again.');
              localStorage.removeItem('pendingUpiOrderId');
              localStorage.removeItem('pendingUpiTransactionId');
              return;
            }
          } catch {
            // Ignore errors, continue polling
          }
          await new Promise(res => setTimeout(res, 5000));
          attempts++;
        }
        toast.error('Payment not confirmed. Please check your UPI app or contact support.');
        localStorage.removeItem('pendingUpiOrderId');
        localStorage.removeItem('pendingUpiTransactionId');
      };
      poll();
    }
  }, [router, clearCart]);

  // Get database user ID when user is available
  useEffect(() => {
    if (user) {
      fetch('/api/user/sync')
        .then(res => res.json())
        .then(data => {
          if (data.user?.id) {
            setDatabaseUserId(data.user.id)
          }
        })
        .catch(error => {
          console.error('Failed to get database user ID:', error)
        })
    }
  }, [user])

  // Fetch profile data and autofill form
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!databaseUserId) return
      try {
        const response = await apiClient.auth.getProfileStats({ userId: databaseUserId })
        if (response.success && response.data) {
          const profile = response.data as ProfileData
          setProfileData(profile)
          setFormData(prev => ({
            ...prev,
            firstName: profile.user.firstName || '',
            lastName: profile.user.lastName || '',
            email: profile.user.email || '',
            phone: profile.user.phone || '',
          }))
        } else {
          throw new Error(response.error || 'Failed to fetch profile data')
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        // Optionally show toast error
      }
    }
    if (databaseUserId) {
      fetchProfileData()
    }
  }, [databaseUserId])

  // Fetch user addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return

      try {
        setIsLoadingAddresses(true)
        const response = await apiClient.addresses.getUserAddresses()
        if (response.success && response.data) {
          setAddresses(response.data as Address[])
          // Auto-select default address if exists
          const defaultAddress = (response.data as Address[]).find(addr => addr.isDefault)
          if (defaultAddress) {
            setFormData(prev => ({
              ...prev,
              selectedAddressId: defaultAddress.id
            }))
          } else if ((response.data as Address[]).length === 0) {
            // Show address form if no addresses exist
            setShowAddressForm(true)
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        toast.error('Failed to load saved addresses')
        setShowAddressForm(true)
      } finally {
        setIsLoadingAddresses(false)
      }
    }

    fetchAddresses()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    if (!user?.id) {
      toast.error('Please sign in to place an order')
      setIsProcessing(false)
      return
    }

    // Validate cart has items
    if (!cart?.items || cart.items.length === 0) {
      toast.error('Your cart is empty. Please add items before placing an order.')
      setIsProcessing(false)
      return
    }

    // Validate phone number for OTP verification
    if (!formData.phone || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number for order verification')
      setIsProcessing(false)
      return
    }

    // UPI Payment Flow
    if (formData.paymentMethod === 'upi') {
      // Validate UPI ID
      if (!formData.upiId) {
        toast.error('Please enter a valid UPI ID')
        setIsProcessing(false)
        return
      }

      // Prepare order data
      let deliveryAddressId = formData.selectedAddressId
      if (!deliveryAddressId && showAddressForm) {
        if (!formData.address || !formData.city || !formData.postalCode) {
          toast.error('Please fill in all address fields')
          setIsProcessing(false)
          return
        }
        const addressData = {
          type: 'delivery',
          label: 'Home',
          addressLine1: formData.address,
          city: formData.city,
          state: 'India',
          postalCode: formData.postalCode,
          country: 'India',
          isDefault: addresses.length === 0
        }
        const addressResponse = await apiClient.addresses.createAddress(addressData)
        if (!addressResponse.success || !addressResponse.data) {
          throw new Error('Failed to create delivery address')
        }
        const addressDataWithId = addressResponse.data as { id: string }
        deliveryAddressId = addressDataWithId.id
        const updatedAddresses = await apiClient.addresses.getUserAddresses()
        if (updatedAddresses.success && updatedAddresses.data) {
          setAddresses(updatedAddresses.data as Address[])
        }
      } else if (!deliveryAddressId) {
        toast.error('Please select a delivery address')
        setIsProcessing(false)
        return
      }

      // Generate orderId and transactionId (for demo, use Date.now)
      const orderId = `ORDER${Date.now()}`
      const transactionId = `TXN${Date.now()}`
      const upiUrl = `upi://pay?pa=9019994562@ybl&pn=${encodeURIComponent('Your Business')}&am=${totals.total}&cu=INR&tn=${encodeURIComponent('Payment for Order #' + orderId)}&tr=${transactionId}`

      // Store payment as pending before redirect
      await apiClient.upiPayment.createPayment({
        orderId,
        upiId: formData.upiId,
        amount: totals.total.toString(),
        status: 'pending',
        transactionId
      });

      // Save orderId and transactionId to localStorage for polling after redirect
      localStorage.setItem('pendingUpiOrderId', orderId);
      localStorage.setItem('pendingUpiTransactionId', transactionId);

      toast.info('Redirecting to UPI app for payment...');
      window.location.href = upiUrl;
      setIsProcessing(false);
      return;
    }
    try {
      // First, create/get delivery address
      let deliveryAddressId = formData.selectedAddressId

      if (!deliveryAddressId && showAddressForm) {
        // Create new address only if no address is selected and form is shown
        if (!formData.address || !formData.city || !formData.postalCode) {
          toast.error('Please fill in all address fields')
          setIsProcessing(false)
          return
        }

        const addressData = {
          type: 'delivery',
          label: 'Home',
          addressLine1: formData.address,
          city: formData.city,
          state: 'India', // Default state
          postalCode: formData.postalCode,
          country: 'India',
          isDefault: addresses.length === 0 // Set as default if it's the first address
        }

        const addressResponse = await apiClient.addresses.createAddress(addressData)
        if (!addressResponse.success || !addressResponse.data) {
          throw new Error('Failed to create delivery address')
        }
        // Explicitly type addressResponse.data to include 'id'
        const addressDataWithId = addressResponse.data as { id: string }
        deliveryAddressId = addressDataWithId.id

        // Refresh addresses list
        const updatedAddresses = await apiClient.addresses.getUserAddresses()
        if (updatedAddresses.success && updatedAddresses.data) {
          setAddresses(updatedAddresses.data as Address[])
        }
      } else if (!deliveryAddressId) {
        toast.error('Please select a delivery address')
        setIsProcessing(false)
        return
      }

      // Prepare order data for OTP verification
      const orderData: OrderData = {
        items: cart?.items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || undefined
        })) || [],
        deliveryAddressId,
        customerNotes: formData.specialInstructions || undefined
      }

      // Store order data and show OTP verification
      setPendingOrderData(orderData)
      if (formData.paymentMethod !== 'upi') {
        setShowOTPVerification(true)
        toast.info('Please verify your phone number to complete your order')
      }
    } catch (error) {
      console.error('Order preparation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to prepare order. Please try again.'

      // Provide more specific error messages
      if (errorMessage.includes('Network error')) {
        toast.error('Network connection issue. Please check your internet and try again.')
      } else if (errorMessage.includes('JSON')) {
        toast.error('Server is experiencing issues. Please try again in a moment.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOTPVerificationSuccess = (orderId: string) => {
    // Clear cart and redirect to success page with the completed order ID
    clearCart()
    setShowOTPVerification(false)
    toast.success('Order placed successfully! Redirecting to order confirmation...')
    router.push(`/success?orderId=${orderId}`)
  }

  const handleOTPVerificationClose = () => {
    setShowOTPVerification(false)
    setPendingOrderData(null)
    toast.info('Order cancelled. Your cart items are still saved.')
  }

  // Common UI for header and empty cart message
  const commonHeaderAndEmptyCart = (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 mb-6 sm:mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-md font-bold text-gray-800 dark:text-white">Checkout</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Complete your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-0 sm:py-0">
        {!cart || cart.items.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
              You need items in your cart to proceed with checkout.
            </p>
            <Link href="/menu">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-8 text-base">
                Browse Menu
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );

  const renderPersonalInformation = () => (
    <Card className="shadow-sm border border-gray-200 mb-4">
      <CardHeader className="pb-4"> 
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <User className="w-5 h-5 mr-2" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="h-11 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="h-11 text-base"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="h-11 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="h-11 text-base"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderDeliveryAddress = () => (
    <Card className="shadow-sm border border-gray-200 mb-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <MapPin className="w-5 h-5 mr-2" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingAddresses ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading addresses...</p>
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Select a saved address:
            </div>
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.selectedAddressId === address.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, selectedAddressId: address.id }))}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {address.label || address.type}
                      </span>
                      {address.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    {address.landmark && (
                      <p className="text-xs text-gray-500 mt-1">
                        Landmark: {address.landmark}
                      </p>
                    )}
                  </div>
                  {formData.selectedAddressId === address.id && (
                    <Check className="w-5 h-5 text-green-600 mt-1" />
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddressForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </div>
          </div>
        ) : null}

        {(showAddressForm || addresses.length === 0) && (
          <div className="space-y-4">
            {addresses.length > 0 && (
              <div className="text-sm font-medium text-gray-700 mb-3">
                Add new address:
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street, Apt 4B"
                required={!formData.selectedAddressId}
                className="h-11 text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required={!formData.selectedAddressId}
                  className="h-11 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required={!formData.selectedAddressId}
                  className="h-11 text-base"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddressForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={async () => {
                  if (!formData.address || !formData.city || !formData.postalCode) {
                    toast.error('Please fill in all address fields');
                    return;
                  }
                  try {
                    const addressData = {
                      type: 'delivery',
                      label: 'Home',
                      addressLine1: formData.address,
                      city: formData.city,
                      state: 'India',
                      postalCode: formData.postalCode,
                      country: 'India',
                      isDefault: addresses.length === 0
                    };
                    const addressResponse = await apiClient.addresses.createAddress(addressData);
                    if (!addressResponse.success || !addressResponse.data) {
                      throw new Error('Failed to create delivery address');
                    }
                    const addressDataWithId = addressResponse.data as { id: string };
                    const updatedAddresses = await apiClient.addresses.getUserAddresses();
                    if (updatedAddresses.success && updatedAddresses.data) {
                      setAddresses(updatedAddresses.data as Address[]);
                    }
                    setFormData(prev => ({ ...prev, selectedAddressId: addressDataWithId.id }));
                    setShowAddressForm(false);
                    toast.success('Address saved!');
                  } catch (error) {
                    toast.error('Failed to save address.');
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPaymentInformation = () => (
    <Card className="shadow-sm border border-gray-200 mb-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleInputChange}
                className="accent-green-600"
              />
              <span>Credit/Debit Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={formData.paymentMethod === 'upi'}
                onChange={handleInputChange}
                className="accent-green-600"
              />
              <span>UPI</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={handleInputChange}
                className="accent-green-600"
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        {formData.paymentMethod === 'card' && (
            <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number *
              </label>
              <Input
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              required
              className="h-11 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <Input
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                required
                className="h-11 text-base"
              />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV *
              </label>
              <Input
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                required
                className="h-11 text-base"
              />
              </div>
            </div>
            </>
        )}

        {formData.paymentMethod === 'upi' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID *
            </label>
            <Input
              name="upiId"
              value={formData.upiId}
              onChange={handleInputChange}
              placeholder="your-upi-id@bank"
              required={formData.paymentMethod === 'upi'}
              className="h-11 text-base"
            />
            <p className="text-xs text-gray-500 mt-2">Please enter your UPI ID to receive a payment request.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderOrderSummary = () => (
    <Card className={`shadow-sm border border-gray-200 ${!isMobile ? 'sticky top-20' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {cart?.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start py-2">
              <div className="flex-1 pr-3">
                <h4 className="font-medium text-sm sm:text-base">{item.menuItem.name}</h4>
                <p className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm sm:text-base font-medium">
                ₹{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm sm:text-base">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm sm:text-base">
            <span>Tax</span>
            <span>₹{totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm sm:text-base">
            <span>Delivery Fee</span>
            <span>₹{totals.deliveryFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base sm:text-lg">
            <span>Total</span>
            <span>₹{totals.total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 h-12 sm:h-13 text-base font-medium mt-6"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Place Order - ₹{totals.total.toFixed(2)}
            </div>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Your payment information is secure and encrypted.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-w-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {commonHeaderAndEmptyCart}

      {/* Conditional rendering based on cart items */}
      {cart && cart.items.length > 0 && (
        <div className="container mx-auto px-3 sm:px-0 py-0 sm:py-0">
          {isMobile ? (
            <form onSubmit={handleSubmit}>
              {/* Stepper Navigation */}
              <div className="flex justify-between items-center mb-6">
                {['Personal Info', 'Delivery', 'Payment', 'Summary'].map((label, idx) => (
                    <div
                      key={label}
                      className="flex-1 flex flex-col items-center cursor-pointer"
                      onClick={() => {
                      if (idx <= step) setStep(idx);
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1 ${step === idx ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}>{idx + 1}</div>
                      <span className={`text-xs ${step === idx ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>{label}</span>
                    </div>
                ))}
              </div>
              {/* Step Content */}
              {step === 0 && renderPersonalInformation()}
              {step === 1 && renderDeliveryAddress()}
              {step === 2 && renderPaymentInformation()}
              {step === 3 && renderOrderSummary()}

              {/* Stepper Navigation Buttons */}
              <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>Back</Button>
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      // Basic validation before moving to the next step
                      if (step === 0 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone)) {
                        toast.error('Please fill in all personal information fields.');
                        return;
                      }
                      if (step === 1 && (!formData.selectedAddressId && (!showAddressForm || !formData.address || !formData.city || !formData.postalCode))) {
                        toast.error('Please select an address or fill in all new address fields.');
                        return;
                      }
                      setStep(s => Math.min(3, s + 1));
                    }}
                  >
                    Next
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            // Desktop: Original layout
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {renderPersonalInformation()}
                  {renderDeliveryAddress()}
                  {renderPaymentInformation()}
                  {/* Special Instructions (uncomment if needed)
                  <Card className="shadow-sm border border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl">Special Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                        placeholder="Any special requests or delivery instructions..."
                        className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        rows={3}
                      />
                    </CardContent>
                  </Card>
                  */}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  {renderOrderSummary()}
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPVerification && pendingOrderData && (
        <OrderOTPVerification
          isOpen={showOTPVerification}
          onClose={handleOTPVerificationClose}
          onVerificationSuccess={handleOTPVerificationSuccess}
          phoneNumber={formData.phone}
          orderData={pendingOrderData}
          timeLimit={300} // 5 minutes
        />
      )}
    </div>
  )
}