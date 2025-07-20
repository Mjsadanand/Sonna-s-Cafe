'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Timer, Gift, Zap } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue: string;
  minimumOrderAmount?: string;
  validUntil: string;
  popupDelaySeconds: number;
}

interface UrgentOfferPopupProps {
  onClose?: () => void;
  onOfferAccept?: (offer: Offer) => void;
  className?: string;
}

export default function UrgentOfferPopup({ onClose, onOfferAccept, className = '' }: UrgentOfferPopupProps) {
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasShown, setHasShown] = useState(false);
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

  const fetchPopupOffers = useCallback(async () => {
    if (hasShown) return; // Only show once per session
    
    try {
      const response = await fetch('/api/offers?type=popup', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const offers = data.offers || [];
        if (offers.length > 0) {
          const offer = offers[0]; // Get first available popup offer
          setCurrentOffer(offer);
          
          // Show popup after delay
          setTimeout(() => {
            setIsVisible(true);
            setHasShown(true);
            trackInteraction(offer.id, 'viewed');
          }, offer.popupDelaySeconds * 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching popup offers:', error);
    }
  }, [sessionId, trackInteraction, hasShown]);

  useEffect(() => {
    // Fetch popup offers on component mount
    fetchPopupOffers();
  }, [fetchPopupOffers]);

  const handleClose = useCallback(() => {
    if (currentOffer) {
      trackInteraction(currentOffer.id, 'dismissed');
    }
    setIsVisible(false);
    onClose?.();
  }, [currentOffer, trackInteraction, onClose]);

  const handleAccept = () => {
    if (currentOffer) {
      trackInteraction(currentOffer.id, 'clicked');
      onOfferAccept?.(currentOffer);
    }
    setIsVisible(false);
  };

  const formatTimeLeft = (milliseconds: number) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    if (currentOffer && isVisible) {
      // Update countdown timer
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(currentOffer.validUntil).getTime();
        const difference = endTime - now;
        setTimeLeft(Math.max(0, difference));
        
        // Auto-close if expired
        if (difference <= 0) {
          handleClose();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentOffer, isVisible, handleClose]);

  if (!isVisible || !currentOffer) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 ${className}`}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
          {/* Header with urgency indicator */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 animate-pulse" />
              <h3 className="text-xl font-bold">Limited Time Offer!</h3>
            </div>
            
            <div className="flex items-center gap-2 text-red-100">
              <Timer className="w-4 h-4" />
              <span className="font-medium">
                Expires in: {formatTimeLeft(timeLeft)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎁</div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">
                {currentOffer.title}
              </h4>
              <p className="text-gray-600 mb-4">
                {currentOffer.description}
              </p>
              
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-4 mb-4">
                <div className="text-3xl font-bold mb-1">
                  {currentOffer.discountType === 'percentage' 
                    ? `${currentOffer.discountValue}% OFF`
                    : currentOffer.discountType === 'fixed_amount'
                    ? `₹${currentOffer.discountValue} OFF`
                    : 'FREE DELIVERY'
                  }
                </div>
                {currentOffer.minimumOrderAmount && (
                  <div className="text-sm opacity-90">
                    on orders above ₹{currentOffer.minimumOrderAmount}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAccept}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Claim This Offer
              </button>
              
              <button
                onClick={handleClose}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Urgency messaging */}
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                <span className="animate-pulse">⚡</span>
                <span className="font-medium">Don&apos;t miss out - Offer expires soon!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translate(-50%, -50%); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translate(-50%, -50%); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
