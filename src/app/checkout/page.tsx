
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
import { useUser, useAuth } from '@clerk/nextjs'
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

interface GuestOrderData {
  items: Array<{
    menuItemId: string
    quantity: number
    specialInstructions?: string
  }>
  guestAddress: {
    addressLine1: string
    city: string
    state: string
    postalCode: string
    country: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  customerNotes?: string
  phone: string
  subtotal: string
  tax: string
  deliveryFee: string
  discount?: string
  total: string
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
  const { cart, clearCart, calculateTotals, addToCart } = useCart()
  const router = useRouter()
  const { user } = useUser()
  const { getToken, userId: clerkUserId } = useAuth();

  // State for mobile vs. desktop view
  const [isMobile, setIsMobile] = useState(false)
  // Stepper state for mobile (only relevant if isMobile is true)
  const [step, setStep] = useState(0); // Always start at 0 on fresh navigation
  // On mount, clear guest_checkout_step if coming from cart (fresh navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If there is a guest_checkout_step, but no guest_checkout_cart, treat as fresh navigation
      const fromCart = document.referrer && document.referrer.includes('/cart');
      if (fromCart || !localStorage.getItem('guest_checkout_step')) {
        localStorage.removeItem('guest_checkout_step');
        setStep(0);
      } else {
        // Restore step if present (e.g., after login or reload)
        const savedStep = localStorage.getItem('guest_checkout_step');
        if (savedStep !== null) setStep(parseInt(savedStep, 10));
      }
    }
  }, []);

  const [isProcessing, setIsProcessing] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [pendingOrderData, setPendingOrderData] = useState<OrderData | GuestOrderData | null>(null)

  const [, setProfileData] = useState<ProfileData | null>(null)
  const [databaseUserId, setDatabaseUserId] = useState<string | null>(null)

  const totals = calculateTotals()

  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedForm = localStorage.getItem('guest_checkout_form');
      if (savedForm) {
        try {
          return JSON.parse(savedForm);
        } catch {}
      }
    }
    return {
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
    };
  });

  // User sync state
  const [isUserSyncing, setIsUserSyncing] = useState(false);
  const [userSyncError, setUserSyncError] = useState<string | null>(null);

  // Store guest address in localStorage and merge after login
  useEffect(() => {
    if (!user) {
      // Save guest address on change
      localStorage.setItem('guest_checkout_address', JSON.stringify({
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
      }));
    }
  }, [formData.address, formData.city, formData.postalCode, user]);

useEffect(() => {
  if (user?.id && databaseUserId) {
    const guestAddress = localStorage.getItem('guest_checkout_address');
    if (guestAddress) {
      try {
        const parsed = JSON.parse(guestAddress);
        (async () => {
          let token = await getToken();
          if (!token) token = '';
          const addressData = {
            type: 'delivery',
            label: 'Home',
            addressLine1: parsed.address,
            city: parsed.city,
            state: 'India',
            postalCode: parsed.postalCode,
            country: 'India',
            isDefault: addresses.length === 0
          };
          if (typeof databaseUserId === 'string') {
            await apiClient.addresses.createAddress(addressData, { userId: databaseUserId, token });
          } else {
            await apiClient.addresses.createAddress(addressData, { token });
          }
          localStorage.removeItem('guest_checkout_address');
        })();
      } catch {}
    }
  }
}, [user?.id, databaseUserId, addresses.length, getToken]);

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


  useEffect(() => {
    if (!user?.id) {
      setDatabaseUserId(null);
      return;
    }
    setIsUserSyncing(true);
    setUserSyncError(null);
    fetch('/api/user/sync')
      .then(async res => {
        if (!res.ok) throw new Error('Failed to sync user');
        const data = await res.json();
        if (data.user?.id) {
          setDatabaseUserId(data.user.id);
        } else {
          throw new Error('User not found in database after sync');
        }
      })
      .catch(error => {
        setUserSyncError('Could not sync your account. Please try logging out and in again.');
        setDatabaseUserId(null);
        console.error('Failed to sync user:', error);
      })
      .finally(() => setIsUserSyncing(false));
  }, [user?.id]);

  // Fetch profile data and autofill form (only after user sync)
  useEffect(() => {
    if (!databaseUserId || isUserSyncing || userSyncError) return;
    const fetchProfileData = async () => {
      try {
        let token = await getToken();
        if (!token) token = '';
        const response = await apiClient.auth.getProfileStats(
          typeof databaseUserId === 'string'
            ? { userId: databaseUserId, token }
            : { token }
        );
        if (response.success && response.data) {
          const profile = response.data as ProfileData
          setProfileData(profile)
          setFormData((prev: typeof formData) => ({
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
      }
    };
    fetchProfileData();
  }, [databaseUserId, getToken, isUserSyncing, userSyncError]);

  // Fetch user addresses only if logged in and user sync is complete; for guests, just show the form
  useEffect(() => {
    if (!user || !databaseUserId || isUserSyncing || userSyncError) {
      setAddresses([]);
      setShowAddressForm(true);
      setIsLoadingAddresses(false);
      return;
    }
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true)
        let token = await getToken();
        if (!token) token = '';
        const response = await apiClient.addresses.getUserAddresses(
          typeof databaseUserId === 'string'
            ? { userId: databaseUserId, token }
            : { token }
        );
        if (response.success && response.data) {
          setAddresses(response.data as Address[])
          // Auto-select default address if exists
          const defaultAddress = (response.data as Address[]).find(addr => addr.isDefault)
          if (defaultAddress) {
            setFormData((prev: typeof formData) => ({
              ...prev,
              selectedAddressId: defaultAddress.id
            }))
          } else if ((response.data as Address[]).length === 0) {
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
    fetchAddresses();
  }, [user, getToken, clerkUserId, databaseUserId, isUserSyncing, userSyncError]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: typeof formData) => {
      const updated = { ...prev, [name]: value };
      // Save to localStorage for guest-to-auth flow
      if (typeof window !== 'undefined') {
        localStorage.setItem('guest_checkout_form', JSON.stringify(updated));
      }
      return updated;
    });
  }

// Restore guest cart, form, and step after login
useEffect(() => {
  if (user?.id) {
    const guestCart = localStorage.getItem('guest_checkout_cart');
    const guestForm = localStorage.getItem('guest_checkout_form');
    const guestStep = localStorage.getItem('guest_checkout_step');
    let restoredStep = 0;
    if (guestStep !== null) {
      restoredStep = parseInt(guestStep, 10);
      setStep(restoredStep);
    }
    if (guestCart) {
      // Merge guest cart with user cart after login
      try {
        const parsedGuestCart = JSON.parse(guestCart);
        if (parsedGuestCart && parsedGuestCart.items && parsedGuestCart.items.length > 0 && typeof addToCart === 'function') {
          parsedGuestCart.items.forEach((item: { menuItem: { id: string; name: string; [key: string]: unknown }; quantity: number; specialInstructions?: string }) => {
            // Validate item fields and require a full MenuItem object
            const fullMenuItem = cart?.items?.find((ci) => ci.menuItem.id === item.menuItem.id)?.menuItem;
            if (
              item &&
              item.menuItem &&
              typeof item.menuItem.id === 'string' &&
              item.menuItem.id.length > 0 &&
              typeof item.quantity === 'number' &&
              item.quantity > 0 &&
              fullMenuItem // Only add if we have a full MenuItem object
            ) {
              addToCart(fullMenuItem, item.quantity, item.specialInstructions);
            }
          });
        }
      } catch {
        // Ignore merge errors
      }
      // Do NOT clear guest cart here; clear after order is placed
    }
    if (guestForm) {
      try {
        const parsed = JSON.parse(guestForm);
        // Only set form fields if all required address fields are present and non-empty
        if (
          (!parsed.address || typeof parsed.address === 'string' && parsed.address.trim().length > 0) &&
          (!parsed.city || typeof parsed.city === 'string' && parsed.city.trim().length > 0) &&
          (!parsed.postalCode || typeof parsed.postalCode === 'string' && parsed.postalCode.trim().length > 0)
        ) {
          setFormData((prev: typeof formData) => ({ ...prev, ...parsed }));
        }
      } catch {}
      // Do NOT clear guest form here; clear after order is placed
    }
    // If the restored step is payment or summary, scroll to form and focus payment/OTP
    if (restoredStep >= 2) {
      setTimeout(() => {
        const el = document.querySelector('form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }
}, [cart, addToCart, user?.id]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsProcessing(true)


  // If not logged in, allow guest checkout (do NOT force sign-in)
  // Save guest state for persistence, but do not redirect
  if (!user?.id) {
    localStorage.setItem('guest_checkout_cart', JSON.stringify(cart));
    localStorage.setItem('guest_checkout_form', JSON.stringify(formData));
    localStorage.setItem('guest_checkout_step', step.toString());
    // Continue to OTP/order flow for guests
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
        let token = await getToken();
        if (!token) token = '';
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
        let tokenForAddress = await getToken();
        if (!tokenForAddress) tokenForAddress = '';
        const addressResponse = await apiClient.addresses.createAddress(
          addressData,
          typeof databaseUserId === 'string'
            ? { userId: databaseUserId, token: tokenForAddress }
            : { token: tokenForAddress }
        );
        if (!addressResponse.success || !addressResponse.data) {
          throw new Error('Failed to create delivery address')
        }
        const addressDataWithId = addressResponse.data as { id: string }
        deliveryAddressId = addressDataWithId.id
        let tokenForGetAddresses = await getToken();
        if (!tokenForGetAddresses) tokenForGetAddresses = '';
        const updatedAddresses = await apiClient.addresses.getUserAddresses(
          typeof databaseUserId === 'string'
            ? { userId: databaseUserId, token: tokenForGetAddresses }
            : { token: tokenForGetAddresses }
        );
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
      // Prepare order data for OTP verification
      let orderData: OrderData | GuestOrderData;
      if (!user?.id) {
        // Guest: include address fields and personal info directly
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          toast.error('Please fill in all personal information fields')
          setIsProcessing(false)
          return
        }
        if (!formData.address || !formData.city || !formData.postalCode) {
          toast.error('Please fill in all address fields')
          setIsProcessing(false)
          return
        }
        orderData = {
          items: cart?.items.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || undefined
          })) || [],
          guestAddress: {
            addressLine1: formData.address,
            city: formData.city,
            state: 'India',
            postalCode: formData.postalCode,
            country: 'India',
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          customerNotes: formData.specialInstructions || undefined,
          phone: formData.phone,
          subtotal: totals.subtotal.toString(),
          tax: totals.tax.toString(),
          deliveryFee: totals.deliveryFee.toString(),
          discount: '0',
          total: totals.total.toString()
        };
      } else {
        // Logged-in: create/get address as before
        let deliveryAddressId = formData.selectedAddressId;
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
          let tokenForAddress2 = await getToken();
          if (!tokenForAddress2) tokenForAddress2 = '';
          const addressResponse = await apiClient.addresses.createAddress(
            addressData,
            typeof databaseUserId === 'string'
              ? { userId: databaseUserId, token: tokenForAddress2 }
              : { token: tokenForAddress2 }
          );
          if (!addressResponse.success || !addressResponse.data) {
            throw new Error('Failed to create delivery address')
          }
          const addressDataWithId = addressResponse.data as { id: string }
          deliveryAddressId = addressDataWithId.id
          let tokenForGetAddresses2 = await getToken();
          if (!tokenForGetAddresses2) tokenForGetAddresses2 = '';
          const updatedAddresses = await apiClient.addresses.getUserAddresses(
            typeof databaseUserId === 'string'
              ? { userId: databaseUserId, token: tokenForGetAddresses2 }
              : { token: tokenForGetAddresses2 }
          );
          if (updatedAddresses.success && updatedAddresses.data) {
            setAddresses(updatedAddresses.data as Address[])
          }
        } else if (!deliveryAddressId) {
          toast.error('Please select a delivery address')
          setIsProcessing(false)
          return
        }
        orderData = {
          items: cart?.items.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || undefined
          })) || [],
          deliveryAddressId,
          customerNotes: formData.specialInstructions || undefined
        };
      }

      // Directly place guest order (OTP disabled for guest)
      // Call your API endpoint to place the guest order
      const response = await fetch('/api/guest-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await response.json();
      if (result.success && result.data && result.data.orderNumber) {
        clearCart();
        localStorage.removeItem('guest_checkout_cart');
        localStorage.removeItem('guest_checkout_form');
        toast.success('Order placed successfully! Redirecting to order confirmation...');
        router.push(`/success?orderId=${result.data.orderNumber}`);
      } else {
        toast.error(result.error || 'Failed to place order. Please try again.');
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
    // Clear cart and guest data only after successful order placement
    clearCart();
    localStorage.removeItem('guest_checkout_cart');
    localStorage.removeItem('guest_checkout_form');
    setShowOTPVerification(false);
    toast.success('Order placed successfully! Redirecting to order confirmation...');
    router.push(`/success?orderId=${orderId}`);
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
                onClick={() => setFormData((prev: typeof formData) => ({ ...prev, selectedAddressId: address.id }))}
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
            {user && (
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
                      let token = await getToken();
                      if (!token) token = '';
        const addressResponse = await apiClient.addresses.createAddress(
          addressData,
          typeof databaseUserId === 'string'
            ? { userId: databaseUserId, token }
            : { token }
        );
                      if (!addressResponse.success || !addressResponse.data) {
                        throw new Error('Failed to create delivery address');
                      }
                      const addressDataWithId = addressResponse.data as { id: string };
                      const updatedAddresses = await apiClient.addresses.getUserAddresses(
                        typeof databaseUserId === 'string'
                          ? { userId: databaseUserId, token }
                          : { token }
                      );
                      if (updatedAddresses.success && updatedAddresses.data) {
                        setAddresses(updatedAddresses.data as Address[]);
                      }
                      setFormData((prev: typeof formData) => ({ ...prev, selectedAddressId: addressDataWithId.id }));
                      setShowAddressForm(false);
                      toast.success('Address saved!');
                    } catch {
                      toast.error('Failed to save address.');
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            )}
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
      {/* Block UI if user sync is in progress or failed */}
      {isUserSyncing ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700 dark:text-white">Syncing your account...</p>
          </div>
        </div>
      ) : userSyncError ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">{userSyncError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}