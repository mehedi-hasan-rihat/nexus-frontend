'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus_theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('nexus_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-14 h-8 rounded-full bg-[--muted] animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-[--muted] border-2 border-[--border] transition-colors duration-300 hover:border-[--accent] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:ring-offset-2 focus:ring-offset-[--background]"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Toggle slider */}
      <div
        className={`absolute top-0.5 ${
          theme === 'dark' ? 'left-0.5' : 'left-[26px]'
        } w-6 h-6 rounded-full bg-[--accent] flex items-center justify-center transition-all duration-300 shadow-md`}
      >
        <span className="text-xs">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <span className={`text-xs transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-50'}`}>
          🌙
        </span>
        <span className={`text-xs transition-opacity duration-300 ${theme === 'dark' ? 'opacity-50' : 'opacity-0'}`}>
          ☀️
        </span>
      </div>
    </button>
  );
}
