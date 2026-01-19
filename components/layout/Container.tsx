'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
};

export function Container({
  children,
  className,
  size = 'md',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4',
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
    </div>
  );
}
