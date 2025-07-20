import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, User } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function verifyAdminAccess(): Promise<{
  isAuthorized: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isAuthorized: false, error: 'No authentication token' };
    }

    // Get user from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!dbUser) {
      return { isAuthorized: false, error: 'User not found in database' };
    }

    // Check if user has admin role
    if (dbUser.role !== 'admin') {
      return { isAuthorized: false, error: 'Insufficient permissions' };
    }

    // Check if user is active
    if (!dbUser.isActive) {
      return { isAuthorized: false, error: 'User account is inactive' };
    }

    return {
      isAuthorized: true,
      user: dbUser
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { isAuthorized: false, error: 'Authentication verification failed' };
  }
}

export function withAdminAuth(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const verification = await verifyAdminAccess();
    
    if (!verification.isAuthorized) {
      return NextResponse.json(
        { error: verification.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add user to request context
    (request as NextRequest & { adminUser: User }).adminUser = verification.user!;
    
    return handler(request, ...args);
  };
}

// Helper function to check specific admin permissions
export async function hasAdminPermission(
  userId: string,
  permission: 'read' | 'write' | 'delete' | 'admin'
): Promise<boolean> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user || !user.isActive) {
      return false;
    }

    // For now, we'll use simple role-based permissions
    switch (permission) {
      case 'read':
        return ['admin', 'kitchen_staff'].includes(user.role);
      case 'write':
        return user.role === 'admin';
      case 'delete':
        return user.role === 'admin';
      case 'admin':
        return user.role === 'admin';
      default:
        return false;
    }
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}
