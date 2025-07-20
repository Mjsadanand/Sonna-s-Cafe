import { db } from '@/lib/db';
import { carts, cartItems, menuItems, Cart, CartItem, MenuItem } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export interface CartItemWithDetails extends Omit<CartItem, 'menuItemId'> {
  menuItem: MenuItem;
}

export interface CartWithDetails extends Cart {
  items: CartItemWithDetails[];
  totalItems: number;
  totalAmount: number;
}

export interface AddToCartData {
  userId?: string;
  sessionId?: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  addOns?: string[];
}

export interface UpdateCartItemData {
  quantity: number;
  specialInstructions?: string;
  addOns?: string[];
}

export class CartService {
  /**
   * Get or create a cart for user/session
   */
  static async getOrCreateCart(userId?: string, sessionId?: string): Promise<string> {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    // Try to find existing cart
    const existingCart = await db
      .select()
      .from(carts)
      .where(
        userId 
          ? eq(carts.userId, userId)
          : eq(carts.sessionId, sessionId!)
      )
      .limit(1);

    if (existingCart[0]) {
      return existingCart[0].id;
    }

    // Create new cart
    const [newCart] = await db
      .insert(carts)
      .values({
        userId,
        sessionId,
      })
      .returning();

    return newCart.id;
  }

  /**
   * Get cart with all items and details
   */
  static async getCartWithDetails(userId?: string, sessionId?: string): Promise<CartWithDetails | null> {
    if (!userId && !sessionId) {
      return null;
    }

    // Find cart
    const cart = await db
      .select()
      .from(carts)
      .where(
        userId 
          ? eq(carts.userId, userId)
          : eq(carts.sessionId, sessionId!)
      )
      .limit(1);

    if (!cart[0]) {
      return null;
    }

    // Get cart items with menu item details
    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
        specialInstructions: cartItems.specialInstructions,
        addOns: cartItems.addOns,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        menuItem: menuItems,
      })
      .from(cartItems)
      .innerJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
      .where(eq(cartItems.cartId, cart[0].id));

    // Calculate totals
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

    return {
      ...cart[0],
      items,
      totalItems,
      totalAmount,
    };
  }

  /**
   * Add item to cart
   */
  static async addToCart(data: AddToCartData): Promise<CartItemWithDetails> {
    const { userId, sessionId, menuItemId, quantity, specialInstructions, addOns } = data;

    // Get or create cart
    const cartId = await this.getOrCreateCart(userId, sessionId);

    // Get menu item for price
    const menuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, menuItemId))
      .limit(1);

    if (!menuItem[0]) {
      throw new Error('Menu item not found');
    }

    if (!menuItem[0].isAvailable) {
      throw new Error('Menu item is not available');
    }

    // Check if item already exists in cart
    const existingCartItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.menuItemId, menuItemId)
        )
      )
      .limit(1);

    if (existingCartItem[0]) {
      // Update quantity if item exists
      const newQuantity = existingCartItem[0].quantity + quantity;
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          specialInstructions: specialInstructions || existingCartItem[0].specialInstructions,
          addOns: addOns || existingCartItem[0].addOns,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingCartItem[0].id))
        .returning();

      return {
        ...updatedItem,
        menuItem: menuItem[0],
      };
    } else {
      // Add new item to cart
      const [newCartItem] = await db
        .insert(cartItems)
        .values({
          cartId,
          menuItemId,
          quantity,
          unitPrice: menuItem[0].price,
          specialInstructions,
          addOns,
        })
        .returning();

      return {
        ...newCartItem,
        menuItem: menuItem[0],
      };
    }
  }

  /**
   * Update cart item quantity or details
   */
  static async updateCartItem(
    cartItemId: string, 
    data: UpdateCartItemData,
    userId?: string,
    sessionId?: string
  ): Promise<CartItemWithDetails> {
    // Verify cart ownership
    const cartItem = await db
      .select({
        cartItem: cartItems,
        cart: carts,
        menuItem: menuItems,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .innerJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
      .where(eq(cartItems.id, cartItemId))
      .limit(1);

    if (!cartItem[0]) {
      throw new Error('Cart item not found');
    }

    const cart = cartItem[0].cart;
    if ((userId && cart.userId !== userId) || (sessionId && cart.sessionId !== sessionId)) {
      throw new Error('Access denied');
    }

    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Update cart item
    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity: data.quantity,
        specialInstructions: data.specialInstructions,
        addOns: data.addOns,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId))
      .returning();

    return {
      ...updatedItem,
      menuItem: cartItem[0].menuItem,
    };
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(
    cartItemId: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    // Verify cart ownership
    const cartItem = await db
      .select({
        cartItem: cartItems,
        cart: carts,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(eq(cartItems.id, cartItemId))
      .limit(1);

    if (!cartItem[0]) {
      throw new Error('Cart item not found');
    }

    const cart = cartItem[0].cart;
    if ((userId && cart.userId !== userId) || (sessionId && cart.sessionId !== sessionId)) {
      throw new Error('Access denied');
    }

    await db
      .delete(cartItems)
      .where(eq(cartItems.id, cartItemId));
  }

  /**
   * Clear entire cart
   */
  static async clearCart(userId?: string, sessionId?: string): Promise<void> {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    const cart = await db
      .select()
      .from(carts)
      .where(
        userId 
          ? eq(carts.userId, userId)
          : eq(carts.sessionId, sessionId!)
      )
      .limit(1);

    if (cart[0]) {
      await db
        .delete(cartItems)
        .where(eq(cartItems.cartId, cart[0].id));
    }
  }

  /**
   * Merge session cart with user cart (when user logs in)
   */
  static async mergeSessionCartWithUserCart(userId: string, sessionId: string): Promise<void> {
    // Get session cart
    const sessionCart = await this.getCartWithDetails(undefined, sessionId);
    if (!sessionCart || sessionCart.items.length === 0) {
      return;
    }

    // Get or create user cart (we don't need to store the ID)
    await this.getOrCreateCart(userId);

    // Move all items from session cart to user cart
    for (const item of sessionCart.items) {
      await this.addToCart({
        userId,
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || undefined,
        addOns: item.addOns || undefined,
      });
    }

    // Delete session cart
    await db
      .delete(cartItems)
      .where(eq(cartItems.cartId, sessionCart.id));
    
    await db
      .delete(carts)
      .where(eq(carts.id, sessionCart.id));
  }

  /**
   * Clean up old anonymous carts (cleanup job)
   */
  static async cleanupOldCarts(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const oldCarts = await db
      .select()
      .from(carts)
      .where(isNull(carts.userId)); // Anonymous carts only

    let deletedCount = 0;
    for (const cart of oldCarts) {
      if (cart.createdAt < cutoffDate) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
        await db.delete(carts).where(eq(carts.id, cart.id));
        deletedCount++;
      }
    }

    return deletedCount;
  }
}
