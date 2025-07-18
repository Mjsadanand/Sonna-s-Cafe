"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/cart-context'
import { CreditCard, MapPin, User, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

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
    specialInstructions: ''
  })

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

    // Simulate payment processing
    setTimeout(() => {
      // Clear cart and redirect to success page
      clearCart()
      toast.success("Order placed successfully! Your order has been confirmed and is being prepared.")
      router.push('/success')
    }, 2000)
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              You need items in your cart to proceed with checkout.
            </p>
            <Link href="/menu">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-8 text-base">
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/cart">
              <Button variant="outline" size="sm" className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm sm:text-base text-gray-600">Complete your order</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <Card className="shadow-sm border border-gray-200">
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

              {/* Delivery Address */}
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apt 4B"
                      required
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
                        required
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
                        required
                        className="h-11 text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="shadow-sm border border-gray-200">
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
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      title="Select payment method"
                      className="w-full h-11 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="cash">Cash on Delivery</option>
                    </select>
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
                          required={formData.paymentMethod === 'card'}
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
                            required={formData.paymentMethod === 'card'}
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
                            required={formData.paymentMethod === 'card'}
                            className="h-11 text-base"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Special Instructions */}
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
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 shadow-sm border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start py-2">
                        <div className="flex-1 pr-3">
                          <h4 className="font-medium text-sm sm:text-base">{item.menuItem.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm sm:text-base font-medium">
                          ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>₹{state.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Tax</span>
                      <span>₹{state.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Delivery Fee</span>
                      <span>₹{state.deliveryFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base sm:text-lg">
                      <span>Total</span>
                      <span>₹{state.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
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
                        Place Order - ₹{state.total.toFixed(2)}
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Your payment information is secure and encrypted.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
