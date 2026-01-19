import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface ChartDataPoint {
  time: string;
  timestamp: number;
  velocity: number;
  orderCount: number;
  visitors?: number;
}

/**
 * Get chart data for the last 24 hours
 */
export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get order snapshots from last 24 hours
    const orderSnapshots = await prisma.orderSnapshot.findMany({
      where: {
        capturedAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { capturedAt: 'asc' },
      select: {
        capturedAt: true,
        velocity: true,
        orderCount: true,
      },
    });

    // Get demand snapshots from last 24 hours
    const demandSnapshots = await prisma.demandSnapshot.findMany({
      where: {
        capturedAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { capturedAt: 'asc' },
      select: {
        capturedAt: true,
        uniqueVisitors: true,
      },
    });

    // Create a map of demand data by hour for easier lookup
    const demandByHour = new Map<number, number>();
    demandSnapshots.forEach((d) => {
      const hourKey = Math.floor(d.capturedAt.getTime() / (60 * 60 * 1000));
      const current = demandByHour.get(hourKey) || 0;
      demandByHour.set(hourKey, Math.max(current, d.uniqueVisitors));
    });

    // Format data for chart
    const chartData: ChartDataPoint[] = orderSnapshots.map((snapshot) => {
      const hourKey = Math.floor(snapshot.capturedAt.getTime() / (60 * 60 * 1000));

      return {
        time: snapshot.capturedAt.toLocaleTimeString('en-NZ', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        timestamp: snapshot.capturedAt.getTime(),
        velocity: snapshot.velocity || 0,
        orderCount: snapshot.orderCount,
        visitors: demandByHour.get(hourKey),
      };
    });

    // Also aggregate by hour for hourly view
    const hourlyData = aggregateByHour(chartData);

    return NextResponse.json({
      raw: chartData,
      hourly: hourlyData,
      startTime: twentyFourHoursAgo.toISOString(),
      endTime: new Date().toISOString(),
      totalSnapshots: orderSnapshots.length,
    });
  } catch (error) {
    console.error('Failed to get chart data:', error);
    return NextResponse.json(
      { error: 'Failed to get chart data', details: String(error) },
      { status: 500 }
    );
  }
}

interface HourlyDataPoint {
  hour: string;
  avgVelocity: number;
  maxVelocity: number;
  avgVisitors: number;
  samples: number;
}

function aggregateByHour(data: ChartDataPoint[]): HourlyDataPoint[] {
  const hourMap = new Map<
    string,
    { velocities: number[]; visitors: number[]; hour: string }
  >();

  data.forEach((point) => {
    const date = new Date(point.timestamp);
    const hourKey = date.toLocaleTimeString('en-NZ', {
      hour: '2-digit',
      hour12: false,
    });

    if (!hourMap.has(hourKey)) {
      hourMap.set(hourKey, { velocities: [], visitors: [], hour: hourKey });
    }

    const bucket = hourMap.get(hourKey)!;
    bucket.velocities.push(point.velocity);
    if (point.visitors !== undefined) {
      bucket.visitors.push(point.visitors);
    }
  });

  const result: HourlyDataPoint[] = [];

  hourMap.forEach((bucket) => {
    const avgVelocity =
      bucket.velocities.length > 0
        ? bucket.velocities.reduce((a, b) => a + b, 0) / bucket.velocities.length
        : 0;

    const maxVelocity =
      bucket.velocities.length > 0 ? Math.max(...bucket.velocities) : 0;

    const avgVisitors =
      bucket.visitors.length > 0
        ? bucket.visitors.reduce((a, b) => a + b, 0) / bucket.visitors.length
        : 0;

    result.push({
      hour: bucket.hour,
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      maxVelocity: Math.round(maxVelocity * 10) / 10,
      avgVisitors: Math.round(avgVisitors),
      samples: bucket.velocities.length,
    });
  });

  return result.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
}
