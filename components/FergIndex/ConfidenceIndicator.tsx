'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  confidence: number; // 0-1
  className?: string;
  showLabel?: boolean;
}

export function ConfidenceIndicator({
  confidence,
  className,
  showLabel = true,
}: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);

  const getLabel = (conf: number) => {
    if (conf >= 0.8) return 'High confidence';
    if (conf >= 0.5) return 'Moderate confidence';
    return 'Low confidence';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs uppercase tracking-wider">
          <span className="text-[#666666]">{getLabel(confidence)}</span>
          <span className="text-[#666666]">{percentage}%</span>
        </div>
      )}
      <div className="h-px bg-[#1a1a1a] overflow-hidden">
        <motion.div
          className="h-full bg-[#00c0f3]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs uppercase tracking-wider',
        'border border-[#2a2a2a] text-[#666666]',
        className
      )}
    >
      {percentage}% confidence
    </span>
  );
}
