'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useAuth } from '@/lib/context/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { hasCompletedOnboarding, loading } = useAuth();

  // If the user has already completed onboarding, skip directly to dashboard (Requirement 13)
  useEffect(() => {
    if (!loading && hasCompletedOnboarding) {
      router.replace('/dashboard');
    }
  }, [hasCompletedOnboarding, loading, router]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-2 sm:p-6">
      <OnboardingScreen />
    </div>
  );
}
