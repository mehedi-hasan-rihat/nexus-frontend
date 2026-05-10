'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CampusCancelPage() {
  return (
    <div className="min-h-screen bg-[--muted] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-500 rounded-none flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-white font-bold">✕</span>
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tighter text-[--foreground] mb-2">PAYMENT CANCELLED</h1>
        <p className="text-[--muted-foreground] mb-8">Your campus registration was not completed. No charge was made.</p>
        <div className="flex gap-3 justify-center">
          <Button>
            <Link href="/campus/create">TRY AGAIN</Link>
          </Button>
          <Button variant="secondary">
            <Link href="/">GO HOME</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
