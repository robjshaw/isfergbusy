'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OrderBadgeProps {
  orderNumber: number;
  isNew?: boolean;
  className?: string;
}

export function OrderBadge({ orderNumber, isNew, className }: OrderBadgeProps) {
  return (
    <motion.div
      className={cn(
        'relative w-14 h-14 flex items-center justify-center',
        'bg-transparent border border-[#3a3a3a]',
        'text-white font-bold text-lg',
        'transition-all duration-300',
        isNew && 'border-[#00c0f3] shadow-[0_0_20px_rgba(0,192,243,0.3)]',
        className
      )}
      initial={isNew ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{
        borderColor: '#00c0f3',
        boxShadow: '0 0 20px rgba(0, 192, 243, 0.2)',
      }}
    >
      <span className="tabular-nums">{orderNumber}</span>

      {/* Pulse ring for new orders */}
      {isNew && (
        <motion.span
          className="absolute inset-0 border border-[#00c0f3]"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

interface OrderBadgeSmallProps {
  orderNumber: number;
  className?: string;
}

export function OrderBadgeSmall({ orderNumber, className }: OrderBadgeSmallProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-10 h-10',
        'border border-[#3a3a3a] text-white text-sm font-medium tabular-nums',
        'hover:border-[#00c0f3] transition-colors',
        className
      )}
    >
      {orderNumber}
    </span>
  );
}
