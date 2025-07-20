import { db } from '@/lib/db';
import { orders, orderItems, menuItems, categories, addresses, users } from '@/lib/db/schema';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { generateOrderNumber, calculateDeliveryTime } from '@/lib/utils';
import { LoyaltyService } from './loyalty.service';
import { NotificationService } from './notification.service';

export interface CreateOrderData {
  userId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  deliveryAddressId: string;
  customerNotes?: string;
  couponCode?: string;
}

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: string;
  tax: string;
  deliveryFee: string;
  discount: string;
  total: string;
  paymentStatus: string;
  customerNotes: string | null;
  estimatedDeliveryTime: Date | null;
  actualDeliveryTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: {
    id: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    landmark: string | null;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    specialInstructions: string | null;
    menuItem: {
      id: string;
      name: string;
      description: string;
      price: string;
      image: string;
      category: {
        id: string;
        name: string;
      };
    };
  }>;
}

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(data: CreateOrderData): Promise<OrderWithDetails> {
    try {
      // Fetch menu items to calculate totals
      const menuItemIds = data.items.map(item => item.menuItemId);
      const orderMenuItems = await db
        .select({
          id: menuItems.id,
          price: menuItems.price,
          name: menuItems.name,
        })
        .from(menuItems)
        .where(inArray(menuItems.id, menuItemIds));

      // Calculate order totals
      let subtotal = 0;
      const orderItemsData = data.items.map(item => {
        const menuItem = orderMenuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found`);
        }
        const price = typeof menuItem.price === 'string' ? parseFloat(menuItem.price) : menuItem.price;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: price.toFixed(2),
          totalPrice: itemTotal.toFixed(2),
          specialInstructions: item.specialInstructions || null,
        };
      });

      const tax = subtotal * 0.18; // 18% GST
      const deliveryFee = subtotal >= 500 ? 0 : 50;
      const total = subtotal + tax + deliveryFee;

      // Generate order number
      const orderNumber = generateOrderNumber();
      
      // Create order
      const [newOrder] = await db
        .insert(orders)
        .values({
          orderNumber,
          userId: data.userId,
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          total: total.toFixed(2),
          deliveryAddressId: data.deliveryAddressId,
          customerNotes: data.customerNotes || null,
          estimatedDeliveryTime: calculateDeliveryTime(),
        })
        .returning();

      // Create order items
      await db
        .insert(orderItems)
        .values(
          orderItemsData.map(item => ({
            orderId: newOrder.id,
            ...item,
          }))
        )
        .returning();

      // Award loyalty points
      await LoyaltyService.awardPoints(data.userId, Math.floor(total));

      // Send WhatsApp notification to admin
      try {
        // Fetch user information
        const [user] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
          })
          .from(users)
          .where(eq(users.id, data.userId));

        // Fetch delivery address
        const [address] = await db
          .select({
            addressLine1: addresses.addressLine1,
            addressLine2: addresses.addressLine2,
            city: addresses.city,
            state: addresses.state,
            postalCode: addresses.postalCode,
          })
          .from(addresses)
          .where(eq(addresses.id, data.deliveryAddressId));

        if (user && address) {
          const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer';
          const customerPhone = user.phone || 'Not provided';
          
          const deliveryAddress = `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} ${address.postalCode}`;

          // Prepare notification data
          const notificationData = {
            orderNumber,
            customerName,
            customerPhone,
            items: orderItemsData.map(item => {
              const menuItem = orderMenuItems.find(mi => mi.id === item.menuItemId);
              return {
                name: menuItem?.name || 'Unknown Item',
                quantity: item.quantity,
                price: item.totalPrice,
              };
            }),
            total: total.toFixed(2),
            deliveryAddress,
            estimatedDeliveryTime: newOrder.estimatedDeliveryTime
              ? newOrder.estimatedDeliveryTime.toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  dateStyle: 'short',
                  timeStyle: 'short',
                })
              : '',
          };

          // Send notification (async, don't wait for completion)
          NotificationService.sendOrderNotificationToAdmin(notificationData)
            .then(result => {
              if (result.success) {

              } else {
                console.error('❌ Failed to send WhatsApp notification to admin:', result.error);
              }
            })
            .catch(error => {
              console.error('❌ Error sending WhatsApp notification to admin:', error);
            });
        }
      } catch (error) {
        console.error('❌ Error preparing WhatsApp notification data:', error);
        // Don't throw error here as order creation was successful
      }

      // Fetch and return complete order details
      return await this.getOrderById(newOrder.id);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Get order by ID with all details
   */
  static async getOrderById(orderId: string, userId?: string): Promise<OrderWithDetails> {
    const orderData = await db
      .select({
        order: orders,
        address: addresses,
        orderItem: orderItems,
        menuItem: menuItems,
        category: categories,
      })
      .from(orders)
      .leftJoin(addresses, eq(orders.deliveryAddressId, addresses.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(
        userId 
          ? and(eq(orders.id, orderId), eq(orders.userId, userId))
          : eq(orders.id, orderId)
      );

    if (!orderData.length) {
      throw new Error('Order not found');
    }

    const order = orderData[0].order;
    const address = orderData[0].address;
    
    // Group order items
    const items = orderData
      .filter(row => row.orderItem)
      .map(row => ({
        id: row.orderItem!.id,
        quantity: row.orderItem!.quantity,
        unitPrice: row.orderItem!.unitPrice,
        totalPrice: row.orderItem!.totalPrice,
        specialInstructions: row.orderItem!.specialInstructions,
        menuItem: {
          id: row.menuItem!.id,
          name: row.menuItem!.name,
          description: row.menuItem!.description || '',
          price: row.menuItem!.price,
          image: row.menuItem!.image || '/images/placeholder-food.jpg',
          category: {
            id: row.category!.id,
            name: row.category!.name,
          },
        },
      }));

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      deliveryFee: order.deliveryFee,
      discount: order.discount ?? '0.00',
      total: order.total,
      paymentStatus: order.paymentStatus,
      customerNotes: order.customerNotes,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deliveryAddress: address ? {
        id: address.id,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        landmark: address.landmark,
      } : null,
      items,
    };
  }

  /**
   * Get user orders with pagination
   */
  static async getUserOrders(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
    } = {}
  ): Promise<{
    orders: OrderWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [eq(orders.userId, userId)];
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(...conditions));

    // Get orders
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get order details for each order
    const orderDetails = await Promise.all(
      userOrders.map(order => this.getOrderById(order.id))
    );

    return {
      orders: orderDetails,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    };
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled",
    kitchenNotes?: string
  ): Promise<OrderWithDetails> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        kitchenNotes,
        actualDeliveryTime: status === 'delivered' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    return await this.getOrderById(orderId);
  }

  /**
   * Cancel an order (customer can only cancel their own pending/confirmed orders)
   */
  static async cancelOrder(orderId: string, userId: string, reason?: string): Promise<OrderWithDetails> {
    // First check if order exists and belongs to user
    const order = await this.getOrderById(orderId);
    
    if (order.userId !== userId) {
      throw new Error('You can only cancel your own orders');
    }

    // Check if order can be cancelled (only pending or confirmed orders)
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: 'cancelled',
        customerNotes: reason ? `${order.customerNotes || ''}\nCancellation reason: ${reason}`.trim() : order.customerNotes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      throw new Error('Failed to cancel order');
    }

    return await this.getOrderById(orderId);
  }

  /**
   * Get all orders (admin)
   */
  static async getAllOrders(options: {
    page?: number;
    limit?: number;
    status?: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  } = {}): Promise<{
    orders: OrderWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;
  
    // Build conditions
    const conditions = status
      ? [eq(orders.status, status)]
      : [];

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(conditions.length ? and(...conditions) : undefined);

    // Get orders
    const allOrders = await db
      .select()
      .from(orders)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get order details for each order
    const orderDetails = await Promise.all(
      allOrders.map(order => this.getOrderById(order.id))
    );

    return {
      orders: orderDetails,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    };
  }
}
