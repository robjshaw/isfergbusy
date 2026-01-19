'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glass-heavy' | 'glass-cyan' | 'bordered' | 'cyan';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#111111] border border-[#2a2a2a]',
      glass: 'glass',
      'glass-heavy': 'glass-heavy',
      'glass-cyan': 'glass-cyan',
      bordered: 'bg-transparent border border-[#2a2a2a]',
      cyan: 'bg-[#111111] border border-[#00c0f3]/30',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl md:rounded-none',
          variants[variant],
          hover && 'transition-all duration-300 hover:border-[#00c0f3]/50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-xl font-serif font-bold text-white tracking-tight',
          className
        )}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('p-6', className)} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, subValue, accent, className }: StatCardProps) {
  return (
    <Card variant="glass" className={cn('p-4 md:p-6', className)}>
      <div className="space-y-1 md:space-y-2">
        <p className="uppercase-wide text-[#666666] text-[9px] md:text-xs">{label}</p>
        <p
          className={cn(
            'text-2xl md:text-3xl font-bold tabular-nums',
            accent ? 'text-[#00c0f3]' : 'text-white'
          )}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-xs md:text-sm text-[#666666]">{subValue}</p>
        )}
      </div>
    </Card>
  );
}
