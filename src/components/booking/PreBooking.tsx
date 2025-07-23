'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Gift, MessageSquare, Sparkles } from 'lucide-react';

type BookingData = {
  scheduledFor: Date;
  occasion: string;
  notes: string;
};

interface PreBookingProps {
  onBookingChange: (data: BookingData | null) => void;
  className?: string;
}

export default function PreBooking({ onBookingChange, className = '' }: PreBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Update parent component when data changes
  useEffect(() => {
    if (selectedDate && selectedTime && occasion) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      onBookingChange({
        scheduledFor: scheduledDateTime,
        occasion,
        notes: notes.trim()
      });
    } else {
      onBookingChange(null);
    }
    // DO NOT include onBookingChange in dependency array to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTime, occasion, notes]);

  // Generate available dates (next 30 days, excluding past dates)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedTime('');
    setOccasion('');
    setNotes('');
    setCurrentStep(1);
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const occasions = [
    { value: 'Birthday', label: 'Birthday Celebration', icon: '🎂', color: 'from-pink-500 to-rose-500' },
    { value: 'Anniversary', label: 'Anniversary Special', icon: '❤️', color: 'from-red-500 to-pink-500' },
    { value: 'Wedding', label: 'Wedding Event', icon: '💒', color: 'from-purple-500 to-pink-500' },
    { value: 'Business', label: 'Business Meeting', icon: '☕', color: 'from-blue-500 to-indigo-500' },
    { value: 'Family', label: 'Family Gathering', icon: '👨‍👩‍👧‍👦', color: 'from-green-500 to-teal-500' },
    { value: 'Casual', label: 'Casual Meet', icon: '😊', color: 'from-orange-500 to-yellow-500' },
    { value: 'Other', label: 'Other Celebration', icon: '🎉', color: 'from-violet-500 to-purple-500' }
  ];


  return (
    <div className={`w-full max-w-xl mx-auto p-0 ${className}`}> 
      {/* Progress Steps (optional, can be a small indicator) */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep === step ? 'bg-violet-500 scale-125' : 'bg-gray-300'}`}
          />
        ))}
      </div>

      {/* Step 1: Occasion Selection */}
      {currentStep === 1 && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-violet-600" />
            <h3 className="text-xl font-semibold text-gray-800">What&apos;s the occasion?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {occasions.map((occ) => (
              <button
                key={occ.value}
                onClick={() => {
                  setOccasion(occ.value);
                  setCurrentStep(2);
                }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${occasion === occ.value
                    ? 'border-violet-500 bg-gradient-to-r ' + occ.color + ' text-white shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-violet-300 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{occ.icon}</span>
                  <div>
                    <div className={`font-semibold ${occasion === occ.value ? 'text-white' : 'text-gray-800'}`}>{occ.label}</div>
                  </div>
                </div>
                {occasion === occ.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date Selection */}
      {currentStep === 2 && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-violet-600" />
            <h3 className="text-xl font-semibold text-gray-800">Select your preferred date</h3>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200">
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">{day}</div>
              ))}
              {availableDates.slice(0, 21).map((date, index) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                const dayOfWeek = date.getDay();
                if (index === 0) {
                  const emptyCells = Array.from({ length: dayOfWeek }, (_, i) => (<div key={`empty-${i}`} />));
                  return [
                    ...emptyCells,
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setCurrentStep(3);
                      }}
                      className={`aspect-square p-2 text-sm rounded-xl border-2 transition-all duration-200 ${isSelected
                          ? 'bg-violet-500 text-white border-violet-500 shadow-lg scale-110'
                          : isToday
                            ? 'bg-violet-100 text-violet-700 border-violet-300'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                        }`}
                    >
                      <div className="font-semibold">{date.getDate()}</div>
                      <div className="text-xs opacity-75">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                    </button>
                  ];
                }
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      setCurrentStep(3);
                    }}
                    className={`aspect-square p-2 text-sm rounded-xl border-2 transition-all duration-200 ${isSelected
                        ? 'bg-violet-500 text-white border-violet-500 shadow-lg scale-110'
                        : isToday
                          ? 'bg-violet-100 text-violet-700 border-violet-300'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                      }`}
                  >
                    <div className="font-semibold">{date.getDate()}</div>
                    <div className="text-xs opacity-75">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => { setOccasion(''); setCurrentStep(1); }} className="text-sm text-gray-500 hover:text-gray-700 underline">Back</button>
          </div>
        </div>
      )}

      {/* Step 3: Time Selection */}
      {currentStep === 3 && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-violet-600" />
            <h3 className="text-xl font-semibold text-gray-800">Choose your preferred time</h3>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 border border-pink-200">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map((time) => {
                const [hours] = time.split(':').map(Number);
                const displayTime = hours === 12 ? `12:${time.split(':')[1]} PM` :
                  hours > 12 ? `${hours - 12}:${time.split(':')[1]} PM` :
                    `${time} AM`;
                return (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setCurrentStep(4);
                    }}
                    className={`p-3 text-sm rounded-xl border-2 transition-all duration-200 ${selectedTime === time
                        ? 'bg-pink-500 text-white border-pink-500 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                  >
                    <div className="font-semibold">{displayTime}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => { setSelectedDate(null); setCurrentStep(2); }} className="text-sm text-gray-500 hover:text-gray-700 underline">Back</button>
          </div>
        </div>
      )}

      {/* Step 4: Notes */}
      {currentStep === 4 && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            <h3 className="text-xl font-semibold text-gray-800">Any special requests? (Optional)</h3>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
            <textarea
              className="w-full h-24 p-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none resize-none"
              placeholder="Tell us about any special requirements, dietary preferences, or decorative requests for your occasion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => { setSelectedTime(''); setCurrentStep(3); }} className="text-sm text-gray-500 hover:text-gray-700 underline">Back</button>
            <button onClick={() => setCurrentStep(5)} className="text-sm text-violet-600 hover:text-violet-800 underline">Continue</button>
          </div>
        </div>
      )}

      {/* Step 5: Summary & Submit */}
      {currentStep === 5 && (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h3 className="text-xl font-semibold text-gray-800">Review your booking</h3>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-xl text-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">Summary</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="opacity-75">Occasion</div>
                <div className="font-medium">{occasion}</div>
              </div>
              <div>
                <div className="opacity-75">Date & Time</div>
                <div className="font-medium">
                  {selectedDate && selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTime}
                </div>
              </div>
              <div>
                <div className="opacity-75">Special Notes</div>
                <div className="font-medium">{notes || 'None'}</div>
              </div>
            </div>
            {(occasion === 'Birthday' || occasion === 'Anniversary' || occasion === 'Wedding') && (
              <div className="mt-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {occasion === 'Birthday' && '🎂'}
                    {occasion === 'Anniversary' && '💕'}
                    {occasion === 'Wedding' && '💒'}
                  </div>
                  <div>
                    <div className="font-bold text-base">Special {occasion} Package!</div>
                    <div className="text-xs opacity-90">
                      We&apos;ll add extra care, beautiful presentation, and complimentary decorative touches for your special {occasion.toLowerCase()}.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => setCurrentStep(4)} className="text-sm text-gray-500 hover:text-gray-700 underline">Back</button>
            <button
              type="button"
              onClick={() => {
                // Only allow submit if all fields are filled
                if (selectedDate && selectedTime && occasion) {
                  setCurrentStep(5); // stay on summary
                }
              }}
              className="text-sm text-violet-600 hover:text-violet-800 underline"
              style={{ pointerEvents: 'none', opacity: 0.5 }}
            >
              {/* This is a placeholder, actual submit is handled by parent */}
              Submit on next step
            </button>
          </div>
        </div>
      )}

      {/* Clear Booking Button */}
      {(currentStep > 1) && (
        <div className="text-center pt-4">
          <button
            onClick={resetBooking}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Clear all selections and start over
          </button>
        </div>
      )}

      {/* Add fade-in animation */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.4s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}