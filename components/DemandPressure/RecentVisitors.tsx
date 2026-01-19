'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RecentVisitorsProps {
  count: number;
  trend: 'rising' | 'stable' | 'falling';
  className?: string;
}

export function RecentVisitors({ count, trend, className }: RecentVisitorsProps) {
  const trendEmoji = {
    rising: '📈',
    stable: '➡️',
    falling: '📉',
  };

  const trendColor = {
    rising: 'text-red-400',
    stable: 'text-zinc-400',
    falling: 'text-green-400',
  };

  return (
    <motion.div
      className={cn('space-y-1', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-white tabular-nums">
          {count}
        </span>
        <span className={cn('text-sm', trendColor[trend])}>
          {trendEmoji[trend]}
        </span>
      </div>
      <p className="text-zinc-400 text-sm">people in last 30 mins</p>
    </motion.div>
  );
}

interface DemandBarProps {
  visitors: number;
  maxVisitors?: number;
  className?: string;
}

export function DemandBar({
  visitors,
  maxVisitors = 100,
  className,
}: DemandBarProps) {
  const percentage = Math.min(100, (visitors / maxVisitors) * 100);

  const getColor = (pct: number) => {
    if (pct < 25) return 'bg-green-500';
    if (pct < 50) return 'bg-yellow-500';
    if (pct < 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Demand Pressure</span>
        <span className="text-white font-medium">{visitors} visitors</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', getColor(percentage))}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
