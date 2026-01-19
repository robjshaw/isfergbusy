'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiveViewerCountProps {
  initialCount?: number;
  className?: string;
}

export function LiveViewerCount({
  initialCount = 0,
  className,
}: LiveViewerCountProps) {
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial count
    fetchViewerCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchViewerCount, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchViewerCount() {
    try {
      const response = await fetch('/api/demand');
      if (response.ok) {
        const data = await response.json();
        setCount(data.activeNow || 0);
      }
    } catch (error) {
      console.error('Failed to fetch viewer count:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className={cn('text-2xl font-bold text-zinc-400', className)}>
        ...
      </div>
    );
  }

  return (
    <motion.div
      className={cn('flex items-center gap-2', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="text-xl">👀</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          className="text-2xl font-bold text-white tabular-nums"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

interface ViewerCountBadgeProps {
  count: number;
  className?: string;
}

export function ViewerCountBadge({ count, className }: ViewerCountBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full',
        'bg-zinc-800 text-zinc-300 text-sm',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>{count} watching</span>
    </div>
  );
}
