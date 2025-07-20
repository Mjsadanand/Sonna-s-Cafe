'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface LoyaltyDisplayProps {
  showFull?: boolean;
  className?: string;
}

export default function LoyaltyDisplay({ showFull = false, className = '' }: LoyaltyDisplayProps) {
  const { userId } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState({
    loyaltyPoints: 0,
    availableDiscount: 0,
    discountRate: '1000 points = ₹10'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchLoyaltyPoints();
    }
  }, [userId]);

  const fetchLoyaltyPoints = async () => {
    try {
      const response = await fetch('/api/loyalty/points');
      if (response.ok) {
        const data = await response.json();
        setLoyaltyData(data);
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId || loading) {
    return null;
  }

  if (!showFull) {
    // Compact version for header/navbar
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full">
          <span className="text-xs">🏆</span>
          <span className="font-medium">{loyaltyData.loyaltyPoints}</span>
          <span className="text-xs opacity-90">pts</span>
        </div>
        {loyaltyData.availableDiscount > 0 && (
          <div className="text-green-600 font-medium text-xs">
            ₹{loyaltyData.availableDiscount} off available
          </div>
        )}
      </div>
    );
  }

  // Full version for detailed display
  return (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Loyalty Points
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-600">
            {loyaltyData.loyaltyPoints}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {loyaltyData.availableDiscount > 0 ? (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-lg">🎉</span>
            <div>
              <div className="font-semibold">You can save ₹{loyaltyData.availableDiscount}!</div>
              <div className="text-sm">Use your points at checkout</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="text-blue-800 text-sm">
            <div className="font-medium">Keep ordering to earn more points!</div>
            <div>You need {1000 - (loyaltyData.loyaltyPoints % 1000)} more points for your next ₹10 discount</div>
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Earn rate:</span>
          <span className="font-medium">₹1 = 1 point</span>
        </div>
        <div className="flex justify-between">
          <span>Redeem rate:</span>
          <span className="font-medium">{loyaltyData.discountRate}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-amber-200">
        <div className="text-xs text-gray-500 text-center">
          Points are automatically applied to your next order
        </div>
      </div>
    </div>
  );
}
