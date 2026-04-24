'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log(data);
      router.refresh();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 border border-[#e2e8f0] rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-0.5 mb-5">
          <span className="text-xl font-black tracking-tight text-gray-900 leading-none">nex</span>
          <span className="text-xl font-black tracking-tight text-blue-600 leading-none">us</span>
          <span className="ml-0.5 mb-2.5 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to your Nexus account</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
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
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline font-medium">Create one</Link>
      </p>
    </div>
  );
}
