import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function SignupPage() {
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
        <h1 className="text-2xl font-semibold text-[--foreground] mb-1">Create account</h1>
        <p className="text-sm text-[--muted-foreground]">Get started with Nexus today</p>
      </div>

      <form className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[--foreground] mb-1.5">First name</label>
            <Input placeholder="First name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--foreground] mb-1.5">Last name</label>
            <Input placeholder="Last name" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[--foreground] mb-1.5">Email address</label>
          <Input type="email" placeholder="Enter your email" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[--foreground] mb-1.5">Password</label>
          <Input type="password" placeholder="Create a password" />
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 rounded border-[--border] focus:ring-[--ring]"
          />
          <span className="text-sm text-[--muted-foreground]">
            I agree to the{' '}
            <Link href="/terms" className="text-[--accent] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[--accent] hover:underline">Privacy Policy</Link>
          </span>
        </div>

        <Button variant="primary" className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-[--muted-foreground]">
        Already have an account?{' '}
        <Link href="/login" className="text-[--accent] hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
