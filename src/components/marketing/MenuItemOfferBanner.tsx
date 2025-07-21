'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/cart-context-new';
import { toast } from 'sonner';

interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue: string;
  minimumOrderAmount?: string;
  validUntil: string;
  occasionType?: string;
  type: 'banner' | 'popup' | 'notification';
}

interface MenuItemOfferBannerProps {
  menuItem: {
    id: string;
    name: string;
    price: string;
    image?: string;
    categoryId?: string;
  };
  onAddToCart?: (item: MenuItemOfferBannerProps['menuItem']) => void;
  className?: string;
}

export default function MenuItemOfferBanner({ 
  menuItem, 
  onAddToCart, 
  className = '' 
}: MenuItemOfferBannerProps) {
  const [applicableOffers, setApplicableOffers] = useState<Offer[]>([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const { addToCart } = useCart();
  const router = useRouter();

  const fetchApplicableOffers = useCallback(async () => {
    try {
      const response = await fetch('/api/offers?type=banner', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      if (response.ok) {
        const result = await response.json();
        const offersData = result.success ? result.data : [];
        
        // Filter offers that might be applicable to this menu item
        const applicable = offersData.filter((offer: Offer) => {
          const itemPrice = parseFloat(menuItem.price.replace(/[^\d.]/g, ''));
          const minOrder = offer.minimumOrderAmount ? parseFloat(offer.minimumOrderAmount) : 0;
          
          // Show offer if item price meets minimum or if there's no minimum
          return minOrder === 0 || itemPrice >= minOrder;
        });
        
        setApplicableOffers(applicable);
        setShowBanner(applicable.length > 0);
      }
    } catch (error) {
      console.error('Error fetching applicable offers:', error);
    }
  }, [sessionId, menuItem.price]);

  useEffect(() => {
    fetchApplicableOffers();
  }, [fetchApplicableOffers]);

  useEffect(() => {
    if (applicableOffers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % applicableOffers.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [applicableOffers.length]);

  const handleAddToCartWithOffer = async () => {
    // Add item to cart using the cart context
    try {
      // Convert price string to number and create proper MenuItem object
      const cartMenuItem = {
        id: menuItem.id,
        name: menuItem.name,
        description: '', // Default description
        price: parseFloat(menuItem.price.replace(/[^\d.]/g, '')),
        image: menuItem.image || '', // Default empty string if no image
        category: { id: menuItem.categoryId || '', name: '', slug: '' }, // Default category
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: 'MILD' as const,
        preparationTime: 15, // Default 15 minutes
        ingredients: [] // Empty ingredients array
      };

      if (onAddToCart) {
        onAddToCart(menuItem);
      } else {
        await addToCart(cartMenuItem, 1); // quantity = 1
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
      return;
    }

    // Show offer toast if applicable
    if (applicableOffers.length > 0) {
      const offer = applicableOffers[currentOfferIndex];
      toast.success(
        `🎉 ${offer.title}`,
        {
          description: offer.description,
          action: {
            label: "View Menu",
            onClick: () => router.push('/menu')
          }
        }
      );
    }
  };

  const handleBannerClick = () => {
    if (applicableOffers.length > 0) {
      // Track interaction
      fetch('/api/offers/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          offerId: applicableOffers[currentOfferIndex].id,
          interactionType: 'clicked',
        }),
      }).catch(console.error);
    }
    
    // Navigate to menu page
    router.push('/menu');
  };

  const getOfferIcon = (occasionType?: string) => {
    switch (occasionType) {
      case 'birthday': return '🎂';
      case 'anniversary': return '❤️';
      case 'festival': return '🎊';
      default: return '🎁';
    }
  };

  const getGradientColors = (occasionType?: string) => {
    switch (occasionType) {
      case 'birthday': return 'from-pink-500 to-purple-600';
      case 'anniversary': return 'from-red-500 to-pink-600';
      case 'festival': return 'from-yellow-500 to-orange-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  if (!showBanner || applicableOffers.length === 0) return null;

  const currentOffer = applicableOffers[currentOfferIndex];
  const gradient = getGradientColors(currentOffer.occasionType);

  return (
    <div className={`relative ${className}`}>
      {/* Offer Banner */}
      <div 
        className={`bg-gradient-to-r ${gradient} text-white p-3 rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={handleBannerClick}
      >
        <div className="flex items-center gap-2">
          <div className="text-lg animate-pulse">
            {getOfferIcon(currentOffer.occasionType)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-bold text-sm">{currentOffer.title}</span>
              <Sparkles className="w-3 h-3" />
            </div>
            <div className="text-xs opacity-90">{currentOffer.description}</div>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-xs">
            {currentOffer.discountType === 'percentage' 
              ? `${currentOffer.discountValue}% OFF`
              : currentOffer.discountType === 'fixed_amount'
              ? `₹${currentOffer.discountValue} OFF`
              : 'FREE DELIVERY'
            }
          </Badge>
        </div>
      </div>

      {/* Enhanced Add to Cart Button */}
      <div className="bg-white border border-gray-200 p-3 rounded-b-lg">
        <Button
          onClick={handleAddToCartWithOffer}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
          <Gift className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-600">
          <span>Click banner for menu</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>

      {/* Progress Indicators */}
      {applicableOffers.length > 1 && (
        <div className="absolute top-1 right-1 flex gap-1">
          {applicableOffers.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentOfferIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
