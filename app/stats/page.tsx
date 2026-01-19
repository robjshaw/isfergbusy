'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { VelocityChart } from '@/components/Charts/VelocityChart';
import { HeatmapChart } from '@/components/Charts/HeatmapChart';
import { Skeleton } from '@/components/ui/Skeleton';

interface ChartData {
  raw: { time: string; velocity: number; visitors?: number }[];
  hourly: { hour: string; avgVelocity: number; maxVelocity: number; avgVisitors: number; samples: number }[];
  totalSnapshots: number;
}

export default function StatsPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats/chart')
      .then((res) => res.json())
      .then((data) => {
        setChartData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load chart data:', error);
        setIsLoading(false);
      });
  }, []);

  // Generate mock heatmap data for now (until we have enough historical data)
  const generateMockHeatmapData = () => {
    const data = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Simulate typical patterns
        let value = 0;
        if (hour >= 11 && hour <= 14) value = 8 + Math.random() * 8; // Lunch
        if (hour >= 17 && hour <= 21) value = 12 + Math.random() * 10; // Dinner
        if (hour >= 21 && hour <= 23) value = 5 + Math.random() * 8; // Late night
        if (day === 5 || day === 6) value *= 1.3; // Weekend boost

        data.push({ day, hour, value });
      }
    }
    return data;
  };

  const heatmapData = generateMockHeatmapData();

  return (
    <div className="py-16 md:py-24">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Statistics
          </h1>
          <p className="text-[#a0a0a0] text-lg">
            Historical patterns and trends for Fergburger busyness
          </p>
        </div>

        {/* 24 Hour Chart */}
        <Card variant="bordered" className="mb-8 p-8">
          <h2 className="text-xl font-serif font-bold text-white mb-6">Last 24 Hours</h2>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData?.raw && chartData.raw.length > 0 ? (
            <VelocityChart data={chartData.raw} height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#666666]">
              No data collected yet. Check back after a few hours.
            </div>
          )}
        </Card>

        {/* Hourly Breakdown */}
        <Card variant="bordered" className="mb-8 p-8">
          <h2 className="text-xl font-serif font-bold text-white mb-6">Hourly Averages</h2>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : chartData?.hourly && chartData.hourly.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="text-left py-3 px-4 text-[#666666] uppercase tracking-wider text-xs">Hour</th>
                    <th className="text-right py-3 px-4 text-[#666666] uppercase tracking-wider text-xs">Avg Velocity</th>
                    <th className="text-right py-3 px-4 text-[#666666] uppercase tracking-wider text-xs">Peak</th>
                    <th className="text-right py-3 px-4 text-[#666666] uppercase tracking-wider text-xs">Visitors</th>
                    <th className="text-right py-3 px-4 text-[#666666] uppercase tracking-wider text-xs">Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.hourly.map((row) => (
                    <tr key={row.hour} className="border-b border-[#1a1a1a]">
                      <td className="py-3 px-4 text-white font-medium">{row.hour}:00</td>
                      <td className="text-right py-3 px-4 text-[#00c0f3] font-medium">
                        {row.avgVelocity.toFixed(1)}
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {row.maxVelocity.toFixed(1)}
                      </td>
                      <td className="text-right py-3 px-4 text-[#a0a0a0]">
                        {row.avgVisitors}
                      </td>
                      <td className="text-right py-3 px-4 text-[#666666]">
                        {row.samples}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[#666666]">
              No hourly data available yet.
            </div>
          )}
        </Card>

        {/* Weekly Heatmap */}
        <Card variant="bordered" className="mb-8 p-8">
          <h2 className="text-xl font-serif font-bold text-white mb-2">Weekly Patterns</h2>
          <p className="text-sm text-[#666666] mb-6">
            Average busyness by hour and day of week (simulated until we collect more data)
          </p>
          <HeatmapChart data={heatmapData} />
        </Card>

        {/* Best Times */}
        <Card variant="bordered" className="mb-8 p-8">
          <h2 className="text-xl font-serif font-bold text-white mb-6">Best Times to Visit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#00c0f3]/5 p-6 border border-[#00c0f3]/30">
              <h3 className="text-[#00c0f3] font-serif font-bold mb-3">Quietest</h3>
              <ul className="text-sm text-[#a0a0a0] space-y-2">
                <li>Weekday mornings (before 11am)</li>
                <li>Tuesday/Wednesday afternoons</li>
                <li>Late night (after 10pm)</li>
              </ul>
            </div>
            <div className="bg-[#f0c000]/5 p-6 border border-[#f0c000]/30">
              <h3 className="text-[#f0c000] font-serif font-bold mb-3">Moderate</h3>
              <ul className="text-sm text-[#a0a0a0] space-y-2">
                <li>Weekday lunches (12-2pm)</li>
                <li>Early evening (5-6pm)</li>
                <li>Sunday afternoons</li>
              </ul>
            </div>
            <div className="bg-[#ff3366]/5 p-6 border border-[#ff3366]/30">
              <h3 className="text-[#ff3366] font-serif font-bold mb-3">Avoid</h3>
              <ul className="text-sm text-[#a0a0a0] space-y-2">
                <li>Friday/Saturday nights</li>
                <li>Weekend lunches</li>
                <li>Public holidays</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-[#666666] mt-6">
            * These are general patterns. Always check the live Ferg Index for current conditions.
          </p>
        </Card>

        {/* Data Info */}
        <Card variant="bordered" className="p-8">
          <h2 className="text-xl font-serif font-bold text-white mb-6">About This Data</h2>
          <div className="text-sm text-[#a0a0a0] space-y-3">
            <p>
              <strong className="text-white">Collection:</strong> We scrape
              ferglovesyou.co.nz every 3 minutes to capture order numbers.
            </p>
            <p>
              <strong className="text-white">Velocity:</strong> Calculated from
              the progression of order numbers over time.
            </p>
            <p>
              <strong className="text-white">Visitors:</strong> Tracked via
              PostHog analytics on this website.
            </p>
            <p>
              <strong className="text-white">Snapshots:</strong>{' '}
              {chartData?.totalSnapshots
                ? `${chartData.totalSnapshots} captures in the last 24 hours`
                : 'Loading...'}
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
