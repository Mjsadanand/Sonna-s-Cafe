import { NextRequest } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { createErrorResponse, createSuccessResponse, withErrorHandler } from '@/lib/errors';
import { z } from 'zod';

const syncUserSchema = z.object({
  clerkId: z.string().min(1, 'Clerk ID is required'),
  email: z.string().email('Valid email is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin', 'kitchen_staff']).optional(),
});

// POST /api/auth/sync - Sync user from Clerk to database
export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = syncUserSchema.parse(body);
    
    const user = await UserService.syncUser(validatedData);
    
    return createSuccessResponse(user, 'User synced successfully');
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
