import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OffersService } from '@/lib/services/offers.service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const sessionId = request.headers.get('x-session-id');
    const body = await request.json();

    const { offerId, interactionType, orderId } = body;

    if (!offerId || !interactionType) {
      return NextResponse.json(
        { error: 'Missing required fields: offerId, interactionType' },
        { status: 400 }
      );
    }

    // Validate interaction type
    const validInteractions = ['viewed', 'clicked', 'dismissed', 'converted'];
    if (!validInteractions.includes(interactionType)) {
      return NextResponse.json(
        { error: 'Invalid interaction type. Must be one of: viewed, clicked, dismissed, converted' },
        { status: 400 }
      );
    }

    // Track the interaction
    await OffersService.trackInteraction(
      offerId,
      interactionType,
      userId || undefined,
      sessionId || undefined,
      orderId || undefined
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Interaction tracked successfully',
        data: {
          offerId,
          interactionType,
          userId: userId || null,
          sessionId: sessionId || null,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error tracking offer interaction:', error);
    return NextResponse.json(
      { 
        error: 'Failed to track interaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
