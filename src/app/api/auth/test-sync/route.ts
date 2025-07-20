import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserService } from '@/lib/services/user.service';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        message: 'Please sign in first' 
      }, { status: 401 });
    }

    // Get Clerk user data
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ 
        error: 'Clerk user not found' 
      }, { status: 404 });
    }

    // Check if user exists in database
    let dbUser = await UserService.getUserByClerkId(userId);
    
    if (!dbUser) {
      // User doesn't exist in database, create them
      console.log('Creating new user in database...');
      
      dbUser = await UserService.syncUserFromClerk({
        id: clerkUser.id,
        emailAddresses: clerkUser.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        phoneNumbers: clerkUser.phoneNumbers?.map(p => ({ phoneNumber: p.phoneNumber })) || [],
        publicMetadata: clerkUser.publicMetadata,
      });
      
      console.log('User created in database:', dbUser.id);
    }

    return NextResponse.json({
      message: 'User successfully synced to database',
      clerk: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        createdAt: clerkUser.createdAt
      },
      database: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        createdAt: dbUser.createdAt
      },
      sync_status: 'success'
    });
    
  } catch (error) {
    console.error('Error in auth test:', error);
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
