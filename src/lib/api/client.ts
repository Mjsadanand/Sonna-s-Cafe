import { 
  Order
} from '@/lib/db/schema';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Request/Response types
export interface CreateOrderRequest {
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  deliveryAddressId: string;
  customerNotes?: string;
  couponCode?: string;
}

export interface UserSyncRequest {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateAddressRequest {
  userId: string;
  type?: string;
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  landmark?: string;
  instructions?: string;
  isDefault?: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface CreateOfferRequest {
  title: string;
  description: string;
  type: 'banner' | 'popup' | 'notification';
  discountType: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue: string;
  minimumOrderAmount?: string;
  maximumDiscountAmount?: string;
  targetAudience?: 'all' | 'new_customers' | 'loyal_customers' | 'birthday' | 'anniversary';
  occasionType?: 'birthday' | 'anniversary' | 'festival' | 'regular';
  usageLimit?: number;
  priority?: number;
  validFrom: Date;
  validUntil: Date;
  popupDelaySeconds?: number;
  showFrequencyHours?: number;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: string;
  image?: string;
  categoryId: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT';
  preparationTime?: number;
  ingredients?: string[];
  nutritionInfo?: Record<string, unknown>;
  tags?: string[];
  isPopular?: boolean;
  sortOrder?: number;
}

export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authContext?: { userId?: string; sessionId?: string }
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`;
      
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication headers if provided
      if (authContext?.userId) {
        defaultHeaders['x-user-id'] = authContext.userId;
      } else if (authContext?.sessionId) {
        defaultHeaders['x-session-id'] = authContext.sessionId;
      } else if (typeof window !== 'undefined') {
        // Fallback: Generate session ID for anonymous users
        let sessionId = localStorage.getItem('cart-session-id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          localStorage.setItem('cart-session-id', sessionId);
        }
        defaultHeaders['x-session-id'] = sessionId;
      }

      // Add admin token for admin endpoints
      if (endpoint.startsWith('/admin')) {
        const adminToken = localStorage.getItem('admin-token');
        if (adminToken) {
          defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
        }
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON (likely HTML error page)
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        return {
          success: false,
          error: `Server error: Expected JSON response but got ${contentType || 'unknown content type'}`,
          data: undefined,
        };
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        return {
          success: false,
          error: 'Failed to parse server response',
          data: undefined,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Something went wrong',
          data: undefined,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API Client Error:', error);
      return {
        success: false,
        error: 'Network error occurred',
        data: undefined,
      };
    }
  }

  // Auth endpoints
  auth = {
    syncUser: (userData: UserSyncRequest) =>
      this.request('/auth/sync', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    getProfile: () => this.request('/user/profile'),

    updateProfile: (data: UpdateProfileRequest) =>
      this.request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // Menu endpoints
  menu = {
    getCategories: () => this.request('/menu/categories'),
    
    getMenuItems: (categoryId?: string) => {
      const params = categoryId ? `?categoryId=${categoryId}` : '';
      return this.request(`/menu/items${params}`);
    },

    getMenuItem: (id: string) => this.request(`/menu/items/${id}`),

    searchMenuItems: (query: string) =>
      this.request(`/menu/search?q=${encodeURIComponent(query)}`),
  };

  // Cart endpoints
  cart = {
    getCart: (authContext?: { userId?: string; sessionId?: string }) => 
      this.request('/cart', {}, authContext),

    addToCart: (data: {
      menuItemId: string;
      quantity: number;
      specialInstructions?: string;
      addOns?: string[];
    }, authContext?: { userId?: string; sessionId?: string }) =>
      this.request('/cart', {
        method: 'POST',
        body: JSON.stringify(data),
      }, authContext),

    updateCartItem: (cartItemId: string, data: {
      quantity: number;
      specialInstructions?: string;
      addOns?: string[];
    }, authContext?: { userId?: string; sessionId?: string }) =>
      this.request(`/cart/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, authContext),

    removeFromCart: (cartItemId: string, authContext?: { userId?: string; sessionId?: string }) =>
      this.request(`/cart/${cartItemId}`, {
        method: 'DELETE',
      }, authContext),

    clearCart: (authContext?: { userId?: string; sessionId?: string }) =>
      this.request('/cart', {
        method: 'DELETE',
      }, authContext),
  };

  // Cart & Orders endpoints
  orders = {
    createOrder: (orderData: CreateOrderRequest) =>
      this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),

    getUserOrders: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams({
        ...(params?.page && { page: params.page.toString() }),
        ...(params?.limit && { limit: params.limit.toString() }),
        ...(params?.status && { status: params.status }),
      });
      return this.request<Order[]>(`/orders?${searchParams.toString()}`);
    },

    getOrder: (orderId: string) => this.request(`/orders/${orderId}`),

    updateOrderStatus: (orderId: string, status: string) =>
      this.request(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    cancelOrder: (orderId: string, reason?: string) =>
      this.request(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    trackOrder: (orderId: string) => this.request(`/orders/${orderId}/track`),
  };

  // Address endpoints
  addresses = {
    getUserAddresses: () =>
      this.request('/user/addresses'),

    createAddress: (addressData: Omit<CreateAddressRequest, 'userId'>) =>
      this.request('/user/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      }),

    updateAddress: (addressId: string, addressData: Partial<Omit<CreateAddressRequest, 'userId'>>) =>
      this.request(`/user/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      }),

    deleteAddress: (addressId: string) =>
      this.request(`/user/addresses/${addressId}`, {
        method: 'DELETE',
      }),

    setDefaultAddress: (addressId: string) =>
      this.request(`/user/addresses/${addressId}/default`, {
        method: 'PUT',
      }),
  };

  // Offers endpoints
  offers = {
    getActiveOffers: (type?: string, targetAudience?: string) => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (targetAudience) params.append('targetAudience', targetAudience);
      return this.request(`/offers?${params.toString()}`);
    },

    getPopupOffers: (userId?: string, sessionId?: string) => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (sessionId) params.append('sessionId', sessionId);
      return this.request(`/offers/popup?${params.toString()}`);
    },

    trackOfferInteraction: (data: {
      offerId: string;
      interactionType: string;
      userId?: string;
      sessionId?: string;
      orderId?: string;
    }) =>
      this.request('/offers/interact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    validateOffer: (offerId: string, orderAmount: number) =>
      this.request('/offers/validate', {
        method: 'POST',
        body: JSON.stringify({ offerId, orderAmount }),
      }),
  };

  // Admin endpoints
  admin = {
    getAllOrders: (params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams({
        ...(params?.page && { page: params.page.toString() }),
        ...(params?.limit && { limit: params.limit.toString() }),
        ...(params?.status && { status: params.status }),
      });
      const query = searchParams.toString();
      return this.request<Order[]>(`/admin/orders${query ? `?${query}` : ''}`);
    },

    updateOrderStatus: (orderId: string, status: string, kitchenNotes?: string) =>
      this.request(`/admin/orders`, {
        method: 'PUT',
        body: JSON.stringify({ orderId, status, kitchenNotes }),
      }),

    getOrderStats: () => this.request('/admin/stats'),

    getAllMenuItems: () => this.request('/admin/menu-items'),

    updateMenuItem: (data: { itemId: string; available?: boolean; name?: string; description?: string; price?: string; categoryId?: string }) =>
      this.request(`/admin/menu-items`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    getAllUsers: () => this.request('/admin/users'),

    createMenuItem: (data: CreateMenuItemRequest) =>
      this.request('/admin/menu/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    deleteMenuItem: (itemId: string) =>
      this.request(`/admin/menu/items/${itemId}`, {
        method: 'DELETE',
      }),

    createOffer: (data: CreateOfferRequest) =>
      this.request('/admin/offers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateOffer: (offerId: string, data: Partial<CreateOfferRequest>) =>
      this.request(`/admin/offers/${offerId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteOffer: (offerId: string) =>
      this.request(`/admin/offers/${offerId}`, {
        method: 'DELETE',
      }),
  };

  // Notifications endpoints
  notifications = {
    getUserNotifications: (userId: string, unreadOnly = false) => {
      const params = unreadOnly ? '?unreadOnly=true' : '';
      return this.request(`/notifications?userId=${userId}${params}`);
    },

    markAsRead: (notificationId: string) =>
      this.request(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      }),

    markAllAsRead: (userId: string) =>
      this.request('/notifications/read-all', {
        method: 'PUT',
        body: JSON.stringify({ userId }),
      }),
  };

  // Payment endpoints (placeholder for future integration)
  payment = {
    createPaymentIntent: (orderData: CreatePaymentIntentRequest) =>
      this.request('/payment/create-intent', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),

    confirmPayment: (paymentIntentId: string) =>
      this.request('/payment/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId }),
      }),
  };

  // Loyalty endpoints
  loyalty = {
    getUserLoyaltyPoints: (userId: string) =>
      this.request(`/loyalty/points?userId=${userId}`),

    getLoyaltyHistory: (userId: string) =>
      this.request(`/loyalty/history?userId=${userId}`),
  };

  // Upload endpoints
  upload = {
    uploadImage: (file: File, type: 'menu' | 'profile' | 'review') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      return this.request('/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData
        },
      });
    },
  };
}

export const apiClient = new ApiClient();
export default apiClient;
