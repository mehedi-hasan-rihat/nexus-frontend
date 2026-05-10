'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { tokenStore } from '@/lib/token';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!tokenStore.isAuthenticated()) { setChecking(false); return; }
    const sessionToken = tokenStore.getSession();
    const accessToken = tokenStore.getAccess();
    fetch(`${API}/auth/me`, {
      headers: {
        Authorization: `Bearer ${sessionToken ?? ''}`,
        'X-Access-Token': accessToken ?? '',
      },
    })
      .then((res) => { if (res.ok) window.location.href = '/dashboard'; })
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');
      tokenStore.set({ sessionToken: data.data.sessionToken, accessToken: data.data.accessToken });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="w-full max-w-md flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#1447E6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[--card] border border-[--border] rounded-2xl shadow-sm p-8">
      {/* Wordmark */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-0.5 mb-5 select-none">
          <span className="text-xl font-black tracking-tight text-[--foreground] leading-none">nex</span>
          <span
            className="text-xl font-black tracking-tight leading-none bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #0052FF, #4D7CFF)' }}
          >
            us
          </span>
          <span className="ml-0.5 mb-2.5 w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
        </Link>
        <h1 className="text-2xl font-semibold text-[--foreground] mb-1">Welcome back</h1>
        <p className="text-sm text-[--muted-foreground]">Sign in to your Nexus account</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[--foreground] mb-1.5">Email address</label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-[--foreground]">Password</label>
            <Link href="/forgot-password" className="text-sm text-[--accent] hover:underline">Forgot password?</Link>
          </div>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
