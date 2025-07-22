import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, users, addresses } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Expect: { userId, addressId, scheduledFor, occasion, notes }
    const { userId, addressId, scheduledFor, occasion, notes } = body;
    if (!userId || !addressId || !scheduledFor) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Map Clerk userId to DB UUID
    const dbUserArr = await db.select().from(users).where(eq(users.clerkId, userId));
    const dbUser = dbUserArr[0];
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    // Get address info using DB UUID
    const dbAddressArr = await db.select().from(addresses).where(eq(addresses.id, addressId));
    const dbAddress = dbAddressArr[0];
    if (!dbAddress) {
      return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404 });
    }
    const booking = await db.insert(bookings).values({
      id: uuidv4(),
      userId: dbUser.id,
      name: dbUser.firstName || '',
      email: dbUser.email,
      phone: dbUser.phone || '',
      address: `${dbAddress.addressLine1}, ${dbAddress.city}, ${dbAddress.state}, ${dbAddress.postalCode}, ${dbAddress.country}`,
      occasion: occasion || null,
      scheduledFor: new Date(scheduledFor),
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : 'Booking failed') }, { status: 500 });
  }
}
