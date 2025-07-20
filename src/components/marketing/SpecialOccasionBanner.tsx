'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift, Sparkles, X, Timer } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

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

interface EnhancedOfferBannerProps {
  onClose?: () => void;
  onOfferClick?: (offer: Offer) => void;
  className?: string;
}

export default function EnhancedOfferBanner({ onClose, onOfferClick, className = '' }: EnhancedOfferBannerProps) {
  const { userId } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
  const [sessionId] = useState(() => crypto.randomUUID());

  const trackInteraction = useCallback(async (offerId: string, interactionType: 'viewed' | 'clicked' | 'dismissed') => {
    try {
      await fetch('/api/offers/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          offerId,
          interactionType,
        }),
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [sessionId]);

  const fetchOffers = useCallback(async () => {
    try {
      const response = await fetch('/api/offers?type=banner', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
        if (data.offers?.length > 0) {
          trackInteraction(data.offers[0].id, 'viewed');
        }
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  }, [sessionId, trackInteraction]);

  useEffect(() => {
    fetchOffers();
  }, [userId, sessionId, fetchOffers]);

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  useEffect(() => {
    // Update countdown timers
    const timer = setInterval(() => {
      const newTimeLeft: { [key: string]: number } = {};
      offers.forEach(offer => {
        const now = new Date().getTime();
        const endTime = new Date(offer.validUntil).getTime();
        const difference = endTime - now;
        newTimeLeft[offer.id] = Math.max(0, difference);
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [offers]);

  const handleOfferClick = (offer: Offer) => {
    trackInteraction(offer.id, 'clicked');
    onOfferClick?.(offer);
  };

  const handleClose = () => {
    if (offers[currentOfferIndex]) {
      trackInteraction(offers[currentOfferIndex].id, 'dismissed');
    }
    setIsVisible(false);
    onClose?.();
  };

  const formatTimeLeft = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getOfferIcon = (occasionType?: string) => {
    switch (occasionType) {
      case 'birthday': return '🎂';
      case 'anniversary': return '❤️';
      case 'festival': return '🎊';
      default: return '🎉';
    }
  };

  const getGradientColors = (occasionType?: string) => {
    switch (occasionType) {
      case 'birthday': return {
        gradient: 'from-pink-500 to-purple-600',
        bgGradient: 'from-pink-50 to-purple-50',
        borderColor: 'border-pink-300'
      };
      case 'anniversary': return {
        gradient: 'from-red-500 to-pink-600',
        bgGradient: 'from-red-50 to-pink-50',
        borderColor: 'border-red-300'
      };
      case 'festival': return {
        gradient: 'from-yellow-500 to-orange-600',
        bgGradient: 'from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-300'
      };
      default: return {
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-300'
      };
    }
  };

  if (!isVisible || offers.length === 0) return null;

  const currentOffer = offers[currentOfferIndex];
  const colors = getGradientColors(currentOffer.occasionType);
  const currentTimeLeft = timeLeft[currentOffer.id] || 0;

  return (
    <div className={`relative overflow-hidden animate-fadeIn ${className}`}>
      <div className={`bg-gradient-to-r ${colors.bgGradient} border ${colors.borderColor} rounded-lg p-6 transition-all duration-1000`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="text-6xl animate-pulse">
            {getOfferIcon(currentOffer.occasionType)}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-800">{currentOffer.title}</h3>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-600 mb-3">{currentOffer.description}</p>
            
            <div className={`bg-gradient-to-r ${colors.gradient} text-white px-4 py-2 rounded-lg inline-block mb-3`}>
              <span className="font-semibold text-sm">
                {currentOffer.discountType === 'percentage' 
                  ? `${currentOffer.discountValue}% OFF`
                  : currentOffer.discountType === 'fixed_amount'
                  ? `₹${currentOffer.discountValue} OFF`
                  : 'FREE DELIVERY'
                }
                {currentOffer.minimumOrderAmount && ` on orders above ₹${currentOffer.minimumOrderAmount}`}
              </span>
            </div>

            {/* Countdown Timer */}
            {currentTimeLeft > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium text-sm">
                  Ends in: {formatTimeLeft(currentTimeLeft)}
                </span>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleOfferClick(currentOffer)}
                className={`bg-gradient-to-r ${colors.gradient} text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2`}
              >
                <Gift className="w-4 h-4" />
                Claim Offer
              </button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hidden md:flex flex-col items-center justify-center text-center min-w-[120px]">
            <div className="relative">
              <div className="text-3xl mb-2 animate-bounce">🎁</div>
              <div className="text-xs text-gray-600 font-medium">
                Limited
                <br />
                Time Only
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        {offers.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentOfferIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentOfferIndex ? 'bg-gray-800 w-6' : 'bg-gray-400'
                }`}
                aria-label={`Show offer ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Urgency Element */}
        <div className="text-center mt-3">
          <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
            <span className="animate-pulse">⚡</span>
            <span className="font-medium">Limited Time Offer - Claim Now!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
