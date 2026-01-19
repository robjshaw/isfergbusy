import { scrapeFergOrders, getOrderRangeInfo } from '../lib/scraper';

async function testScraper() {
  console.log('Testing Fergburger Order Scraper');
  console.log('================================\n');

  try {
    console.log('Fetching orders from ferglovesyou.co.nz API...\n');

    const result = await scrapeFergOrders();

    console.log('Captured at:', result.capturedAt.toISOString());
    console.log('Orders found:', result.readyOrders.length);
    console.log('Order numbers:', result.readyOrders.join(', ') || '(none)');

    if (result.readyOrders.length > 0) {
      const rangeInfo = getOrderRangeInfo(result.readyOrders);
      console.log('\nOrder Range Info:');
      console.log('  Min:', rangeInfo.min);
      console.log('  Max:', rangeInfo.max);
      console.log('  Spread:', rangeInfo.spread);
      console.log('  Count:', rangeInfo.count);
    }

    console.log('\n--- Raw HTML Response ---');
    console.log(result.rawHtml?.slice(0, 500) || '(empty)');

    console.log('\n=== SCRAPER TEST PASSED ===');
  } catch (error) {
    console.error('Scraper test failed:', error);
    process.exit(1);
  }
}

testScraper();
