import { NextRequest } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { createSuccessResponse, withErrorHandler } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/menu/items/[id] - Get specific menu item
export const GET = withErrorHandler(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const menuItem = await MenuService.getMenuItemById(id);
  return createSuccessResponse(menuItem);
});
