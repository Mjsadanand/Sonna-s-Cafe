import { NextRequest } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { createSuccessResponse, withErrorHandler } from '@/lib/errors';

// GET /api/menu/items - Get menu items with filtering
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const categoryId = searchParams.get('categoryId') || undefined;
  const isAvailable = searchParams.get('isAvailable') === 'true' ? true : 
                      searchParams.get('isAvailable') === 'false' ? false : undefined;
  const search = searchParams.get('search') || undefined;
  const isPopular = searchParams.get('isPopular') === 'true' ? true :
                    searchParams.get('isPopular') === 'false' ? false : undefined;

  const result = await MenuService.getMenuItems({
    page,
    limit,
    categoryId,
    isAvailable,
    search,
    isPopular,
  });

  return createSuccessResponse(result);
});
