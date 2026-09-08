import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'LogiSync Pro — AI Logistics Platform for Indian MSMEs',
  description:
    'Move goods smarter with 3D live fleet tracking, AI route optimization, and real-time hub management. Trusted by 320+ MSMEs across India.',
  keywords: ['logistics', 'MSME', 'India', 'fleet tracking', 'route optimization', 'AI logistics'],
  openGraph: {
    title: 'LogiSync Pro',
    description: 'AI Logistics Intelligence for Indian MSMEs',
    type: 'website',
  },
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
