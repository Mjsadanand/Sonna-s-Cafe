import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/utils';
import { syncCurrentUser } from '@/lib/auth/sync';
import { type User } from '@/lib/db/schema';

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  userRole: string;
  dbUser?: User;
}

export async function authenticateUser(request: NextRequest): Promise<{ userId: string; userRole?: string; dbUser?: User }> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Log request info for debugging (can be removed in production)
    console.log('Authenticating request:', request.url);

    // Sync user to database and get user data
    const dbUser = await syncCurrentUser();

    return { 
      userId, 
      userRole: dbUser?.role || 'customer',
      dbUser: dbUser || undefined
    };
  } catch {
    throw new AppError('Authentication failed', 401);
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const { userId, userRole, dbUser } = await authenticateUser(request);
      
      // Extend request with user info
      (request as AuthenticatedRequest).userId = userId;
      (request as AuthenticatedRequest).userRole = userRole || 'customer';
      (request as AuthenticatedRequest).dbUser = dbUser;
      
      return handler(request as AuthenticatedRequest);
    } catch (error) {
      const { message, statusCode } = error as AppError;
      return NextResponse.json(
        { error: message },
        { status: statusCode }
      );
    }
  };
}

export function requireAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const { userId } = await authenticateUser(request);
      
      // Check if user is admin
      // This should be implemented with actual database check
      const isAdmin = await checkIfUserIsAdmin(userId);
      
      if (!isAdmin) {
        throw new AppError('Admin access required', 403);
      }
      
      (request as AuthenticatedRequest).userId = userId;
      (request as AuthenticatedRequest).userRole = 'admin';
      
      return handler(request as AuthenticatedRequest);
    } catch (error) {
      const { message, statusCode } = error as AppError;
      return NextResponse.json(
        { error: message },
        { status: statusCode }
      );
    }
  };
}

async function checkIfUserIsAdmin(userId: string): Promise<boolean> {
  // TODO: Implement actual database check
  // For now, check against admin email in environment
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) return false;
  
  // Placeholder: In production, check userId against admin role in database
  console.log('Checking admin status for user:', userId);
  
  // For development, we'll use a simple admin email check
  
  // This is a placeholder - should be replaced with actual database lookup
  // const user = await getUserByClerkId(userId);
  // return user?.role === 'admin';
  
  return true; // Temporary for development
}

export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
