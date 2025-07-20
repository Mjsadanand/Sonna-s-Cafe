import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice.service';
import { auth } from '@clerk/nextjs/server';

// GET /api/admin/invoices/[id] - Get specific invoice details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params;
    
    // Check if requesting HTML format
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    
    if (format === 'html') {
      const invoiceHTML = await InvoiceService.generateInvoiceHTML(orderId);
      return new NextResponse(invoiceHTML, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="invoice-${orderId}.html"`
        }
      });
    }

    const invoiceData = await InvoiceService.getInvoiceData(orderId);

    return NextResponse.json({
      success: true,
      data: invoiceData
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
