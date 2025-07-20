import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema/index';
import { eq, sql } from 'drizzle-orm';

export class LoyaltyService {
  /**
   * Award loyalty points to a user based on order amount
   * Rule: 1 point per ₹1 spent
   */
  static async awardPoints(userId: string, orderAmount: number): Promise<number> {
    const pointsToAdd = Math.floor(orderAmount); // 1 point per ₹1
    
    const [user] = await db
      .update(users)
      .set({ 
        loyaltyPoints: sql`loyalty_points + ${pointsToAdd}`,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log(`Awarded ${pointsToAdd} points to user ${userId}`);
    return user.loyaltyPoints;
  }

  /**
   * Redeem loyalty points for discount
   * Rule: 1000 points = ₹10 discount
   */
  static async redeemPoints(userId: string, pointsToRedeem: number): Promise<{ success: boolean; discount: number; remainingPoints: number }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).then(res => res[0]);
    
    if (!user || user.loyaltyPoints < pointsToRedeem) {
      return { success: false, discount: 0, remainingPoints: user?.loyaltyPoints || 0 };
    }

    // Calculate discount: 1000 points = ₹10
    const discount = Math.floor(pointsToRedeem / 1000) * 10;
    const actualPointsUsed = Math.floor(pointsToRedeem / 1000) * 1000;

    const [updatedUser] = await db
      .update(users)
      .set({ 
        loyaltyPoints: user.loyaltyPoints - actualPointsUsed,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();

    return { 
      success: true, 
      discount, 
      remainingPoints: updatedUser.loyaltyPoints 
    };
  }

  /**
   * Calculate available discount for points
   */
  static calculateDiscount(points: number): number {
    return Math.floor(points / 1000) * 10;
  }

  /**
   * Get user's loyalty points
   */
  static async getUserPoints(userId: string): Promise<number> {
    const user = await db.select({ loyaltyPoints: users.loyaltyPoints })
      .from(users)
      .where(eq(users.id, userId))
      .then(res => res[0]);
    
    return user?.loyaltyPoints || 0;
  }
}
