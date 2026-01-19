import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { formatRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Get current order stats and recent history
 */
export async function GET() {
  try {
    // Get latest snapshot
    const latestSnapshot = await prisma.orderSnapshot.findFirst({
      orderBy: { capturedAt: 'desc' },
    });

    // Get snapshots from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSnapshots = await prisma.orderSnapshot.findMany({
      where: {
        capturedAt: { gte: oneHourAgo },
      },
      orderBy: { capturedAt: 'desc' },
    });

    // Calculate orders completed in last hour (difference in max order numbers)
    let completedLastHour = 0;
    if (recentSnapshots.length >= 2) {
      const newest = recentSnapshots[0];
      const oldest = recentSnapshots[recentSnapshots.length - 1];
      if (newest.maxOrder && oldest.maxOrder) {
        completedLastHour = Math.max(0, newest.maxOrder - oldest.maxOrder);
      }
    }

    // Calculate average velocity over last hour
    const avgVelocity =
      recentSnapshots.length > 0
        ? recentSnapshots.reduce((sum, s) => sum + (s.velocity || 0), 0) / recentSnapshots.length
        : 0;

    return NextResponse.json({
      readyOrders: latestSnapshot?.readyOrders || [],
      orderCount: latestSnapshot?.orderCount || 0,
      velocity: latestSnapshot?.velocity || 0,
      avgVelocity,
      completedLastHour,
      minOrder: latestSnapshot?.minOrder,
      maxOrder: latestSnapshot?.maxOrder,
      lastUpdated: latestSnapshot
        ? formatRelativeTime(latestSnapshot.capturedAt)
        : 'never',
      lastUpdatedAt: latestSnapshot?.capturedAt.toISOString(),
      snapshotsLastHour: recentSnapshots.length,
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: String(error) },
      { status: 500 }
    );
  }
}
