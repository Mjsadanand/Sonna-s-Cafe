import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // Find DB user by Clerk ID
    const dbUser = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).then(res => res[0]);
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    // Get all bookings for the DB user
    const userBookings = await db.select().from(bookings).where(eq(bookings.userId, dbUser.id));
    return NextResponse.json({ success: true, bookings: userBookings });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : 'Failed to fetch bookings') }, { status: 500 });
  }
}
