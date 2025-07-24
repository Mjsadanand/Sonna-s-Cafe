"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { MenuItem } from '@/types'
import { apiClient } from '@/lib/api/client'
import { useApi } from '@/lib/hooks/useApi'
import { toast } from 'sonner'
import { parsePrice } from '@/lib/utils'

interface CartItemWithDetails {
  id: string
  quantity: number
  unitPrice: string
  specialInstructions?: string | null
  addOns?: string[] | null
  menuItem: MenuItem
}

interface CartWithDetails {
  id: string | null
  userId: string | null
  sessionId: string | null
  items: CartItemWithDetails[]
  totalItems: number
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

interface CartContextType {
  cart: CartWithDetails | null
  isLoading: boolean
  addToCart: (menuItem: MenuItem, quantity: number, specialInstructions?: string) => Promise<void>
  updateCartItem: (cartItemId: string, quantity: number, specialInstructions?: string) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  getCartTotal: () => number
  getCartItemCount: () => number
  calculateTotals: () => {
    subtotal: number
    tax: number
    deliveryFee: number
    total: number
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const DELIVERY_FEE = 50 // ₹50 delivery fee
const TAX_RATE = 0.18 // 18% GST

// Generate session ID for anonymous users
const generateSessionId = () => {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('cart-session-id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
      localStorage.setItem('cart-session-id', sessionId)
    }
    return sessionId
  }
  return null
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [cart, setCart] = useState<CartWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [databaseUserId, setDatabaseUserId] = useState<string | null>(null)
  // Eagerly generate sessionId for guests on mount
  React.useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      generateSessionId();
    }
  }, [user])

  // Get database user ID when user is available
  useEffect(() => {
    if (user && isLoaded) {
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
    } else {
      setDatabaseUserId(null)
    }
  }, [user, isLoaded])

  // Get session ID for anonymous users
  const sessionId = !user && typeof window !== 'undefined' ? localStorage.getItem('cart-session-id') || generateSessionId() : null
  
  // Create auth context for API calls
  const authContext = useMemo(() => {
    return databaseUserId ? { userId: databaseUserId } : sessionId ? { sessionId } : undefined
  }, [databaseUserId, sessionId])

  // Fetch cart data
  const { data: cartData, refetch } = useApi(
    () => apiClient.cart.getCart(authContext),
    [databaseUserId, sessionId], // Refetch when database user or session changes
    { 
      enabled: isLoaded && (!!databaseUserId || !!sessionId),
    }
  )

  // Update cart state when data changes
  useEffect(() => {
    if (cartData) {
      setCart(cartData as CartWithDetails)
    }
    setIsLoading(false)
  }, [cartData])

  const refreshCart = useCallback(async () => {
    await refetch()
  }, [refetch])

  const addToCart = useCallback(async (
    menuItem: MenuItem, 
    quantity: number, 
    specialInstructions?: string
  ) => {
    try {
      setIsLoading(true)
      const response = await apiClient.cart.addToCart({
        menuItemId: menuItem.id,
        quantity,
        specialInstructions,
      }, authContext)

      if (response.success) {
        // Always refresh cart after add for guests (sessionId)
        await refreshCart()
      } else {
        throw new Error(response.error || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart')
    } finally {
      setIsLoading(false)
    }
  }, [authContext, refreshCart])

  const updateCartItem = useCallback(async (
    cartItemId: string, 
    quantity: number, 
    specialInstructions?: string
  ) => {
    try {
      setIsLoading(true)
      const response = await apiClient.cart.updateCartItem(cartItemId, {
        quantity,
        specialInstructions,
      }, authContext)

      if (response.success) {
        await refreshCart()
      } else {
        throw new Error(response.error || 'Failed to update cart item')
      }
    } catch (error) {
      console.error('Update cart error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update cart item')
    } finally {
      setIsLoading(false)
    }
  }, [authContext, refreshCart])

  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      setIsLoading(true)
      const response = await apiClient.cart.removeFromCart(cartItemId, authContext)

      if (response.success) {
        await refreshCart()
      } else {
        throw new Error(response.error || 'Failed to remove item from cart')
      }
    } catch (error) {
      console.error('Remove from cart error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove item from cart')
    } finally {
      setIsLoading(false)
    }
  }, [authContext, refreshCart])

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.cart.clearCart(authContext)

      if (response.success) {
        toast.success('Cart cleared')
        await refreshCart()
      } else {
        throw new Error(response.error || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Clear cart error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to clear cart')
    } finally {
      setIsLoading(false)
    }
  }, [authContext, refreshCart])

  const getCartTotal = useCallback(() => {
    if (!cart) return 0
    return cart.totalAmount
  }, [cart])

  const getCartItemCount = useCallback(() => {
    if (!cart) return 0
    return cart.totalItems
  }, [cart])

  const calculateTotals = useCallback(() => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = parsePrice(item.unitPrice)
      return sum + (price * item.quantity)
    }, 0)
    
    const tax = subtotal * TAX_RATE
    const deliveryFee = cart.items.length > 0 ? DELIVERY_FEE : 0
    const total = subtotal + tax + deliveryFee

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      deliveryFee,
      total: Math.round(total * 100) / 100,
    }
  }, [cart])

  const contextValue: CartContextType = {
    cart,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartTotal,
    getCartItemCount,
    calculateTotals,
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Utility hook for cart item count (for header badge)
export function useCartItemCount() {
  const { getCartItemCount } = useCart()
  return getCartItemCount()
}

// Utility hook for cart total (for display)
export function useCartTotal() {
  const { getCartTotal } = useCart()
  return getCartTotal()
}
