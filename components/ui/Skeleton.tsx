'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#1a1a1a]',
        className
      )}
    />
  );
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-32', className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-12 w-12 rounded-full', className)} />;
}

export function SkeletonGauge({ className }: SkeletonProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <Skeleton className="h-48 w-48 rounded-full" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
