import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';

// GET /api/admin/stats - Get general admin statistics
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');

    let dateRange;
    if (fromDate && toDate) {
      dateRange = {
        from: new Date(fromDate),
        to: new Date(toDate)
      };
    }

    const stats = await AdminService.getDashboardStats(dateRange);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
});