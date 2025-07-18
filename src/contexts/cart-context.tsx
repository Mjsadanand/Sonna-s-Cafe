"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { CartItem, MenuItem } from '@/types'

interface CartState {
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  deliveryFee: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

interface CartContextType {
  state: CartState
  addItem: (menuItem: MenuItem, quantity: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const DELIVERY_FEE = 2.99
const TAX_RATE = 0.08

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax + (items.length > 0 ? DELIVERY_FEE : 0)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    deliveryFee: items.length > 0 ? DELIVERY_FEE : 0,
    total: Math.round(total * 100) / 100
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

      const totals = calculateTotals(newItems)

      return {
        items: newItems,
        ...totals
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id)
      const totals = calculateTotals(newItems)

      return {
        items: newItems,
        ...totals
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.id !== id)
        const totals = calculateTotals(newItems)

        return {
          items: newItems,
          ...totals
        }
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      const totals = calculateTotals(newItems)

      return {
        items: newItems,
        ...totals
      }
    }

    case 'CLEAR_CART':
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0
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
  total: 0
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

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
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount
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
