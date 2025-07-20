import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserService } from '@/lib/services/user.service';
import { LoyaltyService } from '@/lib/services/loyalty.service';
import { db } from '@/lib/db';
import { orders, orderItems, menuItems, categories } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

// GET /api/user/profile/stats - Get user profile with order statistics
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user
    const dbUser = await UserService.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get order statistics
    const orderStats = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalSpent: sql<number>`coalesce(sum(${orders.total}::decimal), 0)`,
        completedOrders: sql<number>`count(*) filter (where ${orders.status} = 'delivered')`,
        pendingOrders: sql<number>`count(*) filter (where ${orders.status} in ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'))`,
      })
      .from(orders)
      .where(eq(orders.userId, dbUser.id));

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      completedOrders: 0,
      pendingOrders: 0,
    };

    // Get favorite items (most ordered items)
    const favoriteItems = await db
      .select({
        menuItemId: orderItems.menuItemId,
        name: menuItems.name,
        price: menuItems.price,
        image: menuItems.image,
        categoryName: categories.name,
        orderCount: sql<number>`count(*)`,
        totalQuantity: sql<number>`sum(${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .innerJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(orders.userId, dbUser.id))
      .groupBy(orderItems.menuItemId, menuItems.name, menuItems.price, menuItems.image, categories.name)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        itemCount: sql<number>`count(${orderItems.id})`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orders.userId, dbUser.id))
      .groupBy(orders.id, orders.orderNumber, orders.status, orders.total, orders.createdAt)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Calculate current loyalty points and available discount
    const loyaltyPoints = await LoyaltyService.getUserPoints(dbUser.id);
    const availableDiscount = LoyaltyService.calculateDiscount(loyaltyPoints);

    return NextResponse.json({
      user: {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        phone: dbUser.phone,
        loyaltyPoints: dbUser.loyaltyPoints,
        createdAt: dbUser.createdAt,
      },
      statistics: {
        totalOrders: Number(stats.totalOrders),
        totalSpent: Number(stats.totalSpent),
        completedOrders: Number(stats.completedOrders),
        pendingOrders: Number(stats.pendingOrders),
        loyaltyPoints,
        availableDiscount,
      },
      favoriteItems: favoriteItems.map(item => ({
        id: item.menuItemId,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        category: item.categoryName,
        orderCount: Number(item.orderCount),
        totalQuantity: Number(item.totalQuantity),
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        itemCount: Number(order.itemCount),
      })),
    });
  } catch (error) {
    console.error('Error fetching user profile stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
