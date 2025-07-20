'use client';

import { useState } from 'react';
import { Calendar, Clock, Gift } from 'lucide-react';

interface PreBookingProps {
  onScheduleSelect: (scheduledFor: Date | null) => void;
  className?: string;
}

export default function PreBooking({ onScheduleSelect, className = '' }: PreBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');

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

  const handleDateTimeUpdate = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      onScheduleSelect(scheduledDateTime);
    } else {
      onScheduleSelect(null);
    }
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedTime('');
    setOccasion('');
    onScheduleSelect(null);
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();
  const occasions = [
    'Birthday Celebration 🎂',
    'Anniversary Special ❤️',
    'Wedding Event 💒',
    'Corporate Meeting ☕',
    'Family Gathering 👨‍👩‍👧‍👦',
    'Other Celebration 🎉'
  ];

  return (
    <div className={`bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-800">Pre-Book Your Order</h3>
        <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded-full">Special Occasions</span>
      </div>

      <div className="space-y-4">
        {/* Occasion Selection */}
        <div>
          <label htmlFor="occasion-select" className="block text-sm font-medium text-gray-700 mb-2">
            <Gift className="w-4 h-4 inline mr-1" />
            What&apos;s the occasion?
          </label>
          <select
            id="occasion-select"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select an occasion</option>
            {occasions.map((occ) => (
              <option key={occ} value={occ}>{occ}</option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Select Date
          </label>
          <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto">
            {availableDates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    setSelectedDate(date);
                    handleDateTimeUpdate();
                  }}
                  className={`p-2 text-xs rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-pink-600 text-white border-pink-600'
                      : isToday
                      ? 'bg-pink-100 text-pink-700 border-pink-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-pink-50'
                  }`}
                >
                  <div className="font-medium">{date.getDate()}</div>
                  <div className="text-xs opacity-75">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setSelectedTime(time);
                    handleDateTimeUpdate();
                  }}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedTime === time
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-pink-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-white border border-pink-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {occasion && <div><strong>Occasion:</strong> {occasion}</div>}
              <div><strong>Date:</strong> {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
              <div><strong>Time:</strong> {selectedTime}</div>
            </div>
            <button
              onClick={resetBooking}
              className="mt-3 text-sm text-pink-600 hover:text-pink-800 underline"
            >
              Clear booking
            </button>
          </div>
        )}

        {/* Special Notes for Occasions */}
        {(occasion.includes('Birthday') || occasion.includes('Anniversary')) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="text-lg">🎁</span>
              <div>
                <div className="font-semibold">Special Occasion Detected!</div>
                <div className="text-sm">We&apos;ll add extra care and special presentation for your {occasion.split(' ')[0].toLowerCase()} order.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
