import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="w-full max-w-md bg-white p-8 border border-[#e2e8f0] rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mb-4">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create account</h1>
        <p className="text-sm text-gray-500">Get started with Nexus today</p>
      </div>

      <form className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
            <Input placeholder="First name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
            <Input placeholder="Last name" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <Input type="email" placeholder="Enter your email" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <Input type="password" placeholder="Create a password" />
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-gray-500">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </span>
        </div>

        <Button className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
