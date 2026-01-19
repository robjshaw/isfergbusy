'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  className,
  duration = 0.5,
  decimals = 0,
}: AnimatedNumberProps) {
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (v) => v.toFixed(decimals));
  const [displayValue, setDisplayValue] = useState(value.toFixed(decimals));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {displayValue}
    </motion.span>
  );
}

interface AnimatedCounterProps {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  className,
  suffix,
  prefix,
}: AnimatedCounterProps) {
  const prevValue = useRef(value);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value > prevValue.current) {
      setDirection('up');
    } else if (value < prevValue.current) {
      setDirection('down');
    }
    prevValue.current = value;

    const timer = setTimeout(() => setDirection(null), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <motion.span
      className={cn(
        'inline-flex items-center tabular-nums',
        direction === 'up' && 'text-green-500',
        direction === 'down' && 'text-red-500',
        className
      )}
      animate={{
        scale: direction ? [1, 1.1, 1] : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {prefix}
      <AnimatedNumber value={value} />
      {suffix}
    </motion.span>
  );
}
