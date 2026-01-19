'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Card, StatCard } from '@/components/ui/Card';
import { FergIndexGauge } from '@/components/FergIndex/FergIndexGauge';
import { StatusBadge } from '@/components/FergIndex/StatusBadge';
import { ConfidenceIndicator } from '@/components/FergIndex/ConfidenceIndicator';
import { DemandWarning } from '@/components/DemandPressure/DemandWarning';
import { OrderGrid } from '@/components/OrderStatus/OrderGrid';
import { VelocityChart } from '@/components/Charts/VelocityChart';
import { SkeletonGauge, Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';

import { useFergIndex } from '@/hooks/useFergIndex';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { useLiveViewers } from '@/hooks/useLiveViewers';

export default function HomePage() {
  const { data: indexData, isLoading: indexLoading, isMock } = useFergIndex();
  const {
    readyOrders,
    velocity,
    completedLastHour,
    lastUpdated,
    isLoading: statsLoading,
  } = useOrderStatus();
  const { activeNow, last30Minutes } = useLiveViewers();

  const [chartData, setChartData] = useState<{
    raw: { time: string; velocity: number; visitors?: number }[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/stats/chart')
      .then((res) => res.json())
      .then(setChartData)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-10 md:py-24 px-4 md:px-0">
        <Container>
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-4xl md:text-7xl font-bold text-white mb-3 md:mb-4">
              Is Ferg Busy?
            </h1>
            <p className="text-[#666666] text-base md:text-lg max-w-md mx-auto">
              Real-time intelligence for Queenstown&apos;s legendary burger joint
            </p>
            {isMock && (
              <p className="text-xs text-[#00c0f3] mt-3 md:mt-4 uppercase tracking-wider">
                Demo Mode — No Database Connected
              </p>
            )}
          </motion.div>

          {/* Main Index Display */}
          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="glass" className="p-6 md:p-12">
              <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                {indexLoading ? (
                  <SkeletonGauge />
                ) : (
                  <>
                    <FergIndexGauge value={indexData?.index || 0} />

                    <StatusBadge
                      status={indexData?.status || 'ghost_town'}
                      label={indexData?.label || 'Unknown'}
                    />

                    {indexData?.demandWarning && (
                      <DemandWarning
                        message={indexData.demandWarning}
                        severity={indexData.index < 30 ? 'alert' : 'warning'}
                        className="rounded-xl"
                      />
                    )}

                    <ConfidenceIndicator
                      confidence={indexData?.confidence || 0.5}
                      className="w-full max-w-xs"
                    />
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Divider */}
      <div className="ferg-divider" />

      {/* Stats Section */}
      <section className="py-10 md:py-16 px-4 md:px-0">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center">
              Live Statistics
            </h2>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <StatCard
                label="Watching Now"
                value={activeNow || '—'}
                accent
                className="p-4 md:p-6"
              />
              <StatCard
                label="Orders/Hour"
                value={statsLoading ? '—' : Math.round(velocity || 0)}
                accent
                className="p-4 md:p-6"
              />
              <StatCard
                label="Completed (1hr)"
                value={statsLoading ? '—' : completedLastHour || 0}
                className="p-4 md:p-6"
              />
              <StatCard
                label="Last Updated"
                value={lastUpdated || 'Never'}
                className="p-4 md:p-6"
              />
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Orders Section */}
      <section className="py-10 md:py-16 bg-[#0d0d0d] px-4 md:px-0">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-white">
                Orders Ready
              </h2>
              <span className="uppercase-wide text-[#666666] text-[10px] md:text-xs">
                Now serving
              </span>
            </div>

            <Card variant="glass" className="p-4 md:p-8">
              {statsLoading ? (
                <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-xl" />
                  ))}
                </div>
              ) : (
                <OrderGrid orders={readyOrders} />
              )}
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Chart Section */}
      <section className="py-10 md:py-16 px-4 md:px-0">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-white">
                24-Hour Trend
              </h2>
              <Link
                href="/stats"
                className="uppercase-wide text-[#00c0f3] hover:text-white transition-colors text-[10px] md:text-xs"
              >
                View All →
              </Link>
            </div>

            <Card variant="glass" className="p-4 md:p-6 overflow-hidden">
              {chartData?.raw && chartData.raw.length > 0 ? (
                <VelocityChart data={chartData.raw} height={280} />
              ) : (
                <div className="h-[280px] flex items-center justify-center text-[#666666]">
                  {chartData?.raw?.length === 0
                    ? 'No data collected yet'
                    : 'Loading chart...'}
                </div>
              )}
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#0d0d0d] px-4 md:px-0">
        <Container>
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
              How Does This Work?
            </h2>
            <p className="text-[#a0a0a0] mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              We track order velocity and site visitors to predict busyness.
              The Ferg Index combines real-time data with historical patterns
              to give you the full picture.
            </p>
            <Link
              href="/how-it-works"
              className="btn-ferg btn-ferg-outline inline-block"
            >
              Learn More
            </Link>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
