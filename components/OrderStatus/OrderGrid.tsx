'use client';

import { motion } from 'framer-motion';
import { OrderBadge } from './OrderBadge';
import { cn } from '@/lib/utils';

interface OrderGridProps {
  orders: number[];
  previousOrders?: number[];
  className?: string;
  maxDisplay?: number;
}

export function OrderGrid({
  orders,
  previousOrders = [],
  className,
  maxDisplay = 20,
}: OrderGridProps) {
  // Limit display
  const displayOrders = orders.slice(0, maxDisplay);
  const hasMore = orders.length > maxDisplay;

  // Determine which orders are new
  const newOrders = new Set(
    orders.filter((o) => !previousOrders.includes(o))
  );

  if (orders.length === 0) {
    return (
      <div className={cn('text-center py-8 text-zinc-500', className)}>
        <p className="text-lg">No orders displayed</p>
        <p className="text-sm mt-1">The screen might be empty or we couldn&apos;t scrape it</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.div
        className="flex flex-wrap gap-3 justify-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {displayOrders.map((order, index) => (
          <motion.div
            key={order}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
          >
            <OrderBadge
              orderNumber={order}
              isNew={newOrders.has(order)}
            />
          </motion.div>
        ))}
      </motion.div>

      {hasMore && (
        <p className="text-center text-zinc-500 text-sm mt-4">
          +{orders.length - maxDisplay} more orders
        </p>
      )}
    </div>
  );
}

interface OrderRangeProps {
  min: number | null;
  max: number | null;
  className?: string;
}

export function OrderRange({ min, max, className }: OrderRangeProps) {
  if (min === null || max === null) {
    return (
      <span className={cn('text-zinc-500', className)}>No data</span>
    );
  }

  return (
    <span className={cn('text-zinc-300', className)}>
      <span className="text-white font-medium">{min}</span>
      <span className="mx-2">—</span>
      <span className="text-white font-medium">{max}</span>
    </span>
  );
}
