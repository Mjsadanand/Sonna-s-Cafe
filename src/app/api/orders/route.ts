import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrderService } from '@/lib/services/order-real.service';
import { UserService } from '@/lib/services/user.service';
import { createSuccessResponse, createErrorResponse, withErrorHandler, AuthenticationError } from '@/lib/errors';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid('Valid menu item ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    specialInstructions: z.string().optional(),
  })).min(1, 'At least one item is required'),
  deliveryAddressId: z.string().uuid('Valid delivery address ID is required'),
  customerNotes: z.string().optional(),
  couponCode: z.string().optional(),
});

// GET /api/orders - Get user orders or all orders (admin)
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const allowedStatuses = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ] as const;
  type OrderStatus = typeof allowedStatuses[number];
  const statusParam = searchParams.get('status');
  const status: OrderStatus | undefined = allowedStatuses.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const isAdmin = searchParams.get('admin') === 'true';
  const userRole = request.headers.get('x-user-role');

  if (isAdmin) {
    // Admin - get all orders
    if (userRole !== 'admin') {
      throw new AuthenticationError('Admin access required');
    }
    
    const result = await OrderService.getAllOrders({
      page,
      limit,
      status,
    });
    return createSuccessResponse(result);
  } else {
    // Customer - get user orders using Clerk authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      throw new AuthenticationError();
    }

    // Get database user ID
    const dbUser = await UserService.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      throw new Error('User not found');
    }
    
    const result = await OrderService.getUserOrders(dbUser.id, {
      page,
      limit,
      status,
    });
    return createSuccessResponse(result);
  }
});

// POST /api/orders - Create new order
export const POST = withErrorHandler(async (request: NextRequest) => {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new AuthenticationError();
  }

  // Get database user ID
  const dbUser = await UserService.getUserByClerkId(clerkUserId);
  if (!dbUser) {
    throw new Error('User not found');
  }

  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    const order = await OrderService.createOrder({
      ...validatedData,
      userId: dbUser.id, // Use database user ID
    });
    return createSuccessResponse(order, 'Order created successfully', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        message: 'Validation error',
        details: error.issues,
      });
    }
    throw error;
  }
});
