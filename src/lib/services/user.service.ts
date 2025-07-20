import { db } from '@/lib/db';
import { users, type NewUser, type User } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface UserSyncData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'kitchen_staff';
}

export class UserService {
  /**
   * Create a new user in the database
   */
  static async createUser(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  /**
   * Get user by Clerk ID
   */
  static async getUserByClerkId(clerkId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return user || null;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  /**
   * Update user by Clerk ID
   */
  static async updateUserByClerkId(clerkId: string, updateData: Partial<NewUser>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkId))
      .returning();
    return user || null;
  }

  /**
   * Delete user by Clerk ID
   */
  static async deleteUserByClerkId(clerkId: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.clerkId, clerkId));
      return Array.isArray(result) ? result.length > 0 : false;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Sync user from Clerk data
   */
  static async syncUserFromClerk(clerkUser: {
    id: string;
    emailAddresses: Array<{ emailAddress: string }>;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumbers?: Array<{ phoneNumber: string }>;
    publicMetadata?: { role?: string };
  }): Promise<User> {
    const userData: NewUser = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || undefined,
      role: (clerkUser.publicMetadata?.role as 'customer' | 'admin' | 'kitchen_staff') || 'customer',
    };

    // Check if user already exists
    const existingUser = await this.getUserByClerkId(clerkUser.id);
    
    if (existingUser) {
      // Update existing user
      return await this.updateUserByClerkId(clerkUser.id, userData) || existingUser;
    } else {
      // Create new user
      return await this.createUser(userData);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  /**
   * Update user loyalty points
   */
  static async updateLoyaltyPoints(userId: string, points: number): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        loyaltyPoints: points,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  /**
   * Add loyalty points to user
   */
  static async addLoyaltyPoints(userId: string, pointsToAdd: number): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const newPoints = (user.loyaltyPoints || 0) + pointsToAdd;
    return this.updateLoyaltyPoints(userId, newPoints);
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  /**
   * Reactivate user account
   */
  static async activateUser(userId: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: string, role: 'customer' | 'admin' | 'kitchen_staff'): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  /**
   * Sync user data from API request
   */
  static async syncUser(userData: UserSyncData): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByClerkId(userData.clerkId);

    if (existingUser) {
      // Update existing user
      const updatedUser = await this.updateUserByClerkId(userData.clerkId, userData);
      return updatedUser || existingUser;
    } else {
      // Create new user
      return await this.createUser(userData);
    }
  }
}
