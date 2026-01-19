'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DemandWarningProps {
  message: string;
  severity?: 'warning' | 'alert';
  className?: string;
}

export function DemandWarning({
  message,
  severity = 'warning',
  className,
}: DemandWarningProps) {
  const styles = {
    warning: {
      border: 'border-[#f0c000]/30',
      bg: 'bg-[#f0c000]/5',
      text: 'text-[#f0c000]',
    },
    alert: {
      border: 'border-[#ff3366]/30',
      bg: 'bg-[#ff3366]/5',
      text: 'text-[#ff3366]',
    },
  };

  const style = styles[severity];

  return (
    <motion.div
      className={cn(
        'border p-4',
        style.border,
        style.bg,
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className={cn('text-sm font-medium', style.text)}>
        {message}
      </p>
    </motion.div>
  );
}

interface ObserverEffectBannerProps {
  visitorCount: number;
  fergIndex: number;
  className?: string;
}

export function ObserverEffectBanner({
  visitorCount,
  fergIndex,
  className,
}: ObserverEffectBannerProps) {
  if (fergIndex > 50 || visitorCount < 30) {
    return null;
  }

  const severity = visitorCount > 50 ? 'alert' : 'warning';
  const message =
    visitorCount > 50
      ? `${visitorCount} people just saw "quiet" — it won't stay quiet!`
      : `${visitorCount} people checked recently — the queue may grow`;

  return <DemandWarning message={message} severity={severity} className={className} />;
}
