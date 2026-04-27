'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tokenStore } from '@/lib/token';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!tokenStore.isAuthenticated()) { setChecking(false); return; }
    const sessionToken = tokenStore.getSession();
    const accessToken  = tokenStore.getAccess();
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${sessionToken ?? ''}`, 'X-Access-Token': accessToken ?? '' },
    })
      .then(res => { if (res.ok) window.location.href = '/dashboard'; })
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--md-background)' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--md-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--md-background)' }}>
      {/* Blur shapes */}
      <div aria-hidden="true" className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--md-primary)', opacity: 0.12 }} />
      <div aria-hidden="true" className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--md-tertiary)', opacity: 0.1 }} />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-0.5 mb-6 select-none">
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--md-on-background)' }}>nex</span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--md-primary)' }}>us</span>
            <span className="ml-0.5 mb-3 w-2 h-2 rounded-full inline-block" style={{ background: 'var(--md-primary)' }} />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--md-on-background)' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--md-on-surface-variant)' }}>Sign in to your Nexus account</p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] p-8 shadow-md" style={{ background: 'var(--md-surface-container)' }}>
          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl text-sm" style={{ background: '#FEE2E2', color: '#991B1B' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 px-1" style={{ color: 'var(--md-on-surface-variant)' }}>Email address</label>
              <input
                type="email" placeholder="Enter your email" value={email}
                onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 h-14 text-sm bg-[#E7E0EC] rounded-t-xl rounded-b-none border-0 border-b-2 border-[#79747E] outline-none placeholder:text-[#49454F]/60 text-[#1C1B1F] transition-colors duration-200 focus:border-[#6750A4]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-xs font-medium" style={{ color: 'var(--md-on-surface-variant)' }}>Password</label>
                <Link href="/forgot-password" className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--md-primary)' }}>Forgot password?</Link>
              </div>
              <input
                type="password" placeholder="Enter your password" value={password}
                onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 h-14 text-sm bg-[#E7E0EC] rounded-t-xl rounded-b-none border-0 border-b-2 border-[#79747E] outline-none placeholder:text-[#49454F]/60 text-[#1C1B1F] transition-colors duration-200 focus:border-[#6750A4]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="w-full h-12 rounded-full text-sm font-medium text-white transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 disabled:opacity-50 hover:shadow-md hover:opacity-90"
                style={{ background: 'var(--md-primary)' }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--md-primary)' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
