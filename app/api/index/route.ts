import { NextResponse } from 'next/server';
import {
  calculateFergIndex,
  saveFergIndexSnapshot,
  getMockFergIndex,
} from '@/lib/fergIndex';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Get the current Ferg Index
 */
export async function GET() {
  try {
    // Try to calculate real index
    let result = await calculateFergIndex();

    // If no real data, use mock data
    if (result.meta.currentVelocity === 0 && result.meta.visitorCount === 0) {
      // Check if we have any snapshots at all
      const useMock = process.env.NODE_ENV === 'development';
      if (useMock) {
        result = getMockFergIndex();
      }
    }

    // Save snapshot for historical tracking
    await saveFergIndexSnapshot(result);

    return NextResponse.json({
      index: result.index,
      status: result.status,
      label: result.label,
      emoji: result.emoji,
      confidence: result.confidence,
      components: result.components,
      demandWarning: result.demandWarning,
      currentVelocity: result.meta.currentVelocity,
      visitorCount: result.meta.visitorCount,
      lastUpdated: result.meta.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error('Failed to calculate Ferg Index:', error);

    // Return mock data on error in development
    if (process.env.NODE_ENV === 'development') {
      const mock = getMockFergIndex();
      return NextResponse.json({
        index: mock.index,
        status: mock.status,
        label: mock.label,
        emoji: mock.emoji,
        confidence: mock.confidence,
        components: mock.components,
        demandWarning: mock.demandWarning,
        currentVelocity: mock.meta.currentVelocity,
        visitorCount: mock.meta.visitorCount,
        lastUpdated: mock.meta.lastUpdated.toISOString(),
        _mock: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to calculate Ferg Index', details: String(error) },
      { status: 500 }
    );
  }
}
