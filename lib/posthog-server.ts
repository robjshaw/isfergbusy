import { PostHog } from 'posthog-node';

// Server-side PostHog client
let posthogServer: PostHog | null = null;

/**
 * Get the server-side PostHog client for querying analytics
 */
export function getPostHogServer(): PostHog {
  if (posthogServer) {
    return posthogServer;
  }

  const key = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!key) {
    throw new Error('POSTHOG_API_KEY not configured');
  }

  posthogServer = new PostHog(key, {
    host,
  });

  return posthogServer;
}
