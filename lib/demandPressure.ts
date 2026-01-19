import prisma from './db';

export interface DemandPressure {
  activeNow: number; // Currently on site
  last30Minutes: number; // Unique visitors in last 30 mins
  last60Minutes: number; // Unique visitors in last hour
  trend: 'rising' | 'stable' | 'falling';
}

/**
 * Get demand pressure by querying PostHog for visitor counts.
 * Falls back to database snapshots if PostHog query fails.
 */
export async function getDemandPressure(): Promise<DemandPressure> {
  try {
    // Try to get real-time data from PostHog
    const [last5, last30, last60] = await Promise.all([
      queryPostHogVisitors(5),
      queryPostHogVisitors(30),
      queryPostHogVisitors(60),
    ]);

    // Estimate "active now" as visitors in last 5 minutes
    const activeNow = last5;

    // Determine trend
    const recentRate = last30 / 30; // visitors per minute in recent period
    const olderRate = (last60 - last30) / 30; // visitors per minute in older period

    let trend: DemandPressure['trend'] = 'stable';
    if (recentRate > olderRate * 1.3) trend = 'rising';
    if (recentRate < olderRate * 0.7) trend = 'falling';

    return {
      activeNow,
      last30Minutes: last30,
      last60Minutes: last60,
      trend,
    };
  } catch (error) {
    console.error('Failed to get demand pressure from PostHog:', error);

    // Fallback to database snapshots
    return getDemandPressureFromDb();
  }
}

/**
 * Query PostHog for unique visitors in the last N minutes.
 * Uses PostHog's HogQL query API via REST.
 * Note: This requires a PostHog plan with query API access.
 */
async function queryPostHogVisitors(minutes: number): Promise<number> {
  try {
    const apiKey = process.env.POSTHOG_API_KEY;
    const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';
    const projectId = process.env.POSTHOG_PROJECT_ID;

    if (!apiKey || !projectId) {
      // Fall back to database if PostHog not configured
      return 0;
    }

    // PostHog query API endpoint
    const response = await fetch(`${host}/api/projects/${projectId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            SELECT count(DISTINCT distinct_id) as unique_visitors
            FROM events
            WHERE event = '$pageview'
            AND timestamp > now() - toIntervalMinute(${minutes})
          `,
        },
      }),
    });

    if (!response.ok) {
      console.error('PostHog query failed:', response.status);
      return 0;
    }

    const data = await response.json();
    if (data?.results && Array.isArray(data.results) && data.results[0]) {
      return data.results[0][0] || 0;
    }

    return 0;
  } catch (error) {
    console.error(`Failed to query PostHog for ${minutes}min visitors:`, error);
    return 0;
  }
}

/**
 * Fallback: Get demand pressure from stored database snapshots
 */
async function getDemandPressureFromDb(): Promise<DemandPressure> {
  const now = new Date();
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const sixtyMinsAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);

  try {
    // Get latest snapshot
    const latestSnapshot = await prisma.demandSnapshot.findFirst({
      where: {
        capturedAt: { gte: fiveMinsAgo },
      },
      orderBy: { capturedAt: 'desc' },
    });

    // Get snapshots from different time windows
    const recentSnapshots = await prisma.demandSnapshot.findMany({
      where: {
        capturedAt: { gte: thirtyMinsAgo },
      },
      orderBy: { capturedAt: 'desc' },
    });

    const olderSnapshots = await prisma.demandSnapshot.findMany({
      where: {
        capturedAt: {
          gte: sixtyMinsAgo,
          lt: thirtyMinsAgo,
        },
      },
      orderBy: { capturedAt: 'desc' },
    });

    // Calculate averages
    const recentAvg =
      recentSnapshots.length > 0
        ? recentSnapshots.reduce((sum, s) => sum + s.uniqueVisitors, 0) / recentSnapshots.length
        : 0;

    const olderAvg =
      olderSnapshots.length > 0
        ? olderSnapshots.reduce((sum, s) => sum + s.uniqueVisitors, 0) / olderSnapshots.length
        : 0;

    // Determine trend
    let trend: DemandPressure['trend'] = 'stable';
    if (recentAvg > olderAvg * 1.3) trend = 'rising';
    if (recentAvg < olderAvg * 0.7) trend = 'falling';

    return {
      activeNow: latestSnapshot?.activeNow || 0,
      last30Minutes: latestSnapshot?.uniqueVisitors || 0,
      last60Minutes: Math.round(recentAvg + olderAvg),
      trend,
    };
  } catch (error) {
    console.error('Failed to get demand pressure from database:', error);
    return {
      activeNow: 0,
      last30Minutes: 0,
      last60Minutes: 0,
      trend: 'stable',
    };
  }
}

/**
 * Save a demand pressure snapshot to the database
 */
export async function saveDemandSnapshot(pressure: DemandPressure): Promise<void> {
  try {
    await prisma.demandSnapshot.create({
      data: {
        uniqueVisitors: pressure.last30Minutes,
        pageViews: pressure.last60Minutes,
        activeNow: pressure.activeNow,
      },
    });
  } catch (error) {
    console.error('Failed to save demand snapshot:', error);
  }
}

/**
 * Calculate demand score (0-100) from visitor count
 * Used as a component in the Ferg Index
 */
export function calculateDemandScore(visitors30min: number): number {
  // 0 visitors = 0 score, 100+ visitors = 100 score
  // Linear scaling with a cap at 100
  return Math.min(100, visitors30min);
}
