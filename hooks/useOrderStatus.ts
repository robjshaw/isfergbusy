'use client';

import useSWR from 'swr';

interface OrderStatsData {
  readyOrders: number[];
  orderCount: number;
  velocity: number;
  avgVelocity: number;
  completedLastHour: number;
  minOrder: number | null;
  maxOrder: number | null;
  lastUpdated: string;
  lastUpdatedAt: string;
  snapshotsLastHour: number;
}

const fetcher = async (url: string): Promise<OrderStatsData> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch order status');
  }
  return res.json();
};

export function useOrderStatus(refreshInterval = 60000) {
  const { data, error, isLoading, mutate } = useSWR<OrderStatsData>(
    '/api/stats',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    readyOrders: data?.readyOrders ?? [],
    orderCount: data?.orderCount ?? 0,
    velocity: data?.velocity ?? 0,
    avgVelocity: data?.avgVelocity ?? 0,
    completedLastHour: data?.completedLastHour ?? 0,
    minOrder: data?.minOrder ?? null,
    maxOrder: data?.maxOrder ?? null,
    lastUpdated: data?.lastUpdated ?? 'never',
    lastUpdatedAt: data?.lastUpdatedAt,
    snapshotsLastHour: data?.snapshotsLastHour ?? 0,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
