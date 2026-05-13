import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Travel CRM',
    template: '%s | Travel CRM',
  },
  description: 'Travel Agency CRM — Manage leads, bookings, itineraries and more.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900 antialiased min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}