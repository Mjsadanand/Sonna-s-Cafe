import { NextRequest } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { createSuccessResponse, createErrorResponse, withErrorHandler } from '@/lib/errors';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  specialInstructions: z.string().optional(),
  addOns: z.array(z.string()).optional(),
});

// PUT /api/cart/[id] - Update cart item
export const PUT = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const userId = request.headers.get('x-user-id') || undefined;
  const sessionId = request.headers.get('x-session-id') || undefined;

  if (!userId && !sessionId) {
    return createErrorResponse({
      message: 'User ID or session ID is required',
    });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCartItemSchema.parse(body);

    const cartItem = await CartService.updateCartItem(id, validatedData, userId, sessionId);
    return createSuccessResponse(cartItem, 'Cart item updated successfully');
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

// DELETE /api/cart/[id] - Remove cart item
export const DELETE = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const userId = request.headers.get('x-user-id') || undefined;
  const sessionId = request.headers.get('x-session-id') || undefined;

  if (!userId && !sessionId) {
    return createErrorResponse({
      message: 'User ID or session ID is required',
    });
  }

  const { id } = await params;
  await CartService.removeFromCart(id, userId, sessionId);
  return createSuccessResponse(null, 'Item removed from cart');
});
