import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'large';
}

export function Button({ className = '', variant = 'primary', size = 'default', children, ...props }: ButtonProps) {
  const baseSize = size === 'large' 
    ? 'min-h-[56px] px-8 text-sm' 
    : 'min-h-[44px] px-6 text-sm';
    
  const base =
    `inline-flex items-center justify-center rounded-lg ${baseSize} font-bold uppercase tracking-tight transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 focus-visible:ring-offset-[--background]`;

  if (variant === 'ghost') {
    return (
      <button
        className={`${base} bg-transparent border-none text-[--foreground] hover:text-[--accent] ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        className={`${base} bg-transparent border-2 border-[--border] text-[--foreground] hover:bg-[--muted] hover:border-[--accent] ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  // primary — acid yellow background with black text
  return (
    <button
      className={`${base} bg-[--accent] text-[--accent-foreground] hover:scale-105 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
