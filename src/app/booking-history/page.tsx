"use client";
import { useEffect, useState } from 'react';

type Booking = {
  id: string;
  occasion?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  scheduledFor?: string | Date;
  notes?: string;
};

export default function BookingHistoryPage() {
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/booking/history')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistory(data.bookings || []);
        } else {
          setError(data.error || 'Failed to load booking history');
        }
      })
      .catch(() => setError('Failed to load booking history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-2 py-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-pink-200 p-8 mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-pink-700 text-center">Your Booking History</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-400">No bookings found.</div>
        ) : (
          <ul className="divide-y divide-pink-100">
            {history.map((b: Booking) => (
              <li key={b.id} className="py-4 px-2">
                <div className="font-bold text-pink-700">{b.occasion || 'Booking'}</div>
                <div className="text-sm text-gray-700">{b.name} &bull; {b.email} &bull; {b.phone}</div>
                <div className="text-sm text-gray-500">{b.address}</div>
                <div className="text-xs text-gray-400">Scheduled: {b.scheduledFor ? new Date(b.scheduledFor).toLocaleString() : ''}</div>
                {b.notes && <div className="text-xs text-gray-500 mt-1">Notes: {b.notes}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
