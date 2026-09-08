'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useNetwork } from '@/lib/context/NetworkContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { setCurrentNode } = useNetwork();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <OnboardingModal
        isOpen={true}
        onComplete={(node) => {
          setCurrentNode(node);
          router.push('/');
        }}
        onClose={() => router.push('/')}
      />
    </div>
  );
}
