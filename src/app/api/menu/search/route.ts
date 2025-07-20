import { NextRequest } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { createSuccessResponse, withErrorHandler } from '@/lib/errors';

// GET /api/menu/search - Search menu items
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  if (!query) {
    return createSuccessResponse([]);
  }

  const items = await MenuService.searchMenuItems(query);
  return createSuccessResponse(items);
});
