import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { guestOrders } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

const guestOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    specialInstructions: z.string().optional(),
  })).min(1),
  guestAddress: z.object({
    addressLine1: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  customerNotes: z.string().optional(),
  phone: z.string().min(10),
  subtotal: z.string(),
  tax: z.string(),
  deliveryFee: z.string(),
  discount: z.string().optional(),
  total: z.string(),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const data = guestOrderSchema.parse(body);

    // Generate a unique order number
    const orderNumber = `GUEST-${nanoid(8)}`;

    // Insert guest order
    const [order] = await db
      .insert(guestOrders)
      .values({
        orderNumber,
        status: 'pending',
        subtotal: data.subtotal,
        tax: data.tax,
        deliveryFee: data.deliveryFee,
        discount: data.discount || '0',
        total: data.total,
        paymentStatus: 'pending',
        guestAddress: data.guestAddress,
        customerNotes: data.customerNotes,
        phone: data.phone,
      })
      .returning();

    // Optionally: Insert order items into a guest_order_items table (not implemented here)

    return NextResponse.json({ success: true, data: { id: order.id, orderNumber } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create guest order' }, { status: 500 });
  }
};
