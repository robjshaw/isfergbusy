'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog } from '@/lib/posthog-client';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    try {
      const posthog = initPostHog();

      // Track page views on route change
      if (pathname) {
        const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
        posthog.capture('$pageview', {
          $current_url: url,
        });
      }
    } catch (error) {
      console.error('PostHog initialization failed:', error);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
