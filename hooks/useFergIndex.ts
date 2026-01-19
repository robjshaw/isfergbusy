'use client';

import useSWR from 'swr';
import type { FergStatus } from '@/lib/fergIndex';

interface FergIndexData {
  index: number;
  status: FergStatus;
  label: string;
  emoji: string;
  confidence: number;
  components: {
    velocity: number;
    demand: number;
    historical: number;
    trend: number;
  };
  demandWarning: string | null;
  currentVelocity: number;
  visitorCount: number;
  lastUpdated: string;
  _mock?: boolean;
}

const fetcher = async (url: string): Promise<FergIndexData> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch Ferg Index');
  }
  return res.json();
};

export function useFergIndex(refreshInterval = 60000) {
  const { data, error, isLoading, mutate } = useSWR<FergIndexData>(
    '/api/index',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
    isMock: data?._mock || false,
  };
}
