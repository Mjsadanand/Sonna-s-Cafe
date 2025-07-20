import { NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice.service';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/invoices/stats - Get invoice statistics
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await InvoiceService.getInvoiceStatistics();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice statistics' },
      { status: 500 }
    );
  }
}
