'use client';

import { ButtonHTMLAttributes, forwardRef, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    { className, variant = 'primary', size = 'md', children, onClick, ...props },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const nextId = useRef(0);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple: Ripple = {
          id: nextId.current++,
          x,
          y,
        };

        setRipples((prev) => [...prev, ripple]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
        }, 600);

        onClick?.(e);
      },
      [onClick]
    );

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      primary:
        'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25',
      secondary:
        'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700',
      ghost: 'bg-transparent hover:bg-zinc-800/50 text-zinc-300',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg font-medium transition-colors duration-200',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none"
              initial={{
                width: 0,
                height: 0,
                x: ripple.x,
                y: ripple.y,
                opacity: 0.5,
              }}
              animate={{
                width: 300,
                height: 300,
                x: ripple.x - 150,
                y: ripple.y - 150,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

RippleButton.displayName = 'RippleButton';
