import { NextRequest } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { createSuccessResponse, createErrorResponse, withErrorHandler } from '@/lib/errors';
import { z } from 'zod';

const addToCartSchema = z.object({
  menuItemId: z.string().uuid('Valid menu item ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  specialInstructions: z.string().optional(),
  addOns: z.array(z.string()).optional(),
});

// GET /api/cart - Get user's cart
export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = request.headers.get('x-user-id') || undefined;
  const sessionId = request.headers.get('x-session-id') || undefined;

  const cart = await CartService.getCartWithDetails(userId, sessionId);
  
  return createSuccessResponse(cart || {
    id: null,
    userId: null,
    sessionId: null,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

// POST /api/cart - Add item to cart
export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = request.headers.get('x-user-id') || undefined;
  const sessionId = request.headers.get('x-session-id') || undefined;

  if (!userId && !sessionId) {
    return createErrorResponse({
      message: 'User ID or session ID is required',
    });
  }

  try {
    const body = await request.json();
    const validatedData = addToCartSchema.parse(body);

    const cartItem = await CartService.addToCart({
      userId,
      sessionId,
      ...validatedData,
    });

    return createSuccessResponse(cartItem, 'Item added to cart', 201);
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

// DELETE /api/cart - Clear entire cart
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const userId = request.headers.get('x-user-id') || undefined;
  const sessionId = request.headers.get('x-session-id') || undefined;

  if (!userId && !sessionId) {
    return createErrorResponse({
      message: 'User ID or session ID is required',
    });
  }

  await CartService.clearCart(userId, sessionId);
  return createSuccessResponse(null, 'Cart cleared successfully');
});
