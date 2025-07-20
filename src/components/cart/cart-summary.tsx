"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context-new'
import { Separator } from '@/components/ui/separator'

interface CartSummaryProps {
  showCheckoutButton?: boolean
  onCheckout?: () => void
}

export function CartSummary({ showCheckoutButton = true, onCheckout }: CartSummaryProps) {
  const { cart, calculateTotals } = useCart()

  if (!cart || cart.items.length === 0) {
    return null
  }

  const totals = calculateTotals()

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₹{totals.deliveryFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{totals.total.toFixed(2)}</span>
          </div>
        </div>

        {showCheckoutButton && (
          <Button 
            onClick={onCheckout}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Proceed to Checkout
          </Button>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>• Free delivery on orders over ₹500</p>
          <p>• Estimated delivery: 30-45 minutes</p>
        </div>
      </CardContent>
    </Card>
  )
}
