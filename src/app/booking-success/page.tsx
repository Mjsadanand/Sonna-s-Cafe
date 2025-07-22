import Link from 'next/link';

export default function BookingSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-2 py-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-pink-200 p-8 mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4 text-pink-700">Booking Successful!</h1>
        <p className="mb-6 text-gray-700">Your booking has been confirmed. We look forward to serving you!</p>
        <Link href="/booking-history">
          <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition">View Booking History</button>
        </Link>
        <Link href="/">
          <button className="mt-4 border border-pink-600 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-50 transition">Go to Home</button>
        </Link>
      </div>
    </div>
  );
}
