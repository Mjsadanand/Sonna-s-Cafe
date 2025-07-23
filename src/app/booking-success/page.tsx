'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function BookingSuccess() {
  useEffect(() => {
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });
    });

    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }

    const audio = new Audio('/success-tone.mp3');
    audio.play();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Booking Confirmed
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for your booking. We&apos;ll be in touch soon with confirmation details.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/booking-history" className="block">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                View Booking History
              </button>
            </Link>
            
            <Link href="/" className="block">
              <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors duration-200">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}