'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { SearchDialog } from '@/components/ui/SearchDialog';
import { LogisticsProvider } from '@/lib/context/LogisticsContext';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasCompletedOnboarding, loading: authLoading } = useAuth();

  // Navigation guard: Redirect to login if unauthenticated, or to onboarding if needed
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/auth/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (hasCompletedOnboarding === false && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [user, hasCompletedOnboarding, authLoading, pathname, router]);

  // Auto-collapse sidebar on tablet screens (<=1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LogisticsProvider>
      <div className="min-h-screen bg-primary-subtle text-neutral-900 flex flex-col antialiased">
        {/* Global Search & Command Palette Modal (Ctrl + K) */}
        <SearchDialog />

        {/* Sidebar navigation */}
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main content wrapper */}
        <div
          className={cn(
            'flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0',
            isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
          )}
        >
          {/* Sticky topbar */}
          <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

          {/* Page body content */}
          <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </LogisticsProvider>
  );
}
