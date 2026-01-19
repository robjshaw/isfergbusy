'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FergStatus } from '@/lib/fergIndex';

interface StatusBadgeProps {
  status: FergStatus;
  label: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  FergStatus,
  { color: string; bgColor: string; borderColor: string }
> = {
  ghost_town: {
    color: '#00c0f3',
    bgColor: 'rgba(0, 192, 243, 0.1)',
    borderColor: 'rgba(0, 192, 243, 0.3)',
  },
  warming_up: {
    color: '#f0c000',
    bgColor: 'rgba(240, 192, 0, 0.1)',
    borderColor: 'rgba(240, 192, 0, 0.3)',
  },
  busy: {
    color: '#ff6b35',
    bgColor: 'rgba(255, 107, 53, 0.1)',
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  absolute_scenes: {
    color: '#ff3366',
    bgColor: 'rgba(255, 51, 102, 0.1)',
    borderColor: 'rgba(255, 51, 102, 0.3)',
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <motion.div
      className={cn('inline-flex items-center px-6 py-3', className)}
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5 mr-3">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: config.color }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: config.color }}
        />
      </span>

      {/* Label */}
      <span
        className="font-serif text-lg font-bold tracking-wide"
        style={{ color: config.color }}
      >
        {label}
      </span>
    </motion.div>
  );
}

interface StatusDotProps {
  status: FergStatus;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={cn('relative flex h-2.5 w-2.5', className)}>
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: config.color }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ backgroundColor: config.color }}
      />
    </span>
  );
}

interface StatusTextProps {
  status: FergStatus;
  label: string;
  className?: string;
}

export function StatusText({ status, label, className }: StatusTextProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn('font-medium', className)}
      style={{ color: config.color }}
    >
      {label}
    </span>
  );
}
