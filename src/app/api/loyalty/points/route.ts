import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LoyaltyService } from '@/lib/services/loyalty.service';
import { UserService } from '@/lib/services/user.service';

// GET /api/loyalty/points - Get user's loyalty points
export async function GET() {
  try {
    // Try to get user ID but don't require authentication
    let clerkUserId: string | null = null;
    try {
      const authResult = await auth();
      clerkUserId = authResult.userId;
    } catch {
      // Return default values for guest users
      return NextResponse.json({
        loyaltyPoints: 0,
        availableDiscount: 0,
        discountRate: '1000 points = ₹10'
      });
    }
    
    if (!clerkUserId) {
      return NextResponse.json({
        loyaltyPoints: 0,
        availableDiscount: 0,
        discountRate: '1000 points = ₹10'
      });
    }

    // Get database user ID from Clerk ID
    const dbUser = await UserService.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({
        loyaltyPoints: 0,
        availableDiscount: 0,
        discountRate: '1000 points = ₹10'
      });
    }

    const points = await LoyaltyService.getUserPoints(dbUser.id);
    const availableDiscount = LoyaltyService.calculateDiscount(points);

    return NextResponse.json({
      loyaltyPoints: points,
      availableDiscount,
      discountRate: '1000 points = ₹10'
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/loyalty/points - Award or redeem points
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, amount, points } = await request.json();

    if (action === 'award') {
      // Award points based on order amount
      const newTotal = await LoyaltyService.awardPoints(userId, amount);
      return NextResponse.json({
        success: true,
        message: `Awarded ${amount} points`,
        totalPoints: newTotal
      });
    }

    if (action === 'redeem') {
      // Redeem points for discount
      const result = await LoyaltyService.redeemPoints(userId, points);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing loyalty points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
