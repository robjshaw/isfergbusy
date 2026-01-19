'use client';

import useSWR from 'swr';

interface DemandData {
  activeNow: number;
  last30Minutes: number;
  last60Minutes: number;
  trend: 'rising' | 'stable' | 'falling';
  trendEmoji: string;
  pressureLevel: 'low' | 'moderate' | 'high' | 'extreme';
}

const fetcher = async (url: string): Promise<DemandData> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch demand data');
  }
  return res.json();
};

export function useLiveViewers(refreshInterval = 30000) {
  const { data, error, isLoading, mutate } = useSWR<DemandData>(
    '/api/demand',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    activeNow: data?.activeNow ?? 0,
    last30Minutes: data?.last30Minutes ?? 0,
    last60Minutes: data?.last60Minutes ?? 0,
    trend: data?.trend ?? 'stable',
    trendEmoji: data?.trendEmoji ?? '➡️',
    pressureLevel: data?.pressureLevel ?? 'low',
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
