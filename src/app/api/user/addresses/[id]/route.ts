import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AddressService } from '@/lib/services/address.service';
import { UserService } from '@/lib/services/user.service';
import { createErrorResponse, createSuccessResponse, withErrorHandler, AuthenticationError } from '@/lib/errors';
import { z } from 'zod';

const updateAddressSchema = z.object({
  type: z.string().optional(),
  label: z.string().optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().optional(),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/user/addresses/[id] - Get specific address
export const GET = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new AuthenticationError();
  }

  // Get database user ID
  const dbUser = await UserService.getUserByClerkId(clerkUserId);
  if (!dbUser) {
    throw new Error('User not found');
  }

  const { id } = await params;
  const address = await AddressService.getAddressById(id, dbUser.id);
  
  if (!address) {
    throw new Error('Address not found');
  }

  return createSuccessResponse(address);
});

// PUT /api/user/addresses/[id] - Update address
export const PUT = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
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
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateAddressSchema.parse(body);
    
    const updatedAddress = await AddressService.updateAddress(id, dbUser.id, validatedData);
    
    if (!updatedAddress) {
      throw new Error('Failed to update address');
    }
    
    return createSuccessResponse(updatedAddress, 'Address updated successfully');
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

// DELETE /api/user/addresses/[id] - Delete address
export const DELETE = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    throw new AuthenticationError();
  }

  // Get database user ID
  const dbUser = await UserService.getUserByClerkId(clerkUserId);
  if (!dbUser) {
    throw new Error('User not found');
  }

  const { id } = await params;
  const success = await AddressService.deleteAddress(id, dbUser.id);
  
  if (!success) {
    throw new Error('Failed to delete address');
  }
  
  return createSuccessResponse(null, 'Address deleted successfully');
});
