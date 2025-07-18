// Authentication types
export interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

// Menu and food item types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: Category
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT'
  preparationTime: number
  ingredients: string[]
}

// Cart types
export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  specialInstructions?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  deliveryFee: number
}

// Order types
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  total: number
  subtotal: number
  tax: number
  deliveryFee: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CARD' | 'CASH' | 'UPI'
  deliveryAddress: Address
  phone: string
  specialInstructions?: string
  estimatedDeliveryTime: Date
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Component prop types
export interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem, quantity: number) => void
}

export interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

// Form types
export interface CheckoutFormData {
  email: string
  phone: string
  address: Address
  paymentMethod: 'CARD' | 'CASH' | 'UPI'
  specialInstructions?: string
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

// Admin types
export interface AdminStats {
  totalOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  completedOrders: number
}

export interface SalesReport {
  date: string
  orders: number
  revenue: number
}

export interface PopularItem {
  id: string
  name: string
  orderCount: number
  revenue: number
}
