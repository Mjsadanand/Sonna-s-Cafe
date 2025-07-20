import { NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/menu/statistics - Get menu statistics
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const statistics = await MenuService.getMenuStatistics();

    return NextResponse.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching menu statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu statistics' },
      { status: 500 }
    );
  }
}
