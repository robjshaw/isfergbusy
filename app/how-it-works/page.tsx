import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export const metadata = {
  title: 'How It Works | Is Ferg Busy?',
  description:
    'Learn how we track Fergburger busyness using order velocity and demand pressure.',
};

export default function HowItWorksPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h1>
            <p className="text-[#a0a0a0] text-lg">
              Two signals, one answer
            </p>
          </div>

          <div className="prose">
            <p className="text-xl text-[#a0a0a0] mb-12 text-center">
              We combine two signals to predict how busy Fergburger is right now —
              and whether that&apos;s about to change.
            </p>

            <h2>The Two Signals</h2>

            <Card variant="cyan" className="p-8 my-8">
              <h3 className="text-[#00c0f3] mt-0 font-serif text-xl">
                1. Order Velocity
              </h3>
              <p className="text-[#a0a0a0] uppercase-wide mb-4">
                Lagging Indicator
              </p>
              <p>
                Every 3 minutes, we scrape the{' '}
                <a
                  href="https://ferglovesyou.co.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00c0f3]"
                >
                  ferglovesyou.co.nz
                </a>{' '}
                order display to see which orders are ready for pickup.
              </p>
              <p>
                By tracking how order numbers progress over time, we calculate the{' '}
                <strong>orders per hour</strong> — a direct measure of how many
                burgers they&apos;re pumping out.
              </p>
              <ul>
                <li>High velocity = busy kitchen = long wait times</li>
                <li>Low velocity = quiet period = faster service</li>
              </ul>
            </Card>

            <Card variant="bordered" className="p-8 my-8">
              <h3 className="text-white mt-0 font-serif text-xl">
                2. Demand Pressure
              </h3>
              <p className="text-[#a0a0a0] uppercase-wide mb-4">
                Leading Indicator
              </p>
              <p>
                Here&apos;s the clever bit: we also track how many people are checking
                this website.
              </p>
              <p>
                If 50 people see &quot;Ghost Town&quot; and all head there, it won&apos;t be
                quiet for long! This is the{' '}
                <strong>observer effect</strong> in action.
              </p>
              <ul>
                <li>Many viewers + quiet status = expect a rush</li>
                <li>Few viewers = status is likely stable</li>
              </ul>
            </Card>

            <div className="ferg-divider my-16" />

            <h2>The Ferg Index</h2>

            <p>
              We combine these signals into a single score from 0-100, weighted like
              this:
            </p>

            <Card variant="bordered" className="p-8 my-8 not-prose">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-[40%] h-1 bg-[#00c0f3]" />
                  <span className="text-white font-bold w-12">40%</span>
                  <span className="text-[#a0a0a0]">Current order velocity</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-[30%] h-1 bg-[#00c0f3]/70" />
                  <span className="text-white font-bold w-12">30%</span>
                  <span className="text-[#a0a0a0]">Demand pressure (site visitors)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-[20%] h-1 bg-[#00c0f3]/50" />
                  <span className="text-white font-bold w-12">20%</span>
                  <span className="text-[#a0a0a0]">Historical time-of-day patterns</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-[10%] h-1 bg-[#00c0f3]/30" />
                  <span className="text-white font-bold w-12">10%</span>
                  <span className="text-[#a0a0a0]">Trend direction</span>
                </div>
              </div>
            </Card>

            <h2>Status Levels</h2>

            <div className="grid grid-cols-2 gap-4 my-8 not-prose">
              <Card variant="bordered" className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#00c0f3]" />
                  <div>
                    <div className="font-serif font-bold text-[#00c0f3]">Ghost Town</div>
                    <div className="text-xs text-[#666666] uppercase tracking-wider">Index 0-25</div>
                  </div>
                </div>
              </Card>
              <Card variant="bordered" className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#f0c000]" />
                  <div>
                    <div className="font-serif font-bold text-[#f0c000]">Warming Up</div>
                    <div className="text-xs text-[#666666] uppercase tracking-wider">Index 26-50</div>
                  </div>
                </div>
              </Card>
              <Card variant="bordered" className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#ff6b35]" />
                  <div>
                    <div className="font-serif font-bold text-[#ff6b35]">Busy</div>
                    <div className="text-xs text-[#666666] uppercase tracking-wider">Index 51-75</div>
                  </div>
                </div>
              </Card>
              <Card variant="bordered" className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#ff3366]" />
                  <div>
                    <div className="font-serif font-bold text-[#ff3366]">Absolute Scenes</div>
                    <div className="text-xs text-[#666666] uppercase tracking-wider">Index 76-100</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="ferg-divider my-16" />

            <h2>The Waze Paradox</h2>

            <p>
              You know how Waze sometimes routes everyone through the same &quot;secret&quot;
              shortcut until it&apos;s no longer a shortcut? This is the same thing.
            </p>

            <blockquote>
              The act of checking if somewhere is busy can make it busy.
            </blockquote>

            <p>
              That&apos;s why we show the demand pressure warning when lots of people are
              viewing a quiet status. It&apos;s not just about what&apos;s happening now —
              it&apos;s about what&apos;s about to happen.
            </p>

            <div className="ferg-divider my-16" />

            <h2>Accuracy & Limitations</h2>

            <ul>
              <li>
                <strong>Data freshness:</strong> We scrape every 3 minutes, so
                there&apos;s a small delay
              </li>
              <li>
                <strong>Order display:</strong> We can only see orders currently on
                the ready screen, not the full queue
              </li>
              <li>
                <strong>Historical patterns:</strong> More accurate after we&apos;ve
                collected several weeks of data
              </li>
              <li>
                <strong>Special events:</strong> We don&apos;t account for things like
                Winterfest or cruise ship days
              </li>
            </ul>

            <p>
              This is a fun side project, not a scientific instrument. Use the Ferg
              Index as a guide, not a guarantee!
            </p>

            <div className="text-center mt-16">
              <Link
                href="/how-we-built-this"
                className="btn-ferg btn-ferg-outline inline-block"
              >
                How We Built This →
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
