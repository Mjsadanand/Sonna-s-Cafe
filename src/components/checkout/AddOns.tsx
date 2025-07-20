'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'dessert' | 'beverage' | 'snack' | 'extra';
  popular?: boolean;
}

interface AddOnsProps {
  onAddOnsChange: (addOns: { id: string; quantity: number; price: number; name: string }[]) => void;
  className?: string;
}

const AVAILABLE_ADDONS: AddOn[] = [
  {
    id: 'cake-pop-chocolate',
    name: 'Chocolate Cake Pops',
    description: 'Rich chocolate cake pops (pack of 6)',
    price: 150,
    image: '🍭',
    category: 'dessert',
    popular: true
  },
  {
    id: 'cake-pop-vanilla',
    name: 'Vanilla Cake Pops',
    description: 'Creamy vanilla cake pops (pack of 6)',
    price: 140,
    image: '🧁',
    category: 'dessert'
  },
  {
    id: 'cold-coffee',
    name: 'Iced Coffee',
    description: 'Refreshing cold brew coffee',
    price: 80,
    image: '☕',
    category: 'beverage',
    popular: true
  },
  {
    id: 'fresh-juice',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 60,
    image: '🧃',
    category: 'beverage'
  },
  {
    id: 'cookies',
    name: 'Butter Cookies',
    description: 'Homemade butter cookies (pack of 4)',
    price: 90,
    image: '🍪',
    category: 'snack'
  },
  {
    id: 'candles',
    name: 'Birthday Candles',
    description: 'Colorful birthday candles set',
    price: 30,
    image: '🕯️',
    category: 'extra'
  },
  {
    id: 'gift-wrap',
    name: 'Gift Wrapping',
    description: 'Beautiful gift wrap service',
    price: 50,
    image: '🎁',
    category: 'extra'
  },
  {
    id: 'brownies',
    name: 'Fudge Brownies',
    description: 'Rich chocolate fudge brownies (pack of 4)',
    price: 120,
    image: '🍫',
    category: 'dessert',
    popular: true
  }
];

export default function AddOns({ onAddOnsChange, className = '' }: AddOnsProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<{ [key: string]: number }>({});

  const updateQuantity = (addOnId: string, change: number) => {
    const addOn = AVAILABLE_ADDONS.find(item => item.id === addOnId);
    if (!addOn) return;

    setSelectedAddOns(prev => {
      const currentQuantity = prev[addOnId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      const updated = { ...prev };
      if (newQuantity === 0) {
        delete updated[addOnId];
      } else {
        updated[addOnId] = newQuantity;
      }

      // Notify parent component
      const addOnsList = Object.entries(updated).map(([id, quantity]) => {
        const item = AVAILABLE_ADDONS.find(addon => addon.id === id)!;
        return {
          id,
          quantity,
          price: item.price * quantity,
          name: item.name
        };
      });
      
      onAddOnsChange(addOnsList);
      return updated;
    });
  };

  const totalAddOnCost = Object.entries(selectedAddOns).reduce((total, [id, quantity]) => {
    const addOn = AVAILABLE_ADDONS.find(item => item.id === id);
    return total + (addOn ? addOn.price * quantity : 0);
  }, 0);

  const totalItems = Object.values(selectedAddOns).reduce((sum, qty) => sum + qty, 0);

  const categoryGroups = AVAILABLE_ADDONS.reduce((groups, addOn) => {
    if (!groups[addOn.category]) {
      groups[addOn.category] = [];
    }
    groups[addOn.category].push(addOn);
    return groups;
  }, {} as { [key: string]: AddOn[] });

  const categoryNames = {
    dessert: 'Sweet Treats 🧁',
    beverage: 'Beverages ☕',
    snack: 'Snacks 🍪',
    extra: 'Special Extras 🎁'
  };

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Add Something Special</h3>
          <Sparkles className="w-4 h-4 text-purple-500" />
        </div>
        {totalItems > 0 && (
          <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            {totalItems} item{totalItems > 1 ? 's' : ''} • ₹{totalAddOnCost}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(categoryGroups).map(([category, addOns]) => (
          <div key={category}>
            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
              {categoryNames[category as keyof typeof categoryNames]}
              {category === 'dessert' && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addOns.map((addOn) => {
                const quantity = selectedAddOns[addOn.id] || 0;
                return (
                  <div
                    key={addOn.id}
                    className={`border rounded-lg p-4 transition-all ${
                      quantity > 0
                        ? 'border-purple-300 bg-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{addOn.image}</span>
                          <div>
                            <h5 className="font-medium text-gray-800 text-sm">
                              {addOn.name}
                              {addOn.popular && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                  Popular
                                </span>
                              )}
                            </h5>
                            <p className="text-xs text-gray-600">{addOn.description}</p>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-purple-600">
                          ₹{addOn.price}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-3">
                        {quantity > 0 ? (
                          <>
                            <button
                              onClick={() => updateQuantity(addOn.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                              aria-label={`Remove one ${addOn.name}`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-gray-800">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(addOn.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                              aria-label={`Add one ${addOn.name}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => updateQuantity(addOn.id, 1)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <div className="mt-6 pt-4 border-t border-purple-200">
          <div className="bg-white border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Add-ons Summary</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(selectedAddOns).map(([id, quantity]) => {
                const addOn = AVAILABLE_ADDONS.find(item => item.id === id)!;
                return (
                  <div key={id} className="flex justify-between text-gray-600">
                    <span>{addOn.name} × {quantity}</span>
                    <span>₹{addOn.price * quantity}</span>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold text-purple-600">
                <span>Total Add-ons:</span>
                <span>₹{totalAddOnCost}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500">
          💡 Add-ons are prepared fresh and delivered with your order
        </div>
      </div>
    </div>
  );
}
