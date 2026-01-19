'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  time: string;
  velocity: number;
  visitors?: number;
}

interface VelocityChartProps {
  data: ChartDataPoint[];
  showVisitors?: boolean;
  className?: string;
  height?: number;
}

export function VelocityChart({
  data,
  showVisitors = true,
  className,
  height = 300,
}: VelocityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-[#111111]',
          className
        )}
        style={{ height }}
      >
        <p className="text-[#666666]">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {/* Ferg cyan gradient */}
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c0f3" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00c0f3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#666666" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#666666" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1a1a1a"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#3a3a3a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1a1a1a' }}
            tick={{ fill: '#666666' }}
          />

          <YAxis
            stroke="#3a3a3a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#666666' }}
            tickFormatter={(value) => `${value}`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#111111',
              border: '1px solid #2a2a2a',
              borderRadius: '0',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#666666', marginBottom: '4px' }}
            itemStyle={{ color: '#fff', padding: '2px 0' }}
          />

          {showVisitors && (
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#3a3a3a"
              strokeWidth={1}
              fill="url(#visitorGradient)"
              name="Visitors"
            />
          )}

          <Area
            type="monotone"
            dataKey="velocity"
            stroke="#00c0f3"
            strokeWidth={2}
            fill="url(#velocityGradient)"
            name="Orders/hr"
          />

          <Line
            type="monotone"
            dataKey="velocity"
            stroke="#00c0f3"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              fill: '#00c0f3',
              stroke: '#0a0a0a',
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#00c0f3',
  className,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
