import type { Metadata } from 'next';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

export const metadata: Metadata = { title: 'Nexus', description: 'Nexus — Polytechnic Institute Management Platform' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={notoSansBengali.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
