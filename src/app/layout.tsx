import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexus',
  description: 'Nexus — Polytechnic Institute Management Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bn"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${notoSansBengali.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
