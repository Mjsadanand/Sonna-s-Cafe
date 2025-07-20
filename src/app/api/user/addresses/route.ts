import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AddressService } from '@/lib/services/address.service';
import { UserService } from '@/lib/services/user.service';
import { createErrorResponse, createSuccessResponse, withErrorHandler, AuthenticationError } from '@/lib/errors';
import { z } from 'zod';

const createAddressSchema = z.object({
  userId: z.string().uuid('Valid user ID is required'),
  type: z.string().default('home'),
  label: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('India'),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

// GET /api/user/addresses - Get user addresses
export const GET = withErrorHandler(async () => {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new AuthenticationError();
  }

  // Get database user ID
  const dbUser = await UserService.getUserByClerkId(clerkUserId);
  if (!dbUser) {
    throw new Error('User not found');
  }

  const addresses = await AddressService.getUserAddresses(dbUser.id);
  return createSuccessResponse(addresses);
});

// POST /api/user/addresses - Create new address
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
    const validatedData = createAddressSchema.parse({
      ...body,
      userId: dbUser.id, // Use database user ID
    });
    
    const address = await AddressService.createAddress(validatedData);
    return createSuccessResponse(address, 'Address created successfully', 201);
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
