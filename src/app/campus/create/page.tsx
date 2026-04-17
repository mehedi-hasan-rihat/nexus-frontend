'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';

interface FormData {
  campusName: string;
  campusCode: string;
  address: string;
  principal: {
    name: string;
    email: string;
    password: string;
  };
}

const initialForm: FormData = {
  campusName: '',
  campusCode: '',
  address: '',
  principal: { name: '', email: '', password: '' },
};

export default function CreateCampusPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof Omit<FormData, 'principal'>, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const setPrincipal = (field: keyof FormData['principal'], value: string) =>
    setForm((f) => ({ ...f, principal: { ...f.principal, [field]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">Nexus</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Set up your campus</h1>
          <p className="text-sm text-gray-500">Create your campus and assign a principal to get started.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campus Info */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Campus Details</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus name <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="e.g. Greenwood Academy"
                    value={form.campusName}
                    onChange={(e) => set('campusName', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus code <span className="text-red-500">*</span></label>
                    <Input
                      placeholder="e.g. GWA-01"
                      value={form.campusCode}
                      onChange={(e) => set('campusCode', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    <Input
                      placeholder="123 School St."
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e2e8f0]" />

            {/* Principal Info */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Principal Account</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name <span className="text-red-500">*</span></label>
                  <Input
                    placeholder="Principal's full name"
                    value={form.principal.name}
                    onChange={(e) => setPrincipal('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                  <Input
                    type="email"
                    placeholder="principal@school.com"
                    value={form.principal.email}
                    onChange={(e) => setPrincipal('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <Input
                    type="password"
                    placeholder="Create a secure password"
                    value={form.principal.password}
                    onChange={(e) => setPrincipal('password', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Creating campus…' : 'Create campus →'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
