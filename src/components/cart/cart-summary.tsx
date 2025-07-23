"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context-new'
// import { Separator } from '@/components/ui/separator'
import { Clock, Truck } from 'lucide-react'

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
    <div className="space-y-4 pb-0">
      {/* Bill Details
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-4">Bill Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Item Total</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>₹{totals.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes and Charges</span>
              <span>₹{totals.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>TO PAY</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Delivery Info */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">Delivery in 30-35 mins</p>
              <p className="text-sm text-gray-600">Shipment of 1 item</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">Delivery Fee</p>
              <p className="text-sm text-gray-600">
                {totals.deliveryFee === 0 ? 'FREE delivery' : `₹${totals.deliveryFee}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCheckoutButton && (
        <Button 
          onClick={onCheckout}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
          size="lg"
        >
          PROCEED TO PAY
        </Button>
      )}
    </div>
  )
}
