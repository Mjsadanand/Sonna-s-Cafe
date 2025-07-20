import { NextRequest } from 'next/server';
import { OrderService } from '@/lib/services/order-real.service';
import { createSuccessResponse, createErrorResponse, withErrorHandler, AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']),
  kitchenNotes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id] - Get single order
export const GET = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  
  if (!userId) {
    throw new AuthenticationError();
  }

  const { id } = await params;
  const order = await OrderService.getOrderById(id);
  
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.userId !== userId && userRole !== 'admin') {
    throw new AuthorizationError('You can only view your own orders');
  }

  return createSuccessResponse(order);
});

// PUT /api/orders/[id] - Update order status (Admin only)
export const PUT = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const userRole = request.headers.get('x-user-role');
  
  if (userRole !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    const order = await OrderService.updateOrderStatus(
      id, 
      validatedData.status, 
      validatedData.kitchenNotes
    );

    return createSuccessResponse(order, 'Order status updated successfully');
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

// DELETE /api/orders/[id] - Cancel order
export const DELETE = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    throw new AuthenticationError();
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason;

    const order = await OrderService.cancelOrder(id, userId, reason);
    return createSuccessResponse(order, 'Order cancelled successfully');
  } catch (error) {
    throw error;
  }
});
