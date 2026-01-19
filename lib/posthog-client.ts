'use client';

import posthog from 'posthog-js';

// Client-side PostHog instance
let posthogClient: typeof posthog | null = null;

/**
 * Initialize PostHog on the client side
 */
export function initPostHog(): typeof posthog {
  if (typeof window === 'undefined') {
    throw new Error('initPostHog can only be called on the client');
  }

  if (posthogClient) {
    return posthogClient;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!key) {
    console.warn('PostHog key not configured');
    return posthog;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PostHog loaded');
      }
    },
  });

  posthogClient = posthog;
  return posthog;
}

/**
 * Get the PostHog client instance
 */
export function getPostHog(): typeof posthog | null {
  return posthogClient;
}

// Events we track
export const EVENTS = {
  PAGE_VIEW: 'page_view',
  ORDER_CHECK: 'order_check',
  HEADING_TO_FERG: 'heading_to_ferg',
  NOTIFICATION_ENABLED: 'notification_enabled',
  CHECKED_HISTORY: 'checked_history',
  STAYED_ON_PAGE: 'stayed_on_page',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * Track a custom event (client-side)
 */
export function trackEvent(event: EventName, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') {
    console.warn('trackEvent called on server');
    return;
  }

  const ph = getPostHog();
  if (ph) {
    ph.capture(event, properties);
  }
}

/**
 * Track page view with Ferg Index context
 */
export function trackPageView(fergIndex: number, status: string, demandPressure: number): void {
  trackEvent(EVENTS.PAGE_VIEW, {
    ferg_index: fergIndex,
    status,
    demand_pressure: demandPressure,
  });
}

/**
 * Track when user clicks "I'm heading to Ferg"
 */
export function trackHeadingToFerg(fergIndex: number, demandPressure: number): void {
  trackEvent(EVENTS.HEADING_TO_FERG, {
    ferg_index: fergIndex,
    demand_pressure: demandPressure,
  });
}

/**
 * Track time spent on page
 */
export function trackTimeOnPage(durationSeconds: number, fergIndexOnArrival: number): void {
  trackEvent(EVENTS.STAYED_ON_PAGE, {
    duration_seconds: durationSeconds,
    ferg_index_on_arrival: fergIndexOnArrival,
  });
}
