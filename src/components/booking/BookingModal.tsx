import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const PreBooking = dynamic(() => import('@/components/booking/PreBooking'), { ssr: false });

type BookingData = {
  scheduledFor: Date;
  occasion: string;
  notes: string;
};

type Order = {
  id: string;
  scheduledFor: Date;
  occasion: string;
  notes: string;
};

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onBooking: (data: Order) => void;
}

export default function BookingModal({ open, onClose, onBooking }: BookingModalProps) {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBookingDataChange = (data: BookingData | null) => {
    setBookingData(data);
    setError(null);
  };

  const handleBooking = async () => {
    if (!bookingData) {
      setError('Please complete all booking details');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledFor: bookingData.scheduledFor,
          occasion: bookingData.occasion,
          notes: bookingData.notes
        })
      });
      
      const result = await res.json();
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onBooking({
            id: result.id || 'temp-id',
            scheduledFor: bookingData.scheduledFor,
            occasion: bookingData.occasion,
            notes: bookingData.notes
          });
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || 'Booking failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setBookingData(null);
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="max-w-full sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 border-0">
        <div className="relative">
          {/* Header */}
          <DialogHeader className="relative p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                    Pre-Book Your Order
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">Schedule your perfect moment</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-full h-8 w-8 p-0 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-2 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Confirmed! 🎉</h3>
                <p className="text-gray-600">Your pre-booking has been successfully scheduled.</p>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2 sm:p-6 w-full">
                <PreBooking onBookingChange={handleBookingDataChange} />
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="p-2 pt-0 sm:p-6 sm:pt-0 bg-white/50 backdrop-blur-sm border-t border-white/20 w-full">
              {/* Booking Summary */}
              {bookingData && (
                <div className="mb-4 p-2 sm:p-4 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl text-white w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">Ready to Book</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="opacity-75">Occasion</div>
                      <div className="font-medium">{bookingData.occasion}</div>
                    </div>
                    <div>
                      <div className="opacity-75">Date & Time</div>
                      <div className="font-medium">
                        {bookingData.scheduledFor.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {bookingData.scheduledFor.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="opacity-75">Special Notes</div>
                      <div className="font-medium">
                        {bookingData.notes || 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full">
                <Button
                  onClick={handleBooking}
                  disabled={!bookingData || isSubmitting}
                  className="w-full sm:flex-1 h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Confirming...
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
                  onClick={handleClose} 
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 h-12 border border-gray-200 hover:border-gray-300 rounded-lg font-semibold text-base bg-white/80 backdrop-blur-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}