import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';

// GET /api/admin/export/orders - Export orders data
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') as 'csv' | 'json' || 'csv';
    const dateFrom = url.searchParams.get('dateFrom') ? new Date(url.searchParams.get('dateFrom')!) : undefined;
    const dateTo = url.searchParams.get('dateTo') ? new Date(url.searchParams.get('dateTo')!) : undefined;
    const status = url.searchParams.get('status') || undefined;

    const data = await AdminService.exportOrdersData({
      format,
      dateFrom,
      dateTo,
      status
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Order Number', 'Customer Email', 'Customer Name', 'Status', 
        'Payment Status', 'Subtotal', 'Tax', 'Delivery Fee', 'Discount', 
        'Total', 'Created At', 'Delivery Time'
      ];
      
      const csvRows = data.map(row => [
        row.orderNumber,
        row.customerEmail,
        row.customerName,
        row.status,
        row.paymentStatus,
        row.subtotal,
        row.tax,
        row.deliveryFee,
        row.discount,
        row.total,
        row.createdAt?.toISOString(),
        row.deliveryTime?.toISOString() || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  }
});
