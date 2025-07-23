"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Clock, Calendar, Sparkles } from 'lucide-react';

const PreBooking = dynamic(() => import('@/components/booking/PreBooking'), { ssr: false });

type BookingData = {
  scheduledFor: Date;
  occasion: string;
  notes: string;
};

export default function BookingPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  
  type Address = {
    id: string;
    label?: string;
    type?: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  };
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;
    setIsLoadingAddresses(true);
    fetch('/api/user/addresses')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAddresses(data.data);
          const defaultAddr = data.data.find((a: Address) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
      })
      .catch(() => setAddresses([]))
      .finally(() => setIsLoadingAddresses(false));
  }, [user?.id]);

  const handleBookingDataChange = (data: BookingData | null) => {
    setBookingData(data);
  };

  const handleBooking = async () => {
    if (!bookingData || !selectedAddressId) {
      setError('Please complete your booking details and select an address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          addressId: selectedAddressId,
          scheduledFor: bookingData.scheduledFor,
          occasion: bookingData.occasion,
          notes: bookingData.notes
        })
      });
      
      const result = await res.json();
      if (result.success) {
        router.push('/booking-success');
        toast.success('Booking confirmed! 🎉');
      } else {
        setError(result.error || 'Booking failed');
        toast.error('Booking failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 px-2 py-4 sm:px-4 sm:py-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-violet-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Pre-Book Your Order
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Schedule your perfect moment with advance booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2 sm:p-6 md:p-8 w-full">
              <PreBooking onBookingChange={handleBookingDataChange} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Address Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2 sm:p-6 w-full">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-violet-600" />
                <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
              </div>
              
              {isLoadingAddresses ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No saved addresses found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push('/profile/addresses')}
                  >
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {addresses.map((addr: Address) => (
                    <div
                      key={addr.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        selectedAddressId === addr.id 
                          ? 'border-violet-500 bg-violet-50/50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{addr.label || addr.type}</div>
                        {addr.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {addr.addressLine1}, {addr.city}
                      </div>
                      <div className="text-xs text-gray-500">
                        {addr.state}, {addr.postalCode}, {addr.country}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Summary */}
            {bookingData && (
              <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-xl text-white p-4 sm:p-6 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Booking Summary</h3>
                </div>
                
                <div className="space-y-3">
                  {bookingData.occasion && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 opacity-75" />
                      <div>
                        <div className="text-xs opacity-75">Occasion</div>
                        <div className="font-medium">{bookingData.occasion}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-75" />
                    <div>
                      <div className="text-xs opacity-75">Date & Time</div>
                      <div className="font-medium">
                        {bookingData.scheduledFor.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {bookingData.scheduledFor.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>

                  {bookingData.notes && (
                    <div>
                      <div className="text-xs opacity-75 mb-1">Special Notes</div>
                      <div className="text-sm bg-white/20 rounded-lg p-2">
                        {bookingData.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <Button
                onClick={handleBooking}
                disabled={!bookingData || !selectedAddressId || isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Confirming Booking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Confirm Pre-Booking
                  </div>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/')} 
                disabled={isSubmitting}
                className="w-full h-12 border border-gray-200 hover:border-gray-300 rounded-lg font-semibold text-base"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}