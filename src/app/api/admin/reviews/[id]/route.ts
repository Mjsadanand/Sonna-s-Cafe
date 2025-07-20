import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// PUT /api/admin/reviews/[id] - Update review status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const body = await request.json();
    
    const updateSchema = z.object({
      isApproved: z.boolean()
    });
    
    const { isApproved } = updateSchema.parse(body);
    const result = await AdminService.updateReviewStatus(reviewId, isApproved);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const success = await AdminService.deleteReview(reviewId);

    if (!success) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}