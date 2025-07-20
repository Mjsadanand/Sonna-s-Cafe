import { NextRequest } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { createSuccessResponse, withErrorHandler, AuthenticationError, AuthorizationError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id]/track - Get order tracking information
export const GET = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  
  if (!userId) {
    throw new AuthenticationError();
  }

  const { id } = await params;
  const order = await OrderService.getOrderById(id, userId);
  
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.userId !== userId && userRole !== 'admin') {
    throw new AuthorizationError('You can only track your own orders');
  }

  const tracking = await OrderService.getOrderTracking(id);
  
  return createSuccessResponse({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      createdAt: order.createdAt,
    },
    tracking,
  });
});
