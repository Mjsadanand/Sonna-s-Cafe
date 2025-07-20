import { db } from '@/lib/db';
import { 
  users, orders, menuItems, categories, reviews, orderItems, 
  orderTracking, notifications, addresses, restaurantSettings
} from '@/lib/db/schema';
import { eq, and, gte, lte, sql, desc, asc, count, sum, avg, ilike, between, or } from 'drizzle-orm';
import { AppError } from '@/lib/utils';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export class AdminService {
  // ===== DASHBOARD ANALYTICS =====
  
  static async getDashboardStats(dateRange?: { from: Date; to: Date }) {
    try {
      const fromDate = dateRange?.from || subDays(new Date(), 30);
      const toDate = dateRange?.to || new Date();

      // Basic counts
      const [totalUsers] = await db.select({ count: count() }).from(users);
      const [totalOrders] = await db.select({ count: count() }).from(orders);
      const [totalMenuItems] = await db.select({ count: count() }).from(menuItems);
      const [totalCategories] = await db.select({ count: count() }).from(categories);

      // Revenue metrics
      const [revenueData] = await db
        .select({ 
          total: sum(orders.total),
          delivered: count(sql`CASE WHEN ${orders.status} = 'delivered' THEN 1 END`),
          pending: count(sql`CASE WHEN ${orders.status} = 'pending' THEN 1 END`),
          cancelled: count(sql`CASE WHEN ${orders.status} = 'cancelled' THEN 1 END`)
        })
        .from(orders)
        .where(between(orders.createdAt, fromDate, toDate));

      // Today's stats
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      
      const [todayStats] = await db
        .select({
          orders: count(),
          revenue: sum(orders.total)
        })
        .from(orders)
        .where(between(orders.createdAt, todayStart, todayEnd));

      // Growth metrics (compare with previous period)
      const previousFromDate = subDays(fromDate, (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      const previousToDate = fromDate;

      const [previousStats] = await db
        .select({
          orders: count(),
          revenue: sum(orders.total)
        })
        .from(orders)
        .where(between(orders.createdAt, previousFromDate, previousToDate));

      const orderGrowth = previousStats.orders > 0 
        ? ((totalOrders.count - previousStats.orders) / previousStats.orders) * 100 
        : 0;

      const revenueGrowth = Number(previousStats.revenue) > 0 
        ? ((Number(revenueData.total) - Number(previousStats.revenue)) / Number(previousStats.revenue)) * 100 
        : 0;

      return {
        totalUsers: totalUsers.count,
        totalOrders: totalOrders.count,
        totalMenuItems: totalMenuItems.count,
        totalCategories: totalCategories.count,
        totalRevenue: Number(revenueData.total || 0),
        deliveredOrders: revenueData.delivered,
        pendingOrders: revenueData.pending,
        cancelledOrders: revenueData.cancelled,
        todayOrders: todayStats.orders,
        todayRevenue: Number(todayStats.revenue || 0),
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new AppError('Failed to fetch dashboard statistics', 500);
    }
  }

  static async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
    try {
      const fromDate = subDays(new Date(), days);
      
      let groupBy: string;
      let dateFormat: string;
      
      switch (period) {
        case 'daily':
          groupBy = "DATE_TRUNC('day', created_at)";
          dateFormat = 'yyyy-MM-dd';
          break;
        case 'weekly':
          groupBy = "DATE_TRUNC('week', created_at)";
          dateFormat = 'yyyy-MM-dd';
          break;
        case 'monthly':
          groupBy = "DATE_TRUNC('month', created_at)";
          dateFormat = 'yyyy-MM';
          break;
        default:
          groupBy = "DATE_TRUNC('day', created_at)";
          dateFormat = 'yyyy-MM-dd';
      }

      const revenueData = await db
        .select({
          date: sql<string>`${sql.raw(groupBy)}`,
          revenue: sum(orders.total),
          orderCount: count(),
          avgOrderValue: avg(orders.total)
        })
        .from(orders)
        .where(and(
          gte(orders.createdAt, fromDate),
          eq(orders.paymentStatus, 'completed')
        ))
        .groupBy(sql.raw(groupBy))
        .orderBy(sql.raw(groupBy));

      return revenueData.map(item => ({
        ...item,
        date: format(new Date(item.date), dateFormat),
        revenue: Number(item.revenue || 0),
        avgOrderValue: Number(item.avgOrderValue || 0)
      }));
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw new AppError('Failed to fetch revenue analytics', 500);
    }
  }

  static async getTopSellingItems(limit = 10, dateRange?: { from: Date; to: Date }) {
    try {
      const whereConditions = dateRange 
        ? between(orders.createdAt, dateRange.from, dateRange.to)
        : undefined;

      const topItems = await db
        .select({
          id: menuItems.id,
          name: menuItems.name,
          price: menuItems.price,
          image: menuItems.image,
          totalSold: sum(orderItems.quantity),
          totalRevenue: sum(orderItems.totalPrice),
          orderCount: count(sql`DISTINCT ${orderItems.orderId}`)
        })
        .from(orderItems)
        .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(whereConditions)
        .groupBy(menuItems.id, menuItems.name, menuItems.price, menuItems.image)
        .orderBy(desc(sum(orderItems.quantity)))
        .limit(limit);

      return topItems.map(item => ({
        ...item,
        totalSold: Number(item.totalSold || 0),
        totalRevenue: Number(item.totalRevenue || 0),
        price: Number(item.price)
      }));
    } catch (error) {
      console.error('Error fetching top selling items:', error);
      throw new AppError('Failed to fetch top selling items', 500);
    }
  }

  static async getCustomerAnalytics() {
    try {
      // Customer segmentation
      const customerSegments = await db
        .select({
          userId: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          totalOrders: count(orders.id),
          totalSpent: sum(orders.total),
          lastOrderDate: sql<Date>`MAX(${orders.createdAt})`,
          loyaltyPoints: users.loyaltyPoints
        })
        .from(users)
        .leftJoin(orders, eq(users.id, orders.userId))
        .groupBy(users.id, users.email, users.firstName, users.lastName, users.loyaltyPoints)
        .orderBy(desc(sum(orders.total)));

      // New vs returning customers (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const newCustomers = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo));

      const returningCustomers = await db
        .select({ count: count(sql`DISTINCT ${orders.userId}`) })
        .from(orders)
        .innerJoin(users, eq(orders.userId, users.id))
        .where(and(
          gte(orders.createdAt, thirtyDaysAgo),
          lte(users.createdAt, thirtyDaysAgo)
        ));

      return {
        customerSegments: customerSegments.map(customer => ({
          ...customer,
          totalSpent: Number(customer.totalSpent || 0)
        })),
        newCustomers: newCustomers[0]?.count || 0,
        returningCustomers: returningCustomers[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw new AppError('Failed to fetch customer analytics', 500);
    }
  }

  // ===== ORDER MANAGEMENT =====

  static async getAllOrders(options: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'createdAt' | 'total' | 'status';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        paymentStatus,
        search,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const conditions = [];
      
      if (status) conditions.push(eq(orders.status, status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'));
      if (paymentStatus) conditions.push(eq(orders.paymentStatus, paymentStatus as 'pending' | 'completed' | 'failed' | 'refunded'));
      if (dateFrom) conditions.push(gte(orders.createdAt, dateFrom));
      if (dateTo) conditions.push(lte(orders.createdAt, dateTo));
      if (search) {
        conditions.push(
          or(
            ilike(orders.orderNumber, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.firstName, `%${search}%`),
            ilike(users.lastName, `%${search}%`)
          )
        );
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [totalCount] = await db
        .select({ count: count() })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(whereCondition);

      // Get orders with user details
      const orderDirection = sortOrder === 'asc' ? asc : desc;
      const sortColumn = sortBy === 'total' ? orders.total : 
                        sortBy === 'status' ? orders.status : orders.createdAt;

      const ordersResult = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          subtotal: orders.subtotal,
          tax: orders.tax,
          deliveryFee: orders.deliveryFee,
          discount: orders.discount,
          total: orders.total,
          customerNotes: orders.customerNotes,
          estimatedDeliveryTime: orders.estimatedDeliveryTime,
          actualDeliveryTime: orders.actualDeliveryTime,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone
          }
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(whereCondition)
        .orderBy(orderDirection(sortColumn))
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        orders: ordersResult.map(order => ({
          ...order,
          subtotal: Number(order.subtotal),
          tax: Number(order.tax),
          deliveryFee: Number(order.deliveryFee),
          discount: Number(order.discount),
          total: Number(order.total)
        })),
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit)
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new AppError('Failed to fetch orders', 500);
    }
  }

  static async getOrderDetails(orderId: string) {
    try {
      // Get order with user and address details
      const [orderResult] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          subtotal: orders.subtotal,
          tax: orders.tax,
          deliveryFee: orders.deliveryFee,
          discount: orders.discount,
          total: orders.total,
          customerNotes: orders.customerNotes,
          kitchenNotes: orders.kitchenNotes,
          estimatedDeliveryTime: orders.estimatedDeliveryTime,
          actualDeliveryTime: orders.actualDeliveryTime,
          scheduledFor: orders.scheduledFor,
          addOns: orders.addOns,
          metadata: orders.metadata,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            loyaltyPoints: users.loyaltyPoints
          },
          deliveryAddress: {
            id: addresses.id,
            type: addresses.type,
            label: addresses.label,
            addressLine1: addresses.addressLine1,
            addressLine2: addresses.addressLine2,
            city: addresses.city,
            state: addresses.state,
            postalCode: addresses.postalCode,
            country: addresses.country,
            landmark: addresses.landmark,
            instructions: addresses.instructions
          }
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(addresses, eq(orders.deliveryAddressId, addresses.id))
        .where(eq(orders.id, orderId));

      if (!orderResult) {
        throw new AppError('Order not found', 404);
      }

      // Get order items
      const orderItemsResult = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          specialInstructions: orderItems.specialInstructions,
          menuItem: {
            id: menuItems.id,
            name: menuItems.name,
            description: menuItems.description,
            image: menuItems.image,
            isVegetarian: menuItems.isVegetarian,
            isVegan: menuItems.isVegan,
            spiceLevel: menuItems.spiceLevel
          }
        })
        .from(orderItems)
        .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(eq(orderItems.orderId, orderId));

      // Get order tracking
      const trackingResult = await db
        .select()
        .from(orderTracking)
        .where(eq(orderTracking.orderId, orderId))
        .orderBy(desc(orderTracking.createdAt));

      return {
        ...orderResult,
        subtotal: Number(orderResult.subtotal),
        tax: Number(orderResult.tax),
        deliveryFee: Number(orderResult.deliveryFee),
        discount: Number(orderResult.discount),
        total: Number(orderResult.total),
        items: orderItemsResult.map(item => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        })),
        tracking: trackingResult
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new AppError('Failed to fetch order details', 500);
    }
  }

  static async updateOrderStatus(orderId: string, status: string, kitchenNotes?: string) {
    try {
      // Update order status
      const [updatedOrder] = await db
        .update(orders)
        .set({
          status: status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled',
          kitchenNotes: kitchenNotes || undefined,
          actualDeliveryTime: status === 'delivered' ? new Date() : undefined,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId))
        .returning();

      if (!updatedOrder) {
        throw new AppError('Order not found', 404);
      }

      // Add tracking entry
      await db.insert(orderTracking).values({
        orderId,
        status: status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled',
        message: `Order status updated to ${status}`,
        metadata: kitchenNotes ? { kitchenNotes } : undefined,
        createdAt: new Date()
      });

      // Send notification to user
      await db.insert(notifications).values({
        userId: updatedOrder.userId,
        type: 'order_update',
        title: `Order ${status}`,
        message: `Your order #${updatedOrder.orderNumber} has been ${status}`,
        data: { orderId, status },
        createdAt: new Date()
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new AppError('Failed to update order status', 500);
    }
  }

  // ===== USER MANAGEMENT =====

  static async getAllUsers(options: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    isActive?: boolean;
    sortBy?: 'createdAt' | 'loyaltyPoints' | 'email';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        search,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const conditions = [];
      
      if (role) conditions.push(eq(users.role, role as 'customer' | 'admin' | 'kitchen_staff'));
      if (isActive !== undefined) conditions.push(eq(users.isActive, isActive));
      if (search) {
        conditions.push(
          or(
            ilike(users.email, `%${search}%`),
            ilike(users.firstName, `%${search}%`),
            ilike(users.lastName, `%${search}%`),
            ilike(users.phone, `%${search}%`)
          )
        );
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [totalCount] = await db
        .select({ count: count() })
        .from(users)
        .where(whereCondition);

      // Get users with order statistics
      const orderDirection = sortOrder === 'asc' ? asc : desc;
      const sortColumn = sortBy === 'loyaltyPoints' ? users.loyaltyPoints : 
                        sortBy === 'email' ? users.email : users.createdAt;

      const usersResult = await db
        .select({
          id: users.id,
          clerkId: users.clerkId,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          loyaltyPoints: users.loyaltyPoints,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          totalOrders: sql<number>`COALESCE((
            SELECT COUNT(*) FROM ${orders} WHERE ${orders.userId} = ${users.id}
          ), 0)`,
          totalSpent: sql<number>`COALESCE((
            SELECT SUM(CAST(${orders.total} AS DECIMAL)) FROM ${orders} 
            WHERE ${orders.userId} = ${users.id} AND ${orders.paymentStatus} = 'completed'
          ), 0)`,
          lastOrderDate: sql<Date>`(
            SELECT MAX(${orders.createdAt}) FROM ${orders} WHERE ${orders.userId} = ${users.id}
          )`
        })
        .from(users)
        .where(whereCondition)
        .orderBy(orderDirection(sortColumn))
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        users: usersResult.map(user => ({
          ...user,
          totalSpent: Number(user.totalSpent || 0)
        })),
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new AppError('Failed to fetch users', 500);
    }
  }

  static async getUserDetails(userId: string) {
    try {
      // Get user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user's addresses
      const userAddresses = await db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, userId))
        .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));

      // Get user's recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          total: orders.total,
          createdAt: orders.createdAt
        })
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(10);

      // Get user's order statistics
      const [orderStats] = await db
        .select({
          totalOrders: count(),
          totalSpent: sum(orders.total),
          avgOrderValue: avg(orders.total)
        })
        .from(orders)
        .where(and(
          eq(orders.userId, userId),
          eq(orders.paymentStatus, 'completed')
        ));

      return {
        ...user,
        addresses: userAddresses,
        recentOrders: recentOrders.map(order => ({
          ...order,
          total: Number(order.total)
        })),
        statistics: {
          totalOrders: orderStats?.totalOrders || 0,
          totalSpent: Number(orderStats?.totalSpent || 0),
          avgOrderValue: Number(orderStats?.avgOrderValue || 0)
        }
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw new AppError('Failed to fetch user details', 500);
    }
  }

  static async updateUserStatus(userId: string, isActive: boolean) {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          isActive,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new AppError('User not found', 404);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new AppError('Failed to update user status', 500);
    }
  }

  static async updateUserRole(userId: string, role: 'customer' | 'admin' | 'kitchen_staff') {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          role,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new AppError('User not found', 404);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new AppError('Failed to update user role', 500);
    }
  }

  // ===== REVIEWS MANAGEMENT =====

  static async getAllReviews(options: {
    page?: number;
    limit?: number;
    rating?: number;
    isApproved?: boolean;
    menuItemId?: string;
    search?: string;
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        rating,
        isApproved,
        menuItemId,
        search
      } = options;

      const conditions = [];
      
      if (rating) conditions.push(eq(reviews.rating, rating));
      if (isApproved !== undefined) conditions.push(eq(reviews.isApproved, isApproved));
      if (menuItemId) conditions.push(eq(reviews.menuItemId, menuItemId));
      if (search) {
        conditions.push(
          or(
            ilike(reviews.comment, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(menuItems.name, `%${search}%`)
          )
        );
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [totalCount] = await db
        .select({ count: count() })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .leftJoin(menuItems, eq(reviews.menuItemId, menuItems.id))
        .where(whereCondition);

      // Get reviews with user and menu item details
      const reviewsResult = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          images: reviews.images,
          isVerified: reviews.isVerified,
          isApproved: reviews.isApproved,
          createdAt: reviews.createdAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName
          },
          menuItem: {
            id: menuItems.id,
            name: menuItems.name,
            image: menuItems.image
          },
          order: {
            id: orders.id,
            orderNumber: orders.orderNumber
          }
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .leftJoin(menuItems, eq(reviews.menuItemId, menuItems.id))
        .leftJoin(orders, eq(reviews.orderId, orders.id))
        .where(whereCondition)
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        reviews: reviewsResult,
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit)
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new AppError('Failed to fetch reviews', 500);
    }
  }

  static async updateReviewStatus(reviewId: string, isApproved: boolean) {
    try {
      const [updatedReview] = await db
        .update(reviews)
        .set({
          isApproved,
          updatedAt: new Date()
        })
        .where(eq(reviews.id, reviewId))
        .returning();

      if (!updatedReview) {
        throw new AppError('Review not found', 404);
      }

      return updatedReview;
    } catch (error) {
      console.error('Error updating review status:', error);
      throw new AppError('Failed to update review status', 500);
    }
  }

  static async deleteReview(reviewId: string) {
    try {
      const [deletedReview] = await db
        .delete(reviews)
        .where(eq(reviews.id, reviewId))
        .returning();

      if (!deletedReview) {
        throw new AppError('Review not found', 404);
      }

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new AppError('Failed to delete review', 500);
    }
  }

  // ===== MENU ITEMS MANAGEMENT =====

  static async getMenuItemsWithStats(categoryId?: string) {
    try {
      const conditions = [];
      
      if (categoryId) {
        conditions.push(eq(menuItems.categoryId, categoryId));
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get menu items with order statistics
      const itemsWithStats = await db
        .select({
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          price: menuItems.price,
          image: menuItems.image,
          categoryId: menuItems.categoryId,
          isAvailable: menuItems.isAvailable,
          isVegetarian: menuItems.isVegetarian,
          isVegan: menuItems.isVegan,
          isGlutenFree: menuItems.isGlutenFree,
          spiceLevel: menuItems.spiceLevel,
          preparationTime: menuItems.preparationTime,
          isPopular: menuItems.isPopular,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
          ordersCount: sql<number>`COALESCE(COUNT(DISTINCT ${orderItems.orderId}), 0)`,
          totalQuantitySold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          revenue: sql<number>`COALESCE(SUM(${orderItems.totalPrice}), 0)`
        })
        .from(menuItems)
        .leftJoin(orderItems, eq(menuItems.id, orderItems.menuItemId))
        .where(whereCondition)
        .groupBy(
          menuItems.id,
          menuItems.name,
          menuItems.description,
          menuItems.price,
          menuItems.image,
          menuItems.categoryId,
          menuItems.isAvailable,
          menuItems.isVegetarian,
          menuItems.isVegan,
          menuItems.isGlutenFree,
          menuItems.spiceLevel,
          menuItems.preparationTime,
          menuItems.isPopular,
          menuItems.createdAt,
          menuItems.updatedAt
        )
        .orderBy(menuItems.sortOrder, menuItems.name);

      return itemsWithStats.map(item => ({
        ...item,
        price: Number(item.price),
        ordersCount: Number(item.ordersCount || 0),
        totalQuantitySold: Number(item.totalQuantitySold || 0),
        revenue: Number(item.revenue || 0)
      }));
    } catch (error) {
      console.error('Error fetching menu items with stats:', error);
      throw new AppError('Failed to fetch menu items', 500);
    }
  }

  static async createMenuItem(data: {
    name: string;
    description?: string;
    price: string;
    categoryId: string;
    image?: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    spiceLevel?: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT';
    preparationTime?: number;
    ingredients?: string[];
    tags?: string[];
  }) {
    try {
      const [newMenuItem] = await db
        .insert(menuItems)
        .values({
          ...data,
          isAvailable: true,
          isPopular: false,
          sortOrder: 0
        })
        .returning();

      return {
        ...newMenuItem,
        price: Number(newMenuItem.price)
      };
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw new AppError('Failed to create menu item', 500);
    }
  }

  static async updateMenuItem(id: string, data: Partial<{
    name: string;
    description: string;
    price: string;
    categoryId: string;
    image: string;
    isAvailable: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    spiceLevel: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTRA_HOT';
    preparationTime: number;
    ingredients: string[];
    tags: string[];
    isPopular: boolean;
    sortOrder: number;
  }>) {
    try {
      const [updatedMenuItem] = await db
        .update(menuItems)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(menuItems.id, id))
        .returning();

      if (!updatedMenuItem) {
        throw new AppError('Menu item not found', 404);
      }

      return {
        ...updatedMenuItem,
        price: Number(updatedMenuItem.price)
      };
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw new AppError('Failed to update menu item', 500);
    }
  }

  static async deleteMenuItem(id: string) {
    try {
      // Check if item has any orders
      const [orderCount] = await db
        .select({ count: count() })
        .from(orderItems)
        .where(eq(orderItems.menuItemId, id));

      if (orderCount.count > 0) {
        throw new AppError('Cannot delete menu item with existing orders', 400);
      }

      const [deletedMenuItem] = await db
        .delete(menuItems)
        .where(eq(menuItems.id, id))
        .returning();

      if (!deletedMenuItem) {
        throw new AppError('Menu item not found', 404);
      }

      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw new AppError('Failed to delete menu item', 500);
    }
  }

  // ===== USER MANAGEMENT =====

  // ===== NOTIFICATIONS =====

  static async sendBulkNotification(data: {
    title: string;
    message: string;
    type: 'promotion' | 'system' | 'order_update';
    targetUsers?: string[]; // If not provided, sends to all users
    metadata?: Record<string, unknown>;
  }) {
    try {
      const { title, message, type, targetUsers, metadata } = data;

      let userIds: string[] = [];

      if (targetUsers && targetUsers.length > 0) {
        userIds = targetUsers;
      } else {
        // Get all active user IDs
        const allUsers = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.isActive, true));
        userIds = allUsers.map(user => user.id);
      }

      // Create notifications for all target users
      const notificationValues = userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        data: metadata,
        createdAt: new Date()
      }));

      await db.insert(notifications).values(notificationValues);

      return {
        success: true,
        notificationsSent: notificationValues.length
      };
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw new AppError('Failed to send bulk notification', 500);
    }
  }

  // ===== RESTAURANT SETTINGS =====

  static async getRestaurantSettings() {
    try {
      // Try to get existing settings
      const settings = await db.select().from(restaurantSettings).limit(1);
      
      if (settings.length > 0) {
        return settings[0];
      }
      
      // If no settings exist, create default settings
      const defaultSettings = {
        restaurantName: "Sonna's Cafe",
        restaurantDescription: "Authentic Indian cuisine with a modern twist",
        restaurantPhone: "+1 (555) 123-4567",
        restaurantEmail: "info@sonnascafe.com",
        restaurantAddress: "123 Main Street, City, State 12345",
        isOrderingEnabled: true,
        minimumOrderAmount: "15.00",
        deliveryFee: "5.99",
        preparationTime: 30,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        maintenanceMode: false,
        autoBackup: true,
        timezone: 'America/New_York',
        currency: 'USD',
        acceptCashOnDelivery: true,
        autoAcceptOrders: false,
        loyaltyPointsRate: 1,
      };
      
      const [newSettings] = await db.insert(restaurantSettings)
        .values(defaultSettings)
        .returning();
        
      return newSettings;
    } catch (error) {
      console.error('Error fetching restaurant settings:', error);
      throw new AppError('Failed to fetch restaurant settings', 500);
    }
  }

  static async updateRestaurantSettings(data: {
    restaurantName?: string;
    restaurantDescription?: string;
    restaurantPhone?: string;
    restaurantEmail?: string;
    restaurantAddress?: string;
    isOrderingEnabled?: boolean;
    minimumOrderAmount?: number | string;
    deliveryFee?: number | string;
    preparationTime?: number;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    maintenanceMode?: boolean;
    autoBackup?: boolean;
    timezone?: string;
    currency?: string;
    acceptCashOnDelivery?: boolean;
    autoAcceptOrders?: boolean;
    loyaltyPointsRate?: number;
  }) {
    try {
      // Get current settings first
      const currentSettings = await this.getRestaurantSettings();
      
      // Convert number values to strings for decimal fields
      const updateData = {
        ...data,
        minimumOrderAmount: data.minimumOrderAmount ? String(data.minimumOrderAmount) : undefined,
        deliveryFee: data.deliveryFee ? String(data.deliveryFee) : undefined,
      };
      
      // Remove undefined values and filter out readonly fields
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([key, value]) => {
          // Exclude readonly fields like id, createdAt, updatedAt
          const readonlyFields = ['id', 'createdAt', 'updatedAt'];
          return value !== undefined && !readonlyFields.includes(key);
        })
      );

      // Update the settings in the database
      const [updatedSettings] = await db
        .update(restaurantSettings)
        .set(cleanedData)
        .where(eq(restaurantSettings.id, currentSettings.id))
        .returning();

      return updatedSettings;
    } catch (error) {
      console.error('Error updating restaurant settings:', error);
      throw new AppError('Failed to update restaurant settings', 500);
    }
  }

  // ===== DATA EXPORT =====

  static async exportOrdersData(options: {
    format?: 'csv' | 'json';
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
  } = {}) {
    try {
      const { dateFrom, dateTo, status } = options;

      const conditions = [];
      if (dateFrom) conditions.push(gte(orders.createdAt, dateFrom));
      if (dateTo) conditions.push(lte(orders.createdAt, dateTo));
      if (status) conditions.push(eq(orders.status, status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'));

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      const exportData = await db
        .select({
          orderNumber: orders.orderNumber,
          customerEmail: users.email,
          customerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          subtotal: orders.subtotal,
          tax: orders.tax,
          deliveryFee: orders.deliveryFee,
          discount: orders.discount,
          total: orders.total,
          createdAt: orders.createdAt,
          deliveryTime: orders.actualDeliveryTime
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(whereCondition)
        .orderBy(desc(orders.createdAt));

      return exportData.map(order => ({
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        deliveryFee: Number(order.deliveryFee),
        discount: Number(order.discount),
        total: Number(order.total)
      }));
    } catch (error) {
      console.error('Error exporting orders data:', error);
      throw new AppError('Failed to export orders data', 500);
    }
  }

  static async exportMenuItemsData() {
    try {
      const exportData = await db
        .select({
          name: menuItems.name,
          description: menuItems.description,
          price: menuItems.price,
          category: categories.name,
          isAvailable: menuItems.isAvailable,
          isVegetarian: menuItems.isVegetarian,
          isVegan: menuItems.isVegan,
          isGlutenFree: menuItems.isGlutenFree,
          spiceLevel: menuItems.spiceLevel,
          preparationTime: menuItems.preparationTime,
          isPopular: menuItems.isPopular,
          createdAt: menuItems.createdAt
        })
        .from(menuItems)
        .leftJoin(categories, eq(menuItems.categoryId, categories.id))
        .orderBy(menuItems.name);

      return exportData.map(item => ({
        ...item,
        price: Number(item.price)
      }));
    } catch (error) {
      console.error('Error exporting menu items data:', error);
      throw new AppError('Failed to export menu items data', 500);
    }
  }

  static async exportUsersData() {
    try {
      const exportData = await db
        .select({
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          loyaltyPoints: users.loyaltyPoints,
          totalOrders: sql<number>`COALESCE((
            SELECT COUNT(*) FROM ${orders} WHERE ${orders.userId} = ${users.id}
          ), 0)`,
          totalSpent: sql<number>`COALESCE((
            SELECT SUM(CAST(${orders.total} AS DECIMAL)) FROM ${orders} 
            WHERE ${orders.userId} = ${users.id} AND ${orders.paymentStatus} = 'completed'
          ), 0)`,
          createdAt: users.createdAt
        })
        .from(users)
        .orderBy(users.createdAt);

      return exportData.map(user => ({
        ...user,
        totalSpent: Number(user.totalSpent || 0)
      }));
    } catch (error) {
      console.error('Error exporting users data:', error);
      throw new AppError('Failed to export users data', 500);
    }
  }
}
