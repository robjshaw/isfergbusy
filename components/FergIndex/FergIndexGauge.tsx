'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FergIndexGaugeProps {
  value: number;
  className?: string;
}

// Ferg-style colors
const COLORS = {
  quiet: '#00c0f3', // Ferg cyan
  moderate: '#f0c000', // Yellow
  busy: '#ff6b35', // Orange
  heaving: '#ff3366', // Red/Pink
};

function getColor(v: number) {
  if (v <= 25) return COLORS.quiet;
  if (v <= 50) return COLORS.moderate;
  if (v <= 75) return COLORS.busy;
  return COLORS.heaving;
}

export function FergIndexGauge({ value, className }: FergIndexGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = 85;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;
  const color = getColor(animatedValue);

  return (
    <div className={cn('relative w-48 h-48 md:w-64 md:h-64 mx-auto', className)}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* SVG Gauge */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Outer decorative ring */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1"
        />

        {/* Background track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 360 - 90;
          const radian = (angle * Math.PI) / 180;
          const innerR = radius - 12;
          const outerR = radius - 6;
          return (
            <line
              key={tick}
              x1={100 + innerR * Math.cos(radian)}
              y1={100 + innerR * Math.sin(radian)}
              x2={100 + outerR * Math.cos(radian)}
              y2={100 + outerR * Math.sin(radian)}
              stroke="#3a3a3a"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl md:text-6xl font-bold text-white tabular-nums font-sans"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {Math.round(animatedValue)}
        </motion.span>
        <span
          className="text-[10px] md:text-xs uppercase tracking-[0.2em] mt-1 md:mt-2"
          style={{ color: '#666666' }}
        >
          Ferg Index
        </span>
      </div>
    </div>
  );
}

interface MiniGaugeProps {
  value: number;
  size?: number;
  className?: string;
}

export function MiniGauge({ value, size = 48, className }: MiniGaugeProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const color = getColor(value);

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white tabular-nums"
      >
        {Math.round(value)}
      </span>
    </div>
  );
}
