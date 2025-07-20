import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice.service';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/invoices/analytics - Get invoice analytics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const dateRange = dateFrom && dateTo ? {
      from: new Date(dateFrom),
      to: new Date(dateTo)
    } : undefined;

    const analytics = await InvoiceService.getInvoiceStatistics(dateRange);

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice analytics' },
      { status: 500 }
    );
  }
}
