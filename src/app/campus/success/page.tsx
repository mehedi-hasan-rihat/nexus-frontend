'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CampusSuccessPage() {
  return (
    <div className="min-h-screen bg-[--muted] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-[--accent] rounded-none flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-[--accent-foreground] font-bold">✓</span>
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tighter text-[--foreground] mb-2">PAYMENT SUCCESSFUL!</h1>
        <p className="text-[--muted-foreground] mb-2">Your campus is being set up. The principal will receive login credentials via email shortly.</p>
        <p className="text-sm text-[--muted-foreground] mb-8">This may take a few moments.</p>
        <Button>
          <Link href="/login">GO TO LOGIN →</Link>
        </Button>
      </div>
    </div>
  );
}
