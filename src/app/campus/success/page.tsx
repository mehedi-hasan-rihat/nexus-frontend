'use client';

import Link from 'next/link';

export default function CampusSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-gray-500 mb-2">Your campus is being set up. The principal will receive login credentials via email shortly.</p>
        <p className="text-sm text-gray-400 mb-8">This may take a few moments.</p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
        >
          Go to login →
        </Link>
      </div>
    </div>
  );
}
