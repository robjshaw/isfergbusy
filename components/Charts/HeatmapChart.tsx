'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatHour, getDayName } from '@/lib/utils';

interface HeatmapData {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  className?: string;
}

export function HeatmapChart({ data, className }: HeatmapChartProps) {
  const days = [0, 1, 2, 3, 4, 5, 6];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create a lookup map
  const valueMap = new Map<string, number>();
  let maxValue = 0;

  data.forEach(({ day, hour, value }) => {
    valueMap.set(`${day}-${hour}`, value);
    maxValue = Math.max(maxValue, value);
  });

  const getColor = (value: number) => {
    if (maxValue === 0) return 'bg-[#1a1a1a]';

    const intensity = value / maxValue;
    if (intensity < 0.2) return 'bg-[#1a1a1a]';
    if (intensity < 0.4) return 'bg-[#00c0f3]/20';
    if (intensity < 0.6) return 'bg-[#f0c000]/30';
    if (intensity < 0.8) return 'bg-[#ff6b35]/40';
    return 'bg-[#ff3366]/50';
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex mb-2">
          <div className="w-16" /> {/* Spacer for day labels */}
          {hours.filter((h) => h % 3 === 0).map((hour) => (
            <div
              key={hour}
              className="flex-1 text-center text-xs text-[#666666]"
              style={{ marginLeft: hour === 0 ? 0 : -10 }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Grid */}
        {days.map((day) => (
          <div key={day} className="flex items-center mb-1">
            <div className="w-16 text-xs text-[#666666] pr-2 text-right">
              {getDayName(day).slice(0, 3)}
            </div>
            <div className="flex-1 flex gap-0.5">
              {hours.map((hour) => {
                const value = valueMap.get(`${day}-${hour}`) || 0;

                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    className={cn(
                      'flex-1 h-6 cursor-pointer',
                      'transition-colors hover:ring-1 hover:ring-[#00c0f3]/50',
                      getColor(value)
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: (day * 24 + hour) * 0.002,
                    }}
                    title={`${getDayName(day)} ${formatHour(hour)}: ${value.toFixed(1)} orders/hr`}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-[#666666]">
          <span>Quiet</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 bg-[#1a1a1a]" />
            <div className="w-4 h-4 bg-[#00c0f3]/20" />
            <div className="w-4 h-4 bg-[#f0c000]/30" />
            <div className="w-4 h-4 bg-[#ff6b35]/40" />
            <div className="w-4 h-4 bg-[#ff3366]/50" />
          </div>
          <span>Busy</span>
        </div>
      </div>
    </div>
  );
}

interface MiniHeatmapProps {
  todayData: number[]; // 24 values for each hour
  currentHour: number;
  className?: string;
}

export function MiniHeatmap({
  todayData,
  currentHour,
  className,
}: MiniHeatmapProps) {
  const maxValue = Math.max(...todayData, 1);

  return (
    <div className={cn('flex gap-0.5', className)}>
      {todayData.map((value, hour) => (
        <div
          key={hour}
          className={cn(
            'flex-1 h-3',
            hour === currentHour && 'ring-1 ring-[#00c0f3]',
            value / maxValue < 0.2 && 'bg-[#1a1a1a]',
            value / maxValue >= 0.2 && value / maxValue < 0.5 && 'bg-[#f0c000]/30',
            value / maxValue >= 0.5 && value / maxValue < 0.8 && 'bg-[#ff6b35]/40',
            value / maxValue >= 0.8 && 'bg-[#ff3366]/50'
          )}
          title={`${formatHour(hour)}: ${value.toFixed(1)} orders/hr`}
        />
      ))}
    </div>
  );
}
