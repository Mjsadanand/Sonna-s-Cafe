import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { auth } from '@clerk/nextjs/server';

async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const dateRange = dateFrom && dateTo ? {
      from: new Date(dateFrom),
      to: new Date(dateTo)
    } : undefined;

    const topItems = await AdminService.getTopSellingItems(limit, dateRange);

    return NextResponse.json({
      success: true,
      data: topItems
    });
  } catch (error) {
    console.error('Top selling items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top selling items' },
      { status: 500 }
    );
  }
}

export { GET };
