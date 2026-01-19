import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'How We Built This | Is Ferg Busy?',
  description: 'The tech stack and build log for IsFergBusy.co.nz',
};

export default function HowWeBuiltThisPage() {
  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              How We Built This
            </h1>
            <p className="text-[#a0a0a0] text-lg">
              The tech behind the obsession
            </p>
          </div>

          <div className="prose">
            <p className="text-xl text-[#a0a0a0] mb-12 text-center">
              A deliberately over-engineered side project answering the eternal
              question: &quot;Is Ferg busy?&quot;
            </p>

            <h2>Tech Stack</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 not-prose">
              <Card variant="bordered" className="p-6">
                <h3 className="text-lg font-serif font-bold text-[#00c0f3] mb-3">Frontend</h3>
                <ul className="text-sm text-[#a0a0a0] space-y-2">
                  <li>Next.js 14+ with App Router</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Framer Motion for animations</li>
                  <li>Recharts for data viz</li>
                  <li>SWR for data fetching</li>
                </ul>
              </Card>

              <Card variant="bordered" className="p-6">
                <h3 className="text-lg font-serif font-bold text-[#00c0f3] mb-3">Backend</h3>
                <ul className="text-sm text-[#a0a0a0] space-y-2">
                  <li>Next.js API Routes</li>
                  <li>Prisma ORM</li>
                  <li>PostgreSQL (Railway)</li>
                  <li>Cheerio for HTML parsing</li>
                </ul>
              </Card>

              <Card variant="bordered" className="p-6">
                <h3 className="text-lg font-serif font-bold text-[#00c0f3] mb-3">Analytics</h3>
                <ul className="text-sm text-[#a0a0a0] space-y-2">
                  <li>PostHog for visitor tracking</li>
                  <li>HogQL for demand pressure queries</li>
                </ul>
              </Card>

              <Card variant="bordered" className="p-6">
                <h3 className="text-lg font-serif font-bold text-[#00c0f3] mb-3">Infrastructure</h3>
                <ul className="text-sm text-[#a0a0a0] space-y-2">
                  <li>Railway for hosting</li>
                  <li>Railway cron for scraping</li>
                  <li>Vercel (optional)</li>
                </ul>
              </Card>
            </div>

            <div className="ferg-divider my-16" />

            <h2>The Scraper</h2>

            <p>
              Every 3 minutes, a cron job hits our <code>/api/scrape</code> endpoint
              which:
            </p>

            <ol>
              <li>Fetches the ferglovesyou.co.nz order display page</li>
              <li>Parses the HTML to extract order numbers</li>
              <li>Calculates velocity based on order number progression</li>
              <li>Stores the snapshot in PostgreSQL</li>
              <li>Updates hourly aggregations</li>
            </ol>

            <Card variant="bordered" className="p-6 my-8 not-prose">
              <pre className="text-sm text-[#a0a0a0] overflow-x-auto">
                <code>{`// Simplified scraper logic
export async function scrapeFergOrders() {
  const response = await fetch('https://ferglovesyou.co.nz');
  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract order numbers from the display
  const readyOrders: number[] = [];

  $('[class*="order"]').each((_, el) => {
    const num = parseInt($(el).text().trim(), 10);
    if (num >= 100 && num < 1000) {
      readyOrders.push(num);
    }
  });

  return { readyOrders, capturedAt: new Date() };
}`}</code>
              </pre>
            </Card>

            <h2>The Ferg Index Algorithm</h2>

            <p>The index combines four weighted components:</p>

            <Card variant="cyan" className="p-6 my-8 not-prose">
              <pre className="text-sm text-white overflow-x-auto">
                <code>{`const index = Math.round(
  (velocityScore * 0.4) +    // Current throughput
  (demandScore * 0.3) +      // Site visitor pressure
  (historicalScore * 0.2) +  // Time-of-day patterns
  (trendScore * 0.1)         // Direction of change
);`}</code>
              </pre>
            </Card>

            <div className="ferg-divider my-16" />

            <h2>Demand Pressure Tracking</h2>

            <p>
              We use PostHog to track visitors and query their API to get real-time
              visitor counts:
            </p>

            <Card variant="bordered" className="p-6 my-8 not-prose">
              <pre className="text-sm text-[#a0a0a0] overflow-x-auto">
                <code>{`// Query PostHog for unique visitors
const query = \`
  SELECT count(DISTINCT person_id) as unique_visitors
  FROM events
  WHERE event = '$pageview'
  AND timestamp > now() - INTERVAL 30 MINUTE
\`;`}</code>
              </pre>
            </Card>

            <h2>Database Schema</h2>

            <p>We store several types of data:</p>

            <ul>
              <li>
                <strong>OrderSnapshot:</strong> Raw scraper captures every 3 minutes
              </li>
              <li>
                <strong>HourlyStat:</strong> Aggregated hourly statistics
              </li>
              <li>
                <strong>DemandSnapshot:</strong> Periodic visitor count captures
              </li>
              <li>
                <strong>FergIndexSnapshot:</strong> Historical index values
              </li>
            </ul>

            <div className="ferg-divider my-16" />

            <h2>Deployment on Railway</h2>

            <p>The project runs on Railway with:</p>

            <ol>
              <li>A web service running the Next.js app</li>
              <li>A PostgreSQL database</li>
              <li>
                A cron job that runs <code>curl /api/scrape</code> every 3 minutes
              </li>
            </ol>

            <Card variant="bordered" className="p-6 my-8 not-prose">
              <pre className="text-sm text-[#a0a0a0] overflow-x-auto">
                <code>{`# Railway cron configuration
# Schedule: */3 * * * * (every 3 minutes)
curl -X GET https://isfergbusy.co.nz/api/scrape \\
  -H "Authorization: Bearer \${CRON_SECRET}"`}</code>
              </pre>
            </Card>

            <div className="ferg-divider my-16" />

            <h2>Challenges</h2>

            <h3>Dynamic Content</h3>
            <p>
              The ferglovesyou.co.nz page loads order numbers via JavaScript. Our
              scraper handles this by looking for data in script tags and using
              multiple parsing strategies.
            </p>

            <h3>Observer Effect</h3>
            <p>
              The very existence of this tool could change behavior! We try to
              account for this by showing demand pressure warnings and factoring
              visitor count into the index.
            </p>

            <h3>NZ Timezone</h3>
            <p>
              All timestamps need to be in NZ time (NZST/NZDT) for patterns to make
              sense. We handle this throughout the codebase.
            </p>

            <div className="ferg-divider my-16" />

            <h2>Future Ideas</h2>

            <ul>
              <li>Push notifications when it gets quiet</li>
              <li>Historical pattern analysis and predictions</li>
              <li>Mobile app</li>
              <li>Integration with wait time at the door (computer vision?)</li>
              <li>Multi-location support (Ferg Baker, Mrs Ferg, etc.)</li>
            </ul>

            <h2>Open Source</h2>

            <p>
              This project is open source! Check out the code on GitHub and feel
              free to contribute or fork it for your own favorite busy restaurant.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
