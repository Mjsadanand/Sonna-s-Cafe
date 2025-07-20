import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AddressService } from '@/lib/services/address.service';
import { UserService } from '@/lib/services/user.service';
import { createSuccessResponse, withErrorHandler, AuthenticationError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/user/addresses/[id]/default - Set address as default
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

  const { id } = await params;
  const address = await AddressService.setDefaultAddress(id, dbUser.id);
  
  if (!address) {
    throw new Error('Failed to set default address');
  }
  
  return createSuccessResponse(address, 'Default address updated successfully');
});
