import { InputHTMLAttributes } from 'react';

export default function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-12 w-full rounded-lg border-2 border-[--border] bg-[--card] px-4 text-base text-[--foreground] outline-none placeholder:text-[--muted-foreground] focus:border-[--accent] transition-colors ${className}`}
      {...props}
    />
  );
}
