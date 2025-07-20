"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { CartItem, MenuItem } from '@/types'
import { useCreateOrder, useValidateOffer } from '@/lib/hooks/useApiData'
import { CreateOrderRequest } from '@/lib/api/client'
import { toast } from 'sonner'

interface CartState {
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  deliveryFee: number
  discount: number
  appliedOffer?: {
    id: string
    discountAmount: number
    title: string
  }
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'APPLY_OFFER'; payload: { id: string; discountAmount: number; title: string } }
  | { type: 'REMOVE_OFFER' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

interface CartContextType {
  state: CartState
  addItem: (menuItem: MenuItem, quantity: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  applyOffer: (offerId: string) => Promise<void>
  removeOffer: () => void
  clearCart: () => void
  getItemCount: () => number
  checkout: (deliveryAddressId: string, customerNotes?: string) => Promise<void>
  isCheckingOut: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const DELIVERY_FEE = 50 // ₹50 delivery fee
const TAX_RATE = 0.18 // 18% GST

const calculateTotals = (items: CartItem[], discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.menuItem.price === 'string' 
      ? parseFloat(item.menuItem.price) 
      : item.menuItem.price
    return sum + (price * item.quantity)
  }, 0)
  
  const tax = subtotal * TAX_RATE
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0
  const total = subtotal + tax + deliveryFee - discount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    deliveryFee,
    discount,
    total: Math.max(0, Math.round(total * 100) / 100)
  }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, quantity } = action.payload
      const existingItemIndex = state.items.findIndex(item => item.menuItem.id === menuItem.id)

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart_${menuItem.id}_${Date.now()}`,
          menuItem,
          quantity
        }
        newItems = [...state.items, newItem]
      }

      const totals = calculateTotals(newItems, state.discount)

      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id)
      const totals = calculateTotals(newItems, state.discount)

      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.id !== id)
        const totals = calculateTotals(newItems, state.discount)

        return {
          ...state,
          items: newItems,
          ...totals
        }
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      const totals = calculateTotals(newItems, state.discount)

      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case 'APPLY_OFFER': {
      const totals = calculateTotals(state.items, action.payload.discountAmount)
      
      return {
        ...state,
        appliedOffer: action.payload,
        ...totals
      }
    }

    case 'REMOVE_OFFER': {
      const totals = calculateTotals(state.items, 0)
      
      return {
        ...state,
        appliedOffer: undefined,
        ...totals
      }
    }

    case 'CLEAR_CART':
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
        appliedOffer: undefined
      }

    case 'LOAD_CART':
      return action.payload

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  deliveryFee: 0,
  discount: 0,
  total: 0,
  appliedOffer: undefined
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user, isLoaded } = useUser()
  const { mutate: createOrder, loading: isCheckingOut } = useCreateOrder()
  const { mutate: validateOffer } = useValidateOffer()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state))
  }, [state])

  const addItem = (menuItem: MenuItem, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, quantity } })
    toast.success(`${menuItem.name} added to cart`)
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
    toast.success('Item removed from cart')
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const applyOffer = async (offerId: string) => {
    try {
      const result = await validateOffer({
        offerId,
        orderAmount: state.subtotal
      }) as { isValid: boolean; discountAmount: number; message: string }
      
      if (result.isValid) {
        dispatch({ 
          type: 'APPLY_OFFER', 
          payload: { 
            id: offerId, 
            discountAmount: result.discountAmount,
            title: result.message || 'Offer Applied'
          } 
        })
        toast.success('Offer applied successfully!')
      } else {
        toast.error(result.message || 'Invalid offer')
      }
    } catch (error) {
      console.error('Error applying offer:', error)
      toast.error('Failed to apply offer')
    }
  }

  const removeOffer = () => {
    dispatch({ type: 'REMOVE_OFFER' })
    toast.success('Offer removed')
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Cart cleared')
  }

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const checkout = async (deliveryAddressId: string, customerNotes?: string) => {
    if (!isLoaded || !user) {
      toast.error('Please sign in to place an order')
      return
    }

    if (state.items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      const orderData: CreateOrderRequest = {
        items: state.items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          specialInstructions: undefined, // Can be added per item in the future
        })),
        deliveryAddressId,
        customerNotes,
        couponCode: state.appliedOffer?.id,
      }

      const order = await createOrder(orderData) as { id: string }
      
      if (order) {
        clearCart()
        toast.success('Order placed successfully!')
        // Navigate to order confirmation page
        window.location.href = `/orders/${order.id}`
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to place order. Please try again.')
    }
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    applyOffer,
    removeOffer,
    clearCart,
    getItemCount,
    checkout,
    isCheckingOut
  }

  return (
    <CartContext.Provider value={value}>
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
