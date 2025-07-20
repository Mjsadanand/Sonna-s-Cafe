import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/analytics/customers - Get customer analytics
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analytics = await AdminService.getCustomerAnalytics();

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics' },
      { status: 500 }
    );
  }
}
