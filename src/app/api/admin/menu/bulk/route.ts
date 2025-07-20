import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// POST /api/admin/menu/bulk - Bulk operations on menu items
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json();
    
    const bulkUpdateSchema = z.object({
      action: z.enum(['update', 'delete', 'toggle_availability']),
      itemIds: z.array(z.string()),
      updateData: z.record(z.string(), z.any()).optional(),
    });

    const { action, itemIds, updateData } = bulkUpdateSchema.parse(body);
    
    let results;
    
    switch (action) {
      case 'update':
        if (!updateData) {
          return NextResponse.json(
            { error: 'Update data is required for update action' },
            { status: 400 }
          );
        }
        
        const updates = itemIds.map(id => ({ id, data: updateData }));
        results = await MenuService.bulkUpdateMenuItems(updates);
        break;
        
      case 'delete':
        results = [];
        for (const id of itemIds) {
          const success = await MenuService.deleteMenuItem(id);
          results.push({ id, success });
        }
        break;
        
      case 'toggle_availability':
        results = [];
        for (const id of itemIds) {
          const result = await MenuService.toggleMenuItemAvailability(id);
          results.push({ id, result });
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        processedItems: results.length,
        results
      }
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
