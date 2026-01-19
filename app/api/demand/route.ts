import { NextResponse } from 'next/server';
import { getDemandPressure } from '@/lib/demandPressure';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Get current demand pressure (site visitor stats)
 */
export async function GET() {
  try {
    const demand = await getDemandPressure();

    return NextResponse.json({
      activeNow: demand.activeNow,
      last30Minutes: demand.last30Minutes,
      last60Minutes: demand.last60Minutes,
      trend: demand.trend,
      // Derived values
      trendEmoji: getTrendEmoji(demand.trend),
      pressureLevel: getPressureLevel(demand.last30Minutes),
    });
  } catch (error) {
    console.error('Failed to get demand pressure:', error);
    return NextResponse.json(
      { error: 'Failed to get demand pressure', details: String(error) },
      { status: 500 }
    );
  }
}

function getTrendEmoji(trend: 'rising' | 'stable' | 'falling'): string {
  switch (trend) {
    case 'rising':
      return '📈';
    case 'falling':
      return '📉';
    default:
      return '➡️';
  }
}

function getPressureLevel(
  visitors: number
): 'low' | 'moderate' | 'high' | 'extreme' {
  if (visitors < 10) return 'low';
  if (visitors < 30) return 'moderate';
  if (visitors < 60) return 'high';
  return 'extreme';
}
