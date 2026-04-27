import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
}

export function Button({ className = '', variant = 'filled', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 h-10 text-sm font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750A4] focus-visible:ring-offset-2 cursor-pointer';

  const variants = {
    filled:   'bg-[#6750A4] text-white hover:bg-[#6750A4]/90 hover:shadow-md',
    tonal:    'bg-[#E8DEF8] text-[#1D192B] hover:bg-[#E8DEF8]/80 hover:shadow-sm',
    outlined: 'border border-[#79747E] text-[#6750A4] hover:bg-[#6750A4]/5',
    text:     'text-[#6750A4] hover:bg-[#6750A4]/10',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
