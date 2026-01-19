import * as cheerio from 'cheerio';

export interface ScraperResult {
  readyOrders: number[];
  capturedAt: Date;
  rawHtml?: string;
}

/**
 * Scrapes the Fergburger order display for ready order numbers.
 *
 * Uses the ferglovesyou.co.nz API endpoint directly, which returns
 * HTML fragments with order numbers in div elements.
 *
 * API: /controller/procesador.php?funcion=ejemplo5&opcion=updateListaOrden&select=tv2
 */
export async function scrapeFergOrders(): Promise<ScraperResult> {
  // Call the API endpoint that returns the order list HTML
  const apiUrl = 'https://ferglovesyou.co.nz/controller/procesador.php';
  const params = new URLSearchParams({
    funcion: 'ejemplo5',
    opcion: 'updateListaOrden',
    select: 'tv2',
    random: Math.random().toString(),
  });

  const response = await fetch(`${apiUrl}?${params}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; IsFergBusy/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const readyOrders: number[] = [];

  // The API returns divs with class "bola5" or "bola6" containing order numbers
  // Structure: <div class="bola5"><div class="text_bola5">325</div></div>
  $('[class*="bola"]').each((_, el) => {
    const text = $(el).text().trim();
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 100 && num < 10000) {
      readyOrders.push(num);
    }
  });

  // Also check for text_bola elements directly
  $('[class*="text_bola"]').each((_, el) => {
    const text = $(el).text().trim();
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 100 && num < 10000) {
      readyOrders.push(num);
    }
  });

  // Fallback: look for any 3-digit numbers in divs
  if (readyOrders.length === 0) {
    $('div').each((_, el) => {
      const text = $(el).text().trim();
      if (/^\d{3}$/.test(text)) {
        const num = parseInt(text, 10);
        if (num >= 100 && num < 1000) {
          readyOrders.push(num);
        }
      }
    });
  }

  // Deduplicate and sort
  const uniqueOrders = [...new Set(readyOrders)].sort((a, b) => a - b);

  return {
    readyOrders: uniqueOrders,
    capturedAt: new Date(),
    rawHtml: html,
  };
}

/**
 * Calculate velocity (orders per hour) based on order number progression.
 *
 * This uses a simple heuristic: the difference between max order numbers
 * over time indicates how many orders have been processed.
 */
export function calculateVelocity(
  currentOrders: number[],
  previousOrders: number[],
  timeDeltaMinutes: number
): number {
  if (currentOrders.length === 0 || previousOrders.length === 0) {
    return 0;
  }

  if (timeDeltaMinutes <= 0) {
    return 0;
  }

  const maxPrevious = Math.max(...previousOrders);
  const maxCurrent = Math.max(...currentOrders);

  // Orders completed = progression of max order number
  // This assumes order numbers increment as orders are placed
  const ordersProgressed = maxCurrent - maxPrevious;

  // If order numbers went down, likely a new day/reset
  if (ordersProgressed <= 0) {
    return 0;
  }

  // Convert to orders per hour
  return (ordersProgressed / timeDeltaMinutes) * 60;
}

/**
 * Alternative velocity calculation using order count changes.
 * This measures how quickly orders cycle through the "ready" display.
 */
export function calculateDisplayVelocity(
  currentOrders: number[],
  previousOrders: number[],
  timeDeltaMinutes: number
): number {
  if (timeDeltaMinutes <= 0) {
    return 0;
  }

  // Find orders that were in previous but not in current (collected)
  const collected = previousOrders.filter(o => !currentOrders.includes(o));

  // Convert to per-hour rate
  return (collected.length / timeDeltaMinutes) * 60;
}

/**
 * Get the order range info from a list of orders.
 */
export function getOrderRangeInfo(orders: number[]): {
  min: number | null;
  max: number | null;
  spread: number;
  count: number;
} {
  if (orders.length === 0) {
    return { min: null, max: null, spread: 0, count: 0 };
  }

  const min = Math.min(...orders);
  const max = Math.max(...orders);

  return {
    min,
    max,
    spread: max - min,
    count: orders.length,
  };
}
