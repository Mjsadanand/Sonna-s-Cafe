import { auth, currentUser } from '@clerk/nextjs/server';
import { UserService } from '@/lib/services/user.service';

/**
 * Sync the current Clerk user to the database
 * Call this in server components or API routes when you need to ensure user is synced
 */
export async function syncCurrentUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    // Check if user already exists in database
    const existingUser = await UserService.getUserByClerkId(userId);
    
    if (existingUser) {
      return existingUser;
    }

    // If user doesn't exist, get full user data from Clerk and sync
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    // Sync user to database
    const syncedUser = await UserService.syncUserFromClerk({
      id: clerkUser.id,
      emailAddresses: clerkUser.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      phoneNumbers: clerkUser.phoneNumbers?.map(p => ({ phoneNumber: p.phoneNumber })) || [],
      publicMetadata: clerkUser.publicMetadata,
    });


    return syncedUser;
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}

/**
 * Get the current user from the database (syncing if necessary)
 */
export async function getCurrentUser() {
  return await syncCurrentUser();
}
