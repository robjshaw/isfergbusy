import prisma from './db';
import { getDemandPressure, calculateDemandScore } from './demandPressure';
import { clamp, getNZTime } from './utils';

export type FergStatus = 'ghost_town' | 'warming_up' | 'busy' | 'absolute_scenes';

export interface FergIndexResult {
  index: number; // 0-100
  status: FergStatus;
  label: string; // Human readable label
  emoji: string;
  confidence: number; // 0-1
  components: {
    velocity: number;
    demand: number;
    historical: number;
    trend: number;
  };
  demandWarning: string | null;
  meta: {
    currentVelocity: number;
    visitorCount: number;
    lastUpdated: Date;
  };
}

// Status definitions with labels and emojis
const STATUS_DEFINITIONS: Record<FergStatus, { label: string; emoji: string }> = {
  ghost_town: { label: 'Ghost Town', emoji: '🟢' },
  warming_up: { label: 'Warming Up', emoji: '🟡' },
  busy: { label: 'Busy', emoji: '🟠' },
  absolute_scenes: { label: 'Absolute Scenes', emoji: '🔴' },
};

/**
 * Calculate the Ferg Index - a composite score (0-100) indicating busyness.
 *
 * Components:
 * - Velocity (40%): Current order velocity
 * - Demand (30%): Site visitor pressure
 * - Historical (20%): Time-of-day patterns
 * - Trend (10%): Direction of change
 */
export async function calculateFergIndex(): Promise<FergIndexResult> {
  // Get current velocity from latest snapshot
  const latestSnapshot = await prisma.orderSnapshot.findFirst({
    orderBy: { capturedAt: 'desc' },
  });

  const currentVelocity = latestSnapshot?.velocity || 0;
  const lastUpdated = latestSnapshot?.capturedAt || new Date();

  // Get historical average for this hour/day
  const now = getNZTime();
  const hourOfDay = now.getHours();
  const dayOfWeek = now.getDay();
  const historicalAvg = await getHistoricalAverage(hourOfDay, dayOfWeek);

  // Get demand pressure
  const demand = await getDemandPressure();

  // Get trend (compare recent to older)
  const trend = await getVelocityTrend();

  // Calculate component scores (each 0-100)
  const velocityScore = calculateVelocityScore(currentVelocity);
  const demandScore = calculateDemandScore(demand.last30Minutes);
  const historicalScore = calculateHistoricalScore(currentVelocity, historicalAvg);
  const trendScore = calculateTrendScore(trend);

  // Weighted combination
  const rawIndex =
    velocityScore * 0.4 + demandScore * 0.3 + historicalScore * 0.2 + trendScore * 0.1;

  const index = Math.round(clamp(rawIndex, 0, 100));

  // Determine status
  const status = getStatusFromIndex(index);
  const { label, emoji } = STATUS_DEFINITIONS[status];

  // Calculate confidence (lower if high demand viewing quiet status)
  let confidence = 0.8; // Base confidence
  if (index < 30 && demand.last30Minutes > 30) {
    // Many people checking a "quiet" status reduces confidence
    confidence = Math.max(0.3, confidence - demand.last30Minutes / 100);
  }
  // Also reduce confidence if we have few data points
  const snapshotCount = await prisma.orderSnapshot.count({
    where: {
      capturedAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
  });
  if (snapshotCount < 5) {
    confidence *= 0.7;
  }

  // Generate demand warning if applicable
  const demandWarning = generateDemandWarning(index, demand.last30Minutes);

  return {
    index,
    status,
    label,
    emoji,
    confidence,
    components: {
      velocity: velocityScore,
      demand: demandScore,
      historical: historicalScore,
      trend: trendScore,
    },
    demandWarning,
    meta: {
      currentVelocity,
      visitorCount: demand.last30Minutes,
      lastUpdated,
    },
  };
}

/**
 * Get status string from index value
 */
function getStatusFromIndex(index: number): FergStatus {
  if (index <= 25) return 'ghost_town';
  if (index <= 50) return 'warming_up';
  if (index <= 75) return 'busy';
  return 'absolute_scenes';
}

/**
 * Calculate velocity score (0-100) from orders per hour
 * 0 velocity = 0 score, 20+ orders/hour = 100 score
 */
function calculateVelocityScore(velocity: number): number {
  // Typical busy Fergburger might do 20-30 orders per hour
  // Scale so 20/hr = 100 score
  return clamp((velocity / 20) * 100, 0, 100);
}

/**
 * Calculate historical score based on current vs expected velocity
 */
function calculateHistoricalScore(currentVelocity: number, historicalAvg: number): number {
  if (historicalAvg === 0) {
    // No historical data, return neutral
    return 50;
  }

  // Ratio of current to historical
  const ratio = currentVelocity / historicalAvg;

  // Below average = lower score, above average = higher score
  // 50% of average = 25 score, 100% = 50, 200% = 100
  return clamp(ratio * 50, 0, 100);
}

/**
 * Calculate trend score based on velocity direction
 */
function calculateTrendScore(trend: number): number {
  // trend is a ratio of recent velocity to older velocity
  // trend > 1 means speeding up, < 1 means slowing down

  if (trend <= 0) return 50; // No data, neutral

  // Map trend ratio to score
  // 0.5 ratio = 25 (slowing), 1.0 = 50 (stable), 2.0 = 100 (speeding up)
  return clamp(trend * 50, 0, 100);
}

/**
 * Get historical average velocity for a specific hour and day
 */
async function getHistoricalAverage(hourOfDay: number, dayOfWeek: number): Promise<number> {
  // Query hourly stats for this hour on this day of week
  const stats = await prisma.hourlyStat.findMany({
    where: {
      hourStart: {
        // This is a simplification - in production you'd want to filter
        // by actual day of week, possibly using raw SQL or a view
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    select: {
      hourStart: true,
      avgVelocity: true,
    },
  });

  // Filter to matching hours on matching days
  const relevantStats = stats.filter((s) => {
    const d = new Date(s.hourStart);
    return d.getHours() === hourOfDay && d.getDay() === dayOfWeek;
  });

  if (relevantStats.length === 0) {
    return 0;
  }

  const sum = relevantStats.reduce((acc, s) => acc + (s.avgVelocity || 0), 0);
  return sum / relevantStats.length;
}

/**
 * Get velocity trend (ratio of recent to older velocity)
 */
async function getVelocityTrend(): Promise<number> {
  const now = new Date();
  const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

  // Get recent snapshots (last 15 mins)
  const recentSnapshots = await prisma.orderSnapshot.findMany({
    where: {
      capturedAt: { gte: fifteenMinsAgo },
    },
    select: { velocity: true },
  });

  // Get older snapshots (15-30 mins ago)
  const olderSnapshots = await prisma.orderSnapshot.findMany({
    where: {
      capturedAt: {
        gte: thirtyMinsAgo,
        lt: fifteenMinsAgo,
      },
    },
    select: { velocity: true },
  });

  const recentAvg =
    recentSnapshots.length > 0
      ? recentSnapshots.reduce((sum, s) => sum + (s.velocity || 0), 0) / recentSnapshots.length
      : 0;

  const olderAvg =
    olderSnapshots.length > 0
      ? olderSnapshots.reduce((sum, s) => sum + (s.velocity || 0), 0) / olderSnapshots.length
      : 0;

  if (olderAvg === 0) {
    return recentAvg > 0 ? 1.5 : 1.0; // Speeding up from nothing, or stable at nothing
  }

  return recentAvg / olderAvg;
}

/**
 * Generate a warning message when demand is high but index is low
 */
function generateDemandWarning(index: number, visitors: number): string | null {
  if (index < 30 && visitors > 60) {
    return `${visitors} people just saw "quiet" — it won't stay quiet!`;
  }
  if (index < 50 && visitors > 40) {
    return `${visitors} people checked in the last 30 mins — expect a rush`;
  }
  return null;
}

/**
 * Save a Ferg Index snapshot to the database
 */
export async function saveFergIndexSnapshot(result: FergIndexResult): Promise<void> {
  try {
    await prisma.fergIndexSnapshot.create({
      data: {
        indexValue: result.index,
        status: result.status,
        velocityScore: result.components.velocity,
        demandScore: result.components.demand,
        historicalScore: result.components.historical,
        trendScore: result.components.trend,
        confidence: result.confidence,
      },
    });
  } catch (error) {
    console.error('Failed to save Ferg Index snapshot:', error);
  }
}

/**
 * Get a mock Ferg Index for development/testing when no database is available
 */
export function getMockFergIndex(): FergIndexResult {
  const now = new Date();
  const hour = now.getHours();

  // Simulate typical patterns: quiet early morning, busy lunch, very busy dinner
  let baseIndex: number;
  if (hour < 6) baseIndex = 10;
  else if (hour < 11) baseIndex = 25;
  else if (hour < 14) baseIndex = 65;
  else if (hour < 17) baseIndex = 45;
  else if (hour < 21) baseIndex = 85;
  else baseIndex = 50;

  // Add some randomness
  const index = clamp(baseIndex + Math.floor(Math.random() * 20 - 10), 0, 100);
  const status = getStatusFromIndex(index);
  const { label, emoji } = STATUS_DEFINITIONS[status];

  return {
    index,
    status,
    label,
    emoji,
    confidence: 0.75,
    components: {
      velocity: index * 0.4,
      demand: index * 0.3,
      historical: index * 0.2,
      trend: index * 0.1,
    },
    demandWarning: null,
    meta: {
      currentVelocity: Math.round(index * 0.2),
      visitorCount: Math.round(Math.random() * 50),
      lastUpdated: now,
    },
  };
}
