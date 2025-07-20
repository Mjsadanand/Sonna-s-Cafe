import { NextRequest } from 'next/server';
import { MenuService } from '@/lib/services/menu.service';
import { createSuccessResponse, withErrorHandler } from '@/lib/errors';

// GET /api/menu/categories - Get all categories
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('activeOnly') === 'true';
  
  const categories = await MenuService.getCategories(activeOnly);
  return createSuccessResponse(categories);
});
