'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface VelocityDisplayProps {
  velocity: number;
  className?: string;
}

export function VelocityDisplay({ velocity, className }: VelocityDisplayProps) {
  const getIntensity = (v: number) => {
    if (v < 5) return { label: 'Slow', color: 'text-green-400' };
    if (v < 12) return { label: 'Moderate', color: 'text-yellow-400' };
    if (v < 20) return { label: 'Fast', color: 'text-orange-400' };
    return { label: 'Blazing', color: 'text-red-400' };
  };

  const intensity = getIntensity(velocity);

  return (
    <motion.div
      className={cn('text-center', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-baseline justify-center gap-1">
        <AnimatedNumber
          value={velocity}
          decimals={0}
          className={cn('text-4xl font-bold', intensity.color)}
        />
        <span className="text-zinc-400 text-lg">/hr</span>
      </div>
      <p className={cn('text-sm mt-1', intensity.color)}>{intensity.label}</p>
    </motion.div>
  );
}

interface VelocityCompactProps {
  velocity: number;
  className?: string;
}

export function VelocityCompact({ velocity, className }: VelocityCompactProps) {
  return (
    <div className={cn('flex items-baseline gap-1', className)}>
      <span className="text-2xl font-bold text-orange-500">
        {Math.round(velocity)}
      </span>
      <span className="text-zinc-400 text-sm">orders/hr</span>
    </div>
  );
}

interface VelocityTrendProps {
  current: number;
  previous: number;
  className?: string;
}

export function VelocityTrend({
  current,
  previous,
  className,
}: VelocityTrendProps) {
  const diff = current - previous;
  const percentChange = previous > 0 ? (diff / previous) * 100 : 0;

  const isUp = diff > 0;
  const isSignificant = Math.abs(percentChange) > 10;

  if (!isSignificant) {
    return (
      <span className={cn('text-zinc-500 text-sm', className)}>
        ➡️ Stable
      </span>
    );
  }

  return (
    <motion.span
      className={cn(
        'text-sm font-medium',
        isUp ? 'text-red-400' : 'text-green-400',
        className
      )}
      initial={{ opacity: 0, x: isUp ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {isUp ? '📈' : '📉'}{' '}
      {isUp ? '+' : ''}
      {Math.round(percentChange)}%
    </motion.span>
  );
}
