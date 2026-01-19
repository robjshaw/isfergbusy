# Deploying IsFergBusy

## Quick Deploy to Railway

### 1. Create a Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Choose "Deploy from GitHub repo"
3. Connect your GitHub account and select this repo

### 2. Add PostgreSQL

1. Click "+ New" in your Railway project
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### 3. Configure Environment Variables

In Railway dashboard, add these variables:

```
# Required
CRON_SECRET=<generate with: openssl rand -hex 32>
NEXT_PUBLIC_URL=https://your-app.railway.app

# Optional - PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=phx_your_server_key
POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=12345
```

### 4. Set Up Cron Job

The scraper needs to run every 3 minutes. Options:

**Option A: Railway Cron (Recommended)**
1. Add a new service in Railway
2. Set it as a cron job with schedule: `*/3 * * * *`
3. Command: `curl -X GET $RAILWAY_STATIC_URL/api/scrape -H "Authorization: Bearer $CRON_SECRET"`

**Option B: External Cron Service**
Use [cron-job.org](https://cron-job.org) or similar:
- URL: `https://your-app.railway.app/api/scrape`
- Method: GET
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Schedule: Every 3 minutes

### 5. Initialize Database

After first deploy, the database tables are created automatically via `prisma db push`.

### 6. Verify Deployment

1. Visit your Railway URL - you should see the dashboard
2. Check `/api/scrape` returns order data
3. Wait for a few scrape cycles to see data populate

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npm run postinstall

# Start dev server
npm run dev

# Test scraper
npm run scrape  # (requires dev server running)
```

## Database Commands

```bash
# Push schema to database
npm run db:push

# Deploy migrations (production)
npm run db:migrate

# Open Prisma Studio (visual database editor)
npm run db:studio
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/scrape` | Scrape orders (requires CRON_SECRET) |
| `GET /api/index` | Get current Ferg Index |
| `GET /api/stats` | Get order statistics |
| `GET /api/stats/chart` | Get chart data for last 24h |
| `GET /api/demand` | Get demand pressure data |

## Architecture

```
┌─────────────────┐    ┌──────────────────┐
│ ferglovesyou.nz │───▶│   /api/scrape    │
└─────────────────┘    │   (every 3 min)  │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   PostgreSQL     │
                       │  OrderSnapshot   │
                       │  HourlyStat      │
                       │  DemandSnapshot  │
                       │  FergIndexSnap   │
                       └────────┬─────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  /api/index   │     │   /api/stats    │     │  /api/demand    │
│  Ferg Index   │     │   Charts/Data   │     │   Visitors      │
└───────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                       ┌──────────────────┐
                       │   Next.js App    │
                       │   React UI       │
                       └──────────────────┘
```
