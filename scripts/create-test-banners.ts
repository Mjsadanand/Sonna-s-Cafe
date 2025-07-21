import { db } from '../src/lib/db';
import { offers } from '../src/lib/db/schema';

async function createTestBanners() {
  console.log('Creating test banner offers...');

  // Create banner offers
  const bannerOffers = [
    {
      title: "Weekend Special!",
      description: "Get 25% off on all menu items this weekend",
      type: 'banner' as const,
      discountType: 'percentage' as const,
      discountValue: '25',
      minimumOrderAmount: '300',
      targetAudience: 'all' as const,
      occasionType: 'regular' as const,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      priority: 5,
      isActive: true
    },
    {
      title: "Free Delivery Day!",
      description: "Free delivery on orders above ₹200",
      type: 'banner' as const,
      discountType: 'free_delivery' as const,
      discountValue: '0',
      minimumOrderAmount: '200',
      targetAudience: 'all' as const,
      occasionType: 'regular' as const,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      priority: 3,
      isActive: true
    },
    {
      title: "Birthday Special!",
      description: "Special birthday discount - 30% off!",
      type: 'banner' as const,
      discountType: 'percentage' as const,
      discountValue: '30',
      minimumOrderAmount: '500',
      targetAudience: 'birthday' as const,
      occasionType: 'birthday' as const,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      priority: 8,
      isActive: true
    }
  ];

  // Create popup offers too
  const popupOffers = [
    {
      title: "Limited Time Offer!",
      description: "Get 20% off your first order",
      type: 'popup' as const,
      discountType: 'percentage' as const,
      discountValue: '20',
      minimumOrderAmount: '250',
      targetAudience: 'new_customers' as const,
      occasionType: 'regular' as const,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 7,
      popupDelaySeconds: 3,
      showFrequencyHours: 2,
      isActive: true
    }
  ];

  const allOffers = [...bannerOffers, ...popupOffers];

  for (const offer of allOffers) {
    try {
      const result = await db.insert(offers).values(offer).returning();
      console.log(`Created ${offer.type} offer: ${offer.title} - ID: ${result[0].id}`);
    } catch (error) {
      console.error(`Error creating offer ${offer.title}:`, error);
    }
  }

  console.log('Test offers created successfully!');
}

createTestBanners().catch(console.error);
