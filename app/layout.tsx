import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: 'Is Ferg Busy? | Real-time Fergburger Intelligence',
  description:
    'Real-time busyness tracking for Fergburger in Queenstown, NZ. Know before you go with the Ferg Index.',
  keywords: [
    'Fergburger',
    'Queenstown',
    'New Zealand',
    'restaurant',
    'wait time',
    'busy',
  ],
  authors: [{ name: 'IsFergBusy' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Is Ferg Busy?',
  },
  openGraph: {
    title: 'Is Ferg Busy?',
    description: 'Real-time Fergburger intelligence for Queenstown',
    url: 'https://isfergbusy.co.nz',
    siteName: 'IsFergBusy',
    locale: 'en_NZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is Ferg Busy?',
    description: 'Real-time Fergburger intelligence for Queenstown',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white min-h-screen flex flex-col`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <PostHogProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </PostHogProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
