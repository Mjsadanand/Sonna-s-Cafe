import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// GET /api/admin/reviews - Get all reviews for admin management
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const rating = searchParams.get('rating');
    const isApproved = searchParams.get('isApproved');
    const menuItemId = searchParams.get('menuItemId');
    const search = searchParams.get('search');

    const result = await AdminService.getAllReviews({
      page,
      limit,
      rating: rating ? parseInt(rating) : undefined,
      isApproved: isApproved ? isApproved === 'true' : undefined,
      menuItemId: menuItemId || undefined,
      search: search || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/reviews - Update review status
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json();
    
    const updateReviewSchema = z.object({
      reviewId: z.string(),
      isApproved: z.boolean(),
    });

    const { reviewId, isApproved } = updateReviewSchema.parse(body);
    
    const result = await AdminService.updateReviewStatus(reviewId, isApproved);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update review status' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }
    
    const success = await AdminService.deleteReview(reviewId);

    return NextResponse.json({
      success,
      message: success ? 'Review deleted successfully' : 'Review not found'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
