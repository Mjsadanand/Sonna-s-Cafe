import { db } from '@/lib/db/index';
import { addresses, type NewAddress, type Address } from '@/lib/db/schema/index';
import { eq, and } from 'drizzle-orm';

export class AddressService {
  /**
   * Get all addresses for a user
   */
  static async getUserAddresses(userId: string): Promise<Address[]> {
    return db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId));
  }

  /**
   * Create a new address
   */
  static async createAddress(addressData: NewAddress): Promise<Address> {
    // If this is the first address for the user, make it default
    const existingAddresses = await this.getUserAddresses(addressData.userId);
    const isFirstAddress = existingAddresses.length === 0;

    const newAddressData = {
      ...addressData,
      isDefault: addressData.isDefault || isFirstAddress,
    };

    // If setting as default, unset other default addresses
    if (newAddressData.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, addressData.userId),
            eq(addresses.isDefault, true)
          )
        );
    }

    const [address] = await db
      .insert(addresses)
      .values(newAddressData)
      .returning();

    return address;
  }

  /**
   * Update an address
   */
  static async updateAddress(
    addressId: string, 
    userId: string, 
    updates: Partial<NewAddress>
  ): Promise<Address | null> {
    // If setting as default, unset other default addresses
    if (updates.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, userId),
            eq(addresses.isDefault, true)
          )
        );
    }

    const [address] = await db
      .update(addresses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(addresses.id, addressId),
          eq(addresses.userId, userId)
        )
      )
      .returning();

    return address || null;
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    try {
      // Check if this is the default address
      const addressToDelete = await db
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.id, addressId),
            eq(addresses.userId, userId)
          )
        )
        .then(res => res[0]);

      if (!addressToDelete) {
        throw new Error('Address not found');
      }

      await db.delete(addresses).where(
        and(
          eq(addresses.id, addressId),
          eq(addresses.userId, userId)
        )
      );

      // If deleted address was default, set another address as default
      if (addressToDelete.isDefault) {
        const remainingAddresses = await this.getUserAddresses(userId);
        if (remainingAddresses.length > 0) {
          await this.setDefaultAddress(remainingAddresses[0].id, userId);
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      return false;
    }
  }

  /**
   * Set default address
   */
  static async setDefaultAddress(addressId: string, userId: string): Promise<Address | null> {
    // Unset all default addresses for the user
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));

    // Set the specified address as default
    const [address] = await db
      .update(addresses)
      .set({ 
        isDefault: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(addresses.id, addressId),
          eq(addresses.userId, userId)
        )
      )
      .returning();

    return address || null;
  }

  /**
   * Get default address for a user
   */
  static async getDefaultAddress(userId: string): Promise<Address | null> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.userId, userId),
          eq(addresses.isDefault, true)
        )
      );

    return address || null;
  }

  /**
   * Get address by ID (with user verification)
   */
  static async getAddressById(addressId: string, userId: string): Promise<Address | null> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.id, addressId),
          eq(addresses.userId, userId)
        )
      );

    return address || null;
  }
}
