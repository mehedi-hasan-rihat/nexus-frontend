'use client';

import Link from 'next/link';

export default function CampusCancelPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✕</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment cancelled</h1>
        <p className="text-gray-500 mb-8">Your campus registration was not completed. No charge was made.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/campus/create"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-block border border-[#e2e8f0] hover:border-blue-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
