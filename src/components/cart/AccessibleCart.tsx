'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, CreditCard, Clock } from 'lucide-react';
import { parsePrice, formatCurrency } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface AccessibleCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onCheckout: () => void;
  loyaltyPoints?: number;
  className?: string;
}

export default function AccessibleCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onCheckout,
  loyaltyPoints = 0,
  className = ''
}: AccessibleCartProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parsePrice(item.price);
    const itemTotal = price * item.quantity;
    const addOnsTotal = item.addOns?.reduce((addOnSum, addOn) => 
      addOnSum + (addOn.price * addOn.quantity), 0) || 0;
    return sum + itemTotal + addOnsTotal;
  }, 0);

  const loyaltyDiscount = Math.floor(loyaltyPoints / 1000) * 10;
  const total = Math.max(0, subtotal - loyaltyDiscount);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 id="cart-title" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-lg flex items-center justify-center text-2xl">
                        {item.image || '🍰'}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatCurrency(item.price)} each
                        </div>

                        {/* Add-ons */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Add-ons:</div>
                            {item.addOns.map((addOn) => (
                              <div key={addOn.id} className="text-xs text-gray-600 flex justify-between">
                                <span>{addOn.name} × {addOn.quantity}</span>
                                <span>₹{addOn.price * addOn.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                              aria-label={`Remove one ${item.name}`}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                              aria-label={`Add one ${item.name}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex-1 text-right">
                            <div className="font-semibold text-gray-800">
                              {formatCurrency(parsePrice(item.price) * item.quantity + (item.addOns?.reduce((sum, addOn) => 
                                sum + (addOn.price * addOn.quantity), 0) || 0))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary & Checkout */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {/* Loyalty Points */}
                {loyaltyPoints > 0 && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-700 font-medium">🏆 Loyalty Points</span>
                      <span className="text-amber-600">{loyaltyPoints} points</span>
                    </div>
                    {loyaltyDiscount > 0 && (
                      <div className="text-green-700 text-sm mt-1">
                        Discount applied: -₹{loyaltyDiscount}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Loyalty Discount:</span>
                      <span>-₹{loyaltyDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold text-gray-800 pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Estimated prep time: 15-30 mins</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                  disabled={itemCount === 0}
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>

                {/* Security Note */}
                <div className="text-xs text-center text-gray-500 mt-2">
                  🔒 Secure checkout • No hidden charges
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
