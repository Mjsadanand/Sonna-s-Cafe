import { insertMenuItemSchema } from '@/lib/db';
import { db } from '@/lib/db';
import { menuItems, categories, MenuItem, Category } from '@/lib/db/schema';
import { eq, and, ilike, asc, count } from 'drizzle-orm';
import { AppError } from '@/lib/utils';
import { z } from 'zod';

export class MenuService {
  // Get all categories
  static async getCategories(activeOnly = false): Promise<Category[]> {
    try {
      const result = activeOnly
        ? await db
            .select()
            .from(categories)
            .where(eq(categories.isActive, true))
            .orderBy(asc(categories.sortOrder), asc(categories.name))
        : await db
            .select()
            .from(categories)
            .orderBy(asc(categories.sortOrder), asc(categories.name));
      
      return result;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new AppError('Failed to fetch categories', 500);
    }
  }

  // Get all menu items with categories joined
  static async getMenuItemsWithCategories(options: {
    page?: number;
    limit?: number;
    categoryId?: string;
    isAvailable?: boolean;
    search?: string;
    isPopular?: boolean;
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        categoryId,
        isAvailable,
        search,
        isPopular
      } = options;



      // Build the query conditions
      const conditions = [];
      
      if (categoryId) {
        conditions.push(eq(menuItems.categoryId, categoryId));
      }
      
      if (isAvailable !== undefined) {
        conditions.push(eq(menuItems.isAvailable, isAvailable));
      }
      
      if (isPopular !== undefined) {
        conditions.push(eq(menuItems.isPopular, isPopular));
      }
      
      if (search) {
        conditions.push(ilike(menuItems.name, `%${search}%`));
      }

      // Build where condition
      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      let countQuery;
      if (whereCondition) {
        countQuery = db.select({ count: count() }).from(menuItems).where(whereCondition);
      } else {
        countQuery = db.select({ count: count() }).from(menuItems);
      }
      
      // Get paginated items with categories
      let itemsQuery;

      if (whereCondition) {
        itemsQuery = db.select({
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          price: menuItems.price,
          image: menuItems.image,
          isAvailable: menuItems.isAvailable,
          isVegetarian: menuItems.isVegetarian,
          isVegan: menuItems.isVegan,
          isGlutenFree: menuItems.isGlutenFree,
          spiceLevel: menuItems.spiceLevel,
          preparationTime: menuItems.preparationTime,
          ingredients: menuItems.ingredients,
          nutritionInfo: menuItems.nutritionInfo,
          tags: menuItems.tags,
          isPopular: menuItems.isPopular,
          sortOrder: menuItems.sortOrder,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
            image: categories.image,
            isActive: categories.isActive,
            sortOrder: categories.sortOrder,
            createdAt: categories.createdAt,
            updatedAt: categories.updatedAt,
          }
        })
          .from(menuItems)
          .leftJoin(categories, eq(menuItems.categoryId, categories.id))
          .where(whereCondition)
          .orderBy(asc(menuItems.sortOrder), asc(menuItems.name))
          .limit(limit)
          .offset((page - 1) * limit);
      } else {
        itemsQuery = db.select({
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          price: menuItems.price,
          image: menuItems.image,
          isAvailable: menuItems.isAvailable,
          isVegetarian: menuItems.isVegetarian,
          isVegan: menuItems.isVegan,
          isGlutenFree: menuItems.isGlutenFree,
          spiceLevel: menuItems.spiceLevel,
          preparationTime: menuItems.preparationTime,
          ingredients: menuItems.ingredients,
          nutritionInfo: menuItems.nutritionInfo,
          tags: menuItems.tags,
          isPopular: menuItems.isPopular,
          sortOrder: menuItems.sortOrder,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
            image: categories.image,
            isActive: categories.isActive,
            sortOrder: categories.sortOrder,
            createdAt: categories.createdAt,
            updatedAt: categories.updatedAt,
          }
        })
          .from(menuItems)
          .leftJoin(categories, eq(menuItems.categoryId, categories.id))
          .orderBy(asc(menuItems.sortOrder), asc(menuItems.name))
          .limit(limit)
          .offset((page - 1) * limit);
      }

      // Execute queries
      const [items, countResult] = await Promise.all([
        itemsQuery,
        countQuery
      ]);

      const total = countResult[0]?.count || 0;

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching menu items with categories:', error);
      throw new AppError('Failed to fetch menu items with categories', 500);
    }
  }

  // Get all menu items with pagination and filtering
  static async getMenuItems(options: {
    page?: number;
    limit?: number;
    categoryId?: string;
    isAvailable?: boolean;
    search?: string;
    isPopular?: boolean;
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        categoryId,
        isAvailable,
        search,
        isPopular
      } = options;



      // Build the query conditions
      const conditions = [];
      
      if (categoryId) {
        conditions.push(eq(menuItems.categoryId, categoryId));
      }
      
      if (isAvailable !== undefined) {
        conditions.push(eq(menuItems.isAvailable, isAvailable));
      }
      
      if (isPopular !== undefined) {
        conditions.push(eq(menuItems.isPopular, isPopular));
      }
      
      if (search) {
        conditions.push(ilike(menuItems.name, `%${search}%`));
      }

      // Build where condition
      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      let countQuery;
      if (whereCondition) {
        countQuery = db.select({ count: count() }).from(menuItems).where(whereCondition);
      } else {
        countQuery = db.select({ count: count() }).from(menuItems);
      }
      
      // Get paginated items
      let itemsQuery;

      if (whereCondition) {
        itemsQuery = db.select()
          .from(menuItems)
          .where(whereCondition)
          .orderBy(asc(menuItems.sortOrder), asc(menuItems.name))
          .limit(limit)
          .offset((page - 1) * limit);
      } else {
        itemsQuery = db.select()
          .from(menuItems)
          .orderBy(asc(menuItems.sortOrder), asc(menuItems.name))
          .limit(limit)
          .offset((page - 1) * limit);
      }

      // Execute queries
      const [items, countResult] = await Promise.all([
        itemsQuery,
        countQuery
      ]);

      const total = countResult[0]?.count || 0;

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw new AppError('Failed to fetch menu items', 500);
    }
  }

  // Get single menu item by ID
  static async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      const result = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching menu item by ID:', error);
      throw new AppError('Failed to fetch menu item', 500);
    }
  }

  // Create new menu item (Admin only)
  static async createMenuItem(data: z.infer<typeof insertMenuItemSchema>): Promise<MenuItem> {
    try {
      // Validate input
      const validatedData = insertMenuItemSchema.parse(data);
      
      // Insert into database
      const result = await db
        .insert(menuItems)
        .values({
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!result[0]) {
        throw new AppError('Failed to create menu item', 500);
      }

      return result[0];
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(`Validation error: ${error.issues.map((issue: z.ZodIssue) => issue.message).join(', ')}`, 400);
      }
      console.error('Error creating menu item:', error);
      throw new AppError('Failed to create menu item', 500);
    }
  }

  // Update menu item (Admin only)
  static async updateMenuItem(id: string, data: Partial<z.infer<typeof insertMenuItemSchema>>): Promise<MenuItem | null> {
    try {
      // Update in database
      const result = await db
        .update(menuItems)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw new AppError('Failed to update menu item', 500);
    }
  }

  // Delete menu item (Admin only)
  static async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(menuItems)
        .where(eq(menuItems.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw new AppError('Failed to delete menu item', 500);
    }
  }

  // Toggle menu item availability (Admin only)
  static async toggleMenuItemAvailability(id: string): Promise<MenuItem | null> {
    try {
      // First get the current item
      const currentItem = await this.getMenuItemById(id);
      if (!currentItem) {
        throw new AppError('Menu item not found', 404);
      }

      // Toggle availability
      const result = await db
        .update(menuItems)
        .set({
          isAvailable: !currentItem.isAvailable,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      throw new AppError('Failed to toggle menu item availability', 500);
    }
  }

  // Get menu items by category
  static async getMenuItemsByCategory(categoryId: string, activeOnly = true): Promise<MenuItem[]> {
    try {
      const whereCondition = activeOnly
        ? and(
            eq(menuItems.categoryId, categoryId),
            eq(menuItems.isAvailable, true)
          )
        : eq(menuItems.categoryId, categoryId);

      const result = await db
        .select()
        .from(menuItems)
        .where(whereCondition)
        .orderBy(asc(menuItems.sortOrder), asc(menuItems.name));
      return result;
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      throw new AppError('Failed to fetch menu items by category', 500);
    }
  }

  // Get popular menu items
  static async getPopularMenuItems(limit = 10): Promise<MenuItem[]> {
    try {
      const result = await db
        .select()
        .from(menuItems)
        .where(and(
          eq(menuItems.isPopular, true),
          eq(menuItems.isAvailable, true)
        ))
        .orderBy(asc(menuItems.sortOrder))
        .limit(limit);

      return result;
    } catch (error) {
      console.error('Error fetching popular menu items:', error);
      throw new AppError('Failed to fetch popular menu items', 500);
    }
  }

  // Search menu items
  static async searchMenuItems(searchTerm: string, limit = 20): Promise<MenuItem[]> {
    try {
      const result = await db
        .select()
        .from(menuItems)
        .where(and(
          ilike(menuItems.name, `%${searchTerm}%`),
          eq(menuItems.isAvailable, true)
        ))
        .orderBy(asc(menuItems.name))
        .limit(limit);

      return result;
    } catch (error) {
      console.error('Error searching menu items:', error);
      throw new AppError('Failed to search menu items', 500);
    }
  }

  // Get menu statistics (Admin only)
  static async getMenuStatistics() {
    try {
      const [totalItems] = await db
        .select({ count: count() })
        .from(menuItems);

      const [availableItems] = await db
        .select({ count: count() })
        .from(menuItems)
        .where(eq(menuItems.isAvailable, true));

      const [popularItems] = await db
        .select({ count: count() })
        .from(menuItems)
        .where(eq(menuItems.isPopular, true));

      const [vegetarianItems] = await db
        .select({ count: count() })
        .from(menuItems)
        .where(eq(menuItems.isVegetarian, true));

      return {
        totalItems: totalItems.count || 0,
        availableItems: availableItems.count || 0,
        popularItems: popularItems.count || 0,
        vegetarianItems: vegetarianItems.count || 0,
      };
    } catch (error) {
      console.error('Error fetching menu statistics:', error);
      throw new AppError('Failed to fetch menu statistics', 500);
    }
  }

  // Bulk update menu items (Admin only)
  static async bulkUpdateMenuItems(updates: Array<{ id: string; data: Partial<z.infer<typeof insertMenuItemSchema>> }>): Promise<MenuItem[]> {
    try {
      const results: MenuItem[] = [];
      
      for (const update of updates) {
        const result = await this.updateMenuItem(update.id, update.data);
        if (result) {
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      console.error('Error bulk updating menu items:', error);
      throw new AppError('Failed to bulk update menu items', 500);
    }
  }
}
