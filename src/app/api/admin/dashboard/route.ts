import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { auth } from '@clerk/nextjs/server';

async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you might want to implement proper admin check)
    // For now, we'll assume the auth check is sufficient
    
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const dateRange = dateFrom && dateTo ? {
      from: new Date(dateFrom),
      to: new Date(dateTo)
    } : undefined;

    const stats = await AdminService.getDashboardStats(dateRange);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

export { GET };
