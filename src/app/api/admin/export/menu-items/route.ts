import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { requireAdminAuth } from '@/lib/middleware/admin-auth';

// GET /api/admin/export/menu-items - Export menu items data
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') as 'csv' | 'json' || 'csv';

    const data = await AdminService.exportMenuItemsData();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Name', 'Description', 'Price', 'Category', 'Available', 
        'Vegetarian', 'Vegan', 'Gluten Free', 'Spice Level', 
        'Preparation Time', 'Popular', 'Created At'
      ];
      
      const csvRows = data.map(row => [
        row.name,
        row.description || '',
        row.price,
        row.category || '',
        row.isAvailable ? 'Yes' : 'No',
        row.isVegetarian ? 'Yes' : 'No',
        row.isVegan ? 'Yes' : 'No',
        row.isGlutenFree ? 'Yes' : 'No',
        row.spiceLevel || '',
        row.preparationTime || '',
        row.isPopular ? 'Yes' : 'No',
        row.createdAt?.toISOString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="menu-items-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error exporting menu items:', error);
    return NextResponse.json(
      { error: 'Failed to export menu items' },
      { status: 500 }
    );
  }
});
