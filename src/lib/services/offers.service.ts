import { db } from '@/lib/db/index';
import { offers, userOfferInteractions, orders } from '@/lib/db/schema/index';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export class OffersService {
  /**
   * Get active offers for display (banners, popups)
   */
  static async getActiveOffers(type?: 'banner' | 'popup' | 'notification', targetAudience: string = 'all') {
    const now = new Date();
    
    const whereConditions = [
      eq(offers.isActive, true),
      lte(offers.validFrom, now),
      gte(offers.validUntil, now)
    ];

    const activeOffers = await db
      .select()
      .from(offers)
      .where(and(...whereConditions))
      .orderBy(desc(offers.priority), desc(offers.createdAt));

    // Filter by type (including 'both' which matches all types)
    let filteredOffers = activeOffers;
    if (type) {
      filteredOffers = activeOffers.filter(offer => 
        offer.type === type || offer.type === 'both'
      );
    }

    // Filter by target audience
    return filteredOffers.filter(offer => 
      offer.targetAudience === 'all' || offer.targetAudience === targetAudience
    );
  }

  /**
   * Get popup offers that should be shown to user
   */
  static async getPopupOffersForUser(userId?: string, sessionId?: string) {
    const now = new Date();
    const timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Get all active popup offers
    const popupOffers = await this.getActiveOffers('popup');

    if (!popupOffers.length) return [];

    // If user is logged in, check their interaction history
    if (userId) {
      const recentInteractions = await db
        .select()
        .from(userOfferInteractions)
        .where(
          and(
            eq(userOfferInteractions.userId, userId),
            gte(userOfferInteractions.createdAt, timeThreshold)
          )
        );

      const interactedOfferIds = recentInteractions.map(i => i.offerId);
      
      // Filter out offers user has seen recently
      return popupOffers.filter(offer => !interactedOfferIds.includes(offer.id));
    }

    // For anonymous users, check session interactions
    if (sessionId) {
      const recentInteractions = await db
        .select()
        .from(userOfferInteractions)
        .where(
          and(
            eq(userOfferInteractions.sessionId, sessionId),
            gte(userOfferInteractions.createdAt, timeThreshold)
          )
        );

      const interactedOfferIds = recentInteractions.map(i => i.offerId);
      return popupOffers.filter(offer => !interactedOfferIds.includes(offer.id));
    }

    return popupOffers;
  }

  /**
   * Track user interaction with offer
   */
  static async trackInteraction(
    offerId: string, 
    interactionType: 'viewed' | 'clicked' | 'dismissed' | 'converted',
    userId?: string,
    sessionId?: string,
    orderId?: string
  ) {
    // Record the interaction
    await db.insert(userOfferInteractions).values({
      offerId,
      userId,
      sessionId,
      interactionType,
      orderId,
    });

    // Update offer statistics
    if (interactionType === 'viewed') {
      await db
        .update(offers)
        .set({ viewCount: sql`view_count + 1` })
        .where(eq(offers.id, offerId));
    } else if (interactionType === 'clicked') {
      await db
        .update(offers)
        .set({ clickCount: sql`click_count + 1` })
        .where(eq(offers.id, offerId));
    } else if (interactionType === 'converted') {
      await db
        .update(offers)
        .set({ conversionCount: sql`conversion_count + 1` })
        .where(eq(offers.id, offerId));
    }
  }

  /**
   * Apply offer discount to order
   */
  static async applyOfferDiscount(offerId: string, orderAmount: number): Promise<{
    isValid: boolean;
    discountAmount: number;
    message: string;
  }> {
    const offer = await db.select().from(offers).where(eq(offers.id, offerId)).then(res => res[0]);

    if (!offer) {
      return { isValid: false, discountAmount: 0, message: 'Offer not found' };
    }

    const now = new Date();
    if (!offer.isActive || offer.validFrom > now || offer.validUntil < now) {
      return { isValid: false, discountAmount: 0, message: 'Offer has expired' };
    }

    // Check minimum order amount
    if (offer.minimumOrderAmount && orderAmount < parseFloat(offer.minimumOrderAmount)) {
      return { 
        isValid: false, 
        discountAmount: 0, 
        message: `Minimum order amount is ₹${offer.minimumOrderAmount}` 
      };
    }

    // Check usage limit
    if (offer.usageLimit && (offer.usedCount || 0) >= offer.usageLimit) {
      return { isValid: false, discountAmount: 0, message: 'Offer usage limit reached' };
    }

    let discountAmount = 0;

    if (offer.discountType === 'percentage') {
      discountAmount = (orderAmount * parseFloat(offer.discountValue)) / 100;
    } else if (offer.discountType === 'fixed_amount') {
      discountAmount = parseFloat(offer.discountValue);
    } else if (offer.discountType === 'free_delivery') {
      // Free delivery logic would be handled separately
      discountAmount = 0;
    }

    // Apply maximum discount limit
    if (offer.maximumDiscountAmount && discountAmount > parseFloat(offer.maximumDiscountAmount)) {
      discountAmount = parseFloat(offer.maximumDiscountAmount);
    }

    return {
      isValid: true,
      discountAmount: Math.min(discountAmount, orderAmount),
      message: 'Offer applied successfully'
    };
  }

  /**
   * Get personalized offers based on user behavior
   */
  static async getPersonalizedOffers(userId: string) {
    // Get user's order history to determine personalization
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    const isNewCustomer = userOrders.length === 0;
    const isLoyalCustomer = userOrders.length >= 5;

    let targetAudience = 'all';
    if (isNewCustomer) targetAudience = 'new_customers';
    if (isLoyalCustomer) targetAudience = 'loyal_customers';

    return this.getActiveOffers(undefined, targetAudience);
  }

  /**
   * Create urgency-based popup offer
   */
  static async createUrgencyOffer(data: {
    title: string;
    description: string;
    discountValue: number;
    validUntilHours: number;
    targetAudience?: string;
  }) {
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + data.validUntilHours * 60 * 60 * 1000);

    return db.insert(offers).values({
      title: data.title,
      description: data.description,
      type: 'popup',
      discountType: 'percentage',
      discountValue: data.discountValue.toString(),
      targetAudience: data.targetAudience || 'all',
      validFrom,
      validUntil,
      priority: 10, // High priority for urgency offers
      popupDelaySeconds: 5, // Show quickly for urgency
      showFrequencyHours: 1, // Can show more frequently
    }).returning();
  }
}
