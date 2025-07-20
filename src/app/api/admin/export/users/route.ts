import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';

// GET /api/admin/export/users - Export users data
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') as 'csv' | 'json' || 'csv';

    const data = await AdminService.exportUsersData();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Email', 'First Name', 'Last Name', 'Phone', 'Role', 
        'Active', 'Loyalty Points', 'Total Orders', 'Total Spent', 'Created At'
      ];
      
      const csvRows = data.map(row => [
        row.email,
        row.firstName || '',
        row.lastName || '',
        row.phone || '',
        row.role,
        row.isActive ? 'Yes' : 'No',
        row.loyaltyPoints,
        row.totalOrders,
        row.totalSpent,
        row.createdAt?.toISOString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    );
  }
});
