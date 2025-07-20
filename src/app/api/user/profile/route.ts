import { NextRequest } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { createErrorResponse, createSuccessResponse, withErrorHandler, AuthenticationError } from '@/lib/errors';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// GET /api/user/profile - Get user profile
export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    throw new AuthenticationError();
  }

  const user = await UserService.getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return createSuccessResponse(user);
});

// PUT /api/user/profile - Update user profile
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    throw new AuthenticationError();
  }

  try {
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);
    
    const updatedUser = await UserService.updateProfile(userId, validatedData);
    
    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }
    
    return createSuccessResponse(updatedUser, 'Profile updated successfully');
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
