import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { scrapeFergOrders, calculateVelocity, getOrderRangeInfo } from '@/lib/scraper';
import { getDemandPressure, saveDemandSnapshot } from '@/lib/demandPressure';

/**
 * Scraper endpoint - called by Railway cron every 3 minutes.
 *
 * Scrapes ferglovesyou.co.nz for current ready orders,
 * calculates velocity, and stores snapshots.
 */
export async function GET(request: Request) {
  // Verify cron secret if configured
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Scrape current orders
    const scraped = await scrapeFergOrders();
    const rangeInfo = getOrderRangeInfo(scraped.readyOrders);

    // Get previous snapshot for velocity calculation
    const previous = await prisma.orderSnapshot.findFirst({
      orderBy: { capturedAt: 'desc' },
    });

    // Calculate velocity
    let velocity = 0;
    if (previous) {
      const timeDeltaMs = scraped.capturedAt.getTime() - previous.capturedAt.getTime();
      const timeDeltaMinutes = timeDeltaMs / (1000 * 60);

      if (timeDeltaMinutes > 0 && timeDeltaMinutes < 60) {
        velocity = calculateVelocity(
          scraped.readyOrders,
          previous.readyOrders,
          timeDeltaMinutes
        );
      }
    }

    // Save order snapshot
    const snapshot = await prisma.orderSnapshot.create({
      data: {
        capturedAt: scraped.capturedAt,
        readyOrders: scraped.readyOrders,
        minOrder: rangeInfo.min,
        maxOrder: rangeInfo.max,
        orderCount: rangeInfo.count,
        velocity,
      },
    });

    // Also capture demand snapshot
    try {
      const demand = await getDemandPressure();
      await saveDemandSnapshot(demand);
    } catch (demandError) {
      console.error('Failed to capture demand snapshot:', demandError);
    }

    // Update hourly stats
    await updateHourlyStats(snapshot.capturedAt, velocity);

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        orderCount: snapshot.orderCount,
        velocity: snapshot.velocity,
        orders: snapshot.readyOrders,
      },
    });
  } catch (error) {
    console.error('Scrape failed:', error);
    return NextResponse.json(
      { error: 'Scrape failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Update hourly statistics with the latest snapshot data
 */
async function updateHourlyStats(capturedAt: Date, velocity: number): Promise<void> {
  const hourStart = new Date(capturedAt);
  hourStart.setMinutes(0, 0, 0);

  try {
    // Try to get existing record
    const existing = await prisma.hourlyStat.findUnique({
      where: { hourStart },
    });

    if (existing) {
      // Update existing record
      const newSampleCount = existing.sampleCount + 1;
      const newAvgVelocity =
        ((existing.avgVelocity || 0) * existing.sampleCount + velocity) / newSampleCount;

      await prisma.hourlyStat.update({
        where: { hourStart },
        data: {
          avgVelocity: newAvgVelocity,
          peakVelocity: Math.max(existing.peakVelocity || 0, velocity),
          minVelocity: Math.min(existing.minVelocity || Infinity, velocity),
          sampleCount: newSampleCount,
        },
      });
    } else {
      // Create new record
      await prisma.hourlyStat.create({
        data: {
          hourStart,
          ordersCompleted: 0,
          avgVelocity: velocity,
          peakVelocity: velocity,
          minVelocity: velocity,
          sampleCount: 1,
        },
      });
    }
  } catch (error) {
    console.error('Failed to update hourly stats:', error);
  }
}

// Allow POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
