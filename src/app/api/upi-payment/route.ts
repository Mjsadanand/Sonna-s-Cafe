
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { upiPayments } from '../../../lib/db/schema';

export async function POST(req: Request) {
  try {
    const { orderId, upiId, amount, status, transactionId } = await req.json();
    // Prepare payment object for Drizzle insert
    // Only provide fields required for insert, omitting auto-generated 'id'
    // Provide id as undefined to allow auto-increment
    // Remove 'id' from insert object, use 'as any' to bypass Drizzle type error
    const payment = {
      orderId,
      upiId,
      amount: typeof amount === 'string' ? amount : String(amount),
      status,
      transactionId: transactionId ?? null,
    };
    await db.insert(upiPayments).values(payment as typeof upiPayments.$inferInsert);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('UPI payment insert error:', error);
    return NextResponse.json({ success: false, error: 'Failed to store UPI payment.' }, { status: 500 });
  }
}
