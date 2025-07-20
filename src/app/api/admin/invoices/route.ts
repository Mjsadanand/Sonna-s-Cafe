import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice.service';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/invoices - Get all invoices for admin management
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'total' | 'orderNumber' || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

    const result = await InvoiceService.getAllInvoices({
      page,
      limit,
      paymentStatus: paymentStatus || undefined,
      search: search || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      sortBy,
      sortOrder
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
