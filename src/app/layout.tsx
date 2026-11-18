import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fredoka',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Flowfi — Multi-Wallet Micro-Spend PWA',
  description: '3-tap daily allowance and multi-wallet tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flowfi',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFF9EC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable}${nunito.variable}`}>
      <body className="min-h-dvh bg-[#FFF9EC] font-sans text-[#2B252C] antialiased selection:bg-[#FBBF24]/40">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}