import { useUser } from '@clerk/nextjs';
import { useApi, useAuthenticatedApi, useMutation } from './useApi';
import { apiClient } from '@/lib/api/client';

// Menu hooks
export function useCategories(activeOnly = true) {
  return useApi(
    () => apiClient.menu.getCategories(),
    [activeOnly]
  );
}

export function useMenuItems(categoryId?: string) {
  return useApi(
    () => apiClient.menu.getMenuItems(categoryId),
    [categoryId]
  );
}

export function useMenuItem(id: string) {
  return useApi(
    () => apiClient.menu.getMenuItem(id),
    [id]
  );
}

export function useMenuSearch(query: string) {
  return useApi(
    () => apiClient.menu.searchMenuItems(query),
    [query],
    { enabled: query.length > 0 }
  );
}

// User profile hooks
export function useUserProfile() {
  return useAuthenticatedApi(() => apiClient.auth.getProfile());
}

export function useUpdateProfile() {
  return useMutation(apiClient.auth.updateProfile);
}

// Address hooks
export function useUserAddresses() {
  const { user } = useUser();
  
  return useAuthenticatedApi(
    () => apiClient.addresses.getUserAddresses(),
    [user?.id]
  );
}

export function useCreateAddress() {
  return useMutation(apiClient.addresses.createAddress);
}

export function useUpdateAddress() {
  return useMutation(
    ({ addressId, data }: { addressId: string; data: Record<string, unknown> }) =>
      apiClient.addresses.updateAddress(addressId, data as Record<string, unknown>)
  );
}

export function useDeleteAddress() {
  return useMutation(
    (addressId: string) => apiClient.addresses.deleteAddress(addressId)
  );
}

export function useSetDefaultAddress() {
  return useMutation(
    (addressId: string) => apiClient.addresses.setDefaultAddress(addressId)
  );
}

// Order hooks
export function useUserOrders(params?: { page?: number; limit?: number; status?: string }) {
  const { user } = useUser();
  
  return useAuthenticatedApi(
    () => apiClient.orders.getUserOrders(params),
    [user?.id, params?.page, params?.limit, params?.status]
  );
}

export function useOrder(orderId: string) {
  return useAuthenticatedApi(
    () => apiClient.orders.getOrder(orderId),
    [orderId]
  );
}

export function useCreateOrder() {
  return useMutation(apiClient.orders.createOrder);
}

export function useCancelOrder() {
  return useMutation(
    ({ orderId, reason }: { orderId: string; reason?: string }) =>
      apiClient.orders.cancelOrder(orderId, reason)
  );
}

export function useOrderTracking(orderId: string) {
  return useAuthenticatedApi(
    () => apiClient.orders.trackOrder(orderId),
    [orderId]
  );
}

// Offers hooks
export function useOffers(type?: string, targetAudience?: string) {
  return useApi(
    () => apiClient.offers.getActiveOffers(type, targetAudience),
    [type, targetAudience]
  );
}

export function usePopupOffers() {
  const { user } = useUser();
  
  return useApi(
    () => apiClient.offers.getPopupOffers(user?.id),
    [user?.id]
  );
}

export function useTrackOfferInteraction() {
  return useMutation(apiClient.offers.trackOfferInteraction);
}

export function useValidateOffer() {
  return useMutation(
    ({ offerId, orderAmount }: { offerId: string; orderAmount: number }) =>
      apiClient.offers.validateOffer(offerId, orderAmount)
  );
}

// Notification hooks
export function useNotifications(unreadOnly = false) {
  const { user } = useUser();
  
  return useAuthenticatedApi(
    () => apiClient.notifications.getUserNotifications(user?.id || '', unreadOnly),
    [user?.id, unreadOnly]
  );
}

export function useMarkNotificationAsRead() {
  return useMutation(
    (notificationId: string) => 
      apiClient.notifications.markAsRead(notificationId)
  );
}

export function useMarkAllNotificationsAsRead() {
  const { user } = useUser();
  
  return useMutation(
    () => apiClient.notifications.markAllAsRead(user?.id || '')
  );
}

// Loyalty hooks
export function useLoyaltyPoints() {
  const { user } = useUser();
  
  return useAuthenticatedApi(
    () => apiClient.loyalty.getUserLoyaltyPoints(user?.id || ''),
    [user?.id]
  );
}

export function useLoyaltyHistory() {
  const { user } = useUser();
  
  return useAuthenticatedApi(
    () => apiClient.loyalty.getLoyaltyHistory(user?.id || ''),
    [user?.id]
  );
}

// Admin hooks
export function useAllOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useAuthenticatedApi(
    () => apiClient.admin.getAllOrders(params),
    [params?.page, params?.limit, params?.status]
  );
}

export function useOrderStats() {
  return useAuthenticatedApi(() => apiClient.admin.getOrderStats());
}

export function useAllMenuItems() {
  return useAuthenticatedApi(() => apiClient.admin.getAllMenuItems());
}

export function useAllUsers() {
  return useAuthenticatedApi(() => apiClient.admin.getAllUsers());
}

export function useUpdateOrderStatus() {
  return useMutation(
    ({ orderId, status, kitchenNotes }: { orderId: string; status: string; kitchenNotes?: string }) =>
      apiClient.admin.updateOrderStatus(orderId, status, kitchenNotes)
  );
}

export function useCreateMenuItem() {
  return useMutation(apiClient.admin.createMenuItem);
}

export function useUpdateMenuItem() {
  return useMutation(
    (data: { itemId: string; available?: boolean; name?: string; description?: string; price?: string; categoryId?: string }) =>
      apiClient.admin.updateMenuItem(data)
  );
}

export function useDeleteMenuItem() {
  return useMutation(
    (itemId: string) => apiClient.admin.deleteMenuItem(itemId)
  );
}

export function useCreateOffer() {
  return useMutation(apiClient.admin.createOffer);
}

export function useUpdateOffer() {
  return useMutation(
    ({ offerId, data }: { offerId: string; data: Record<string, unknown> }) =>
      apiClient.admin.updateOffer(offerId, data as Record<string, unknown>)
  );
}

export function useDeleteOffer() {
  return useMutation(
    (offerId: string) => apiClient.admin.deleteOffer(offerId)
  );
}

// Cart hooks
export function useCart() {
  return useApi(
    () => apiClient.cart.getCart(),
    []
  );
}

export function useAddToCart() {
  return useMutation(
    (data: { menuItemId: string; quantity: number; specialInstructions?: string; addOns?: string[] }) =>
      apiClient.cart.addToCart(data)
  );
}

export function useUpdateCartItem() {
  return useMutation(
    ({ cartItemId, ...data }: { cartItemId: string; quantity: number; specialInstructions?: string; addOns?: string[] }) =>
      apiClient.cart.updateCartItem(cartItemId, data)
  );
}

export function useRemoveFromCart() {
  return useMutation(
    (cartItemId: string) => apiClient.cart.removeFromCart(cartItemId)
  );
}

export function useClearCart() {
  return useMutation(
    () => apiClient.cart.clearCart()
  );
}
