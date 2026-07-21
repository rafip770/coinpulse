# CoinPulse — Build Plan (JS Mastery tutorial, step by step)

Source: JS Mastery "crypto screener" tutorial transcript (CoinGecko API + Next.js).
This file is the handoff document: **any session/model continuing this build must
read this file first, do the next unchecked step, and check it off + append to the
Session Log at the bottom.**

## Ground rules

- Project root: `/Users/rafi/WebstormProjects/coinpulse` — Rafi's own WebStorm scaffold
  (the Downloads duplicate was deleted). Next.js 16.2.10 app router, TS, Tailwind v4, npm.
- Next 16 has breaking changes vs training data — check `node_modules/next/dist/docs/`
  when an API misbehaves (per the scaffold's AGENTS.md).
- Follow the tutorial exactly: same branch names, same commit messages, same file names.
- GitHub: authenticated as `rafip770` via `gh`. Repo: `rafip770/coinpulse` (created in Step 2).
- The tutorial's "video kit" downloads (globals.css, types.d.ts, constants.ts, utils.ts,
  getPools, trade columns, all-coins v1) are NOT available — author equivalents from what
  the transcript dictates. Keep the exact class/type/function names the transcript uses.
- CodeRabbit: cannot create the account/connect the app (user action). Instead, after each
  PR, apply the exact fixes the video's CodeRabbit found (listed per step below).
- CoinGecko API key: **obtained** — Rafi supplied a DEMO key (in `.env.local`). Demo keys
  require `https://api.coingecko.com/api/v3` + `x-cg-demo-api-key` header (NOT the
  tutorial's pro-api URL/header). Rate limit ~30 req/min — keep revalidate values as
  scripted to stay under it.
- WebSocket (Analyst plan) may be unavailable on the user's key — build the hook exactly
  as scripted regardless; UI must fall back to fetched data when the socket can't connect.
- IDE steps (WebStorm, Junie, plugins, settings) are IDE-local: replicate their _outputs_
  (dummy data, format utils, ESLint/Prettier config, skeleton fallbacks) in code.

## Steps

### ✅ Step 0 — Scaffold

`npx create-next-app@latest coinpulse` (TS, ESLint, Tailwind, app router, no src dir,
`@/*` alias, npm). Done — git repo auto-initialized.

### ✅ Step 1 — Shadcn init + hello page + metadata

- shadcn CLI ≥4.13 dropped the base-color flag/flow, so `components.json` (new-york,
  baseColor neutral, cssVariables) + `lib/utils.ts` (cn) were written by hand — identical
  output to the tutorial's `init`; deps installed: clsx, tailwind-merge,
  class-variance-authority, lucide-react, tw-animate-css, query-string.
  `npx shadcn@latest add <component>` works from here.
- `app/page.tsx` → RAFCE-style component returning `<p className="text-3xl text-indigo-500">CoinPulse</p>`.
- `app/layout.tsx` metadata: title `CoinPulse`, description
  `Crypto screener app with a built-in high-frequency terminal and dashboard`.
- Verify dev server renders it.

### ✅ Step 2 — GitHub repo + first commit

- `gh repo create coinpulse --public --source . ` equivalent of the tutorial's manual flow:
  `git add . && git commit -m "first commit" && git branch -M main && git remote add origin … && git push -u origin main`.
- CodeRabbit connect = user action; note it and move on.

### ✅ Step 3 — Navigation (branch `feat-navigation`)

- `git checkout -b feat-navigation`.
- Author `app/globals.css`: full dark theme (dark app bg, white primary text, purple-100
  secondary text `#…/50` usage, green accent) + Tailwind v4 `@theme` tokens for
  `dark-400`, `dark-500`, `purple-100`, plus utility classes used later:
  `main-container`, `inner`, `nav-link`, `is-active`, `is-home`, `home-grid`,
  `#coin-overview` (+ `.header`, `.info`), `#trending-coins`, `custom-scrollbar`,
  `#categories`, `.name-cell`, `.price-cell`, `.change-cell`, `.top-gainers-cell`,
  `.market-cap-cell`, `.volume-cell`, `.change-header-cell`, `.category-cell`,
  `chart-header`, `button-group`, `config-btn`, `config-btn-active`, `.chart`,
  `#coins-pagination` (+ `.pagination-content`, `.pagination-pages`, `.pagination-control`,
  `.prev`, `.next`, `.control-disabled`, `.control-btn`, `.page-link`, `.page-link-active`,
  `.ellipsis`), `#coin-details-page` (+ `.primary`, `.secondary`, `.details`,
  `.details-grid`, `.label`, `.link`), `#live-data-wrapper` (+ `.divider`, `.trend`,
  `.trades`, `.trades-table`), `#coin-header` (+ `.info`, `.price-row`, `.badge`,
  `.badge-up`, `.badge-down`, `.stats`, `.value`), `#converter` (+ `.panel`,
  `.input-wrapper`, `.input`, `.coin-info`, `.divider`, `.line`, `.icon`,
  `.output-wrapper`, `.select-trigger`, `.select-value`, `.select-content`, `.select-item`),
  skeleton/fallback classes `#coin-overview-fallback`, `#trending-coins-fallback`,
  `#categories-fallback`, `.page` (coin details outer padding), `#search-modal` styles.
- Assets: author `public/logo.svg` (CoinPulse wordmark) and `public/converter.svg`
  (exchange arrows icon); delete default public assets.
- `components/Header.tsx`: `"use client"`, semantic `<header>` > `div.main-container.inner`,
  logo `<Link href="/"><Image src="/logo.svg" width=132 height=40/></Link>`, `<nav>` with
  Home link (`cn("nav-link", {"is-active": pathname==="/", "is-home": true})`),
  `<p>Search modal</p>` placeholder, All Coins link to `/coins` (is-active on `/coins`).
  Uses `usePathname` from `next/navigation`, `cn` from `@/lib/utils`.
- `app/layout.tsx`: render `<Header/>` above children; add `className="dark"` to `<html>`.
- `app/page.tsx` → empty div for now.
- Commit `implement navigation`, push, open PR (`gh pr create`).
- CodeRabbit fix from video: logo `src` must start with `/`. (We write it correctly from
  the start, but keep the commit `fix coderabbit suggestion` if any fix is applicable.)
- Merge PR.

### ✅ Step 4 — CoinGecko API setup (done early — key obtained from user)

- `.env.local` written with Rafi's demo key: `COINGECKO_API_KEY`,
  `NEXT_PUBLIC_COINGECKO_API_KEY`, `COINGECKO_BASE_URL=https://api.coingecko.com/api/v3`,
  `NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL=wss://stream.coingecko.com/v1`.
- Fetcher (Step 6) must send `x-cg-demo-api-key` (demo header), not the pro header.

### ✅ Step 5 — Homepage layout + DataTable + types (still on a feature branch;

tutorial stayed on `feat-navigation` — do the same)

- `app/page.tsx`: `<main className="main-container">` > `<section className="home-grid">`
  with coin-overview and trending-coins slots + full-width `<section className="w-full mt-7 space-y-4">` for categories.
- Static coin overview markup (Bitcoin img from assets.coingecko.com, name/BTC, price).
- `next.config.ts`: `images.remotePatterns` for `assets.coingecko.com`.
- `npx shadcn@latest add table`; `components/DataTable.tsx` generic reusable table with
  props: `columns`, `data`, `rowKey`, `tableClassName`, `headerRowClassName`,
  `headerCellClassName`, `bodyRowClassName`, `bodyCellClassName`; generic `<T>`;
  per-column `cellClassName` applied in body cells and header cells; exact class strings
  from transcript (`bg-dark-400 text-purple-100 py-4`, first `pl-5`, last `pr-5`,
  row `overflow-hidden rounded-lg border-b border-purple-100/5 hover:bg-dark-400/30 relative`, etc.).
- `types.d.ts` in root: `DataTableProps<T>`, `DataTableColumn<T>`, `TrendingCoin`,
  `CoinDetailsData`, `OHLCData`, `Category`, `CoinMarketData`, `QueryParams`,
  `CoinGeckoErrorBody`, `PaginationProps`, `Trade`, `ExtendedPriceData`,
  `WebSocketMessage`, `UseCoinGeckoWebSocketProps/Return`, `LiveDataProps`,
  `LiveCoinHeaderProps`, `ConverterProps`, `CandlestickChartProps`, `PoolData`,
  `NextPageProps`, `Period` — authored to match transcript usage.
- Trending-coins columns on homepage (name w/ link+image, 24h change w/ trending icons
  from `lucide-react` + abs/toFixed, price) + local dummy `TrendingCoin[]` wired into the
  table (the Junie step).

### ✅ Step 6 — Fetcher + real data + Suspense (commit

`implement coin overview and trending coins ui and functionality using the fetcher utility function`)

- `npm i query-string`.
- `lib/coingecko.actions.ts`: `"use server"`; BASE_URL/API_KEY from env with throw-on-missing;
  `export async function fetcher<T>(endpoint, params?, revalidate=60): Promise<T>` using
  `qs.stringifyUrl` (skipEmptyString, skipNull), headers `x-cg-pro-api-key` (or demo
  header) + `Content-Type: application/json`, `next: { revalidate }`, error body parse +
  `throw new Error(\`API Error: \${status} …\`)`.
- `components/home/CoinOverview.tsx` (server): fetch `/coins/bitcoin`
  (`dex_pair_format: "symbol"`) — render img/name/symbol/price with `formatCurrency`.
- `components/home/TrendingCoins.tsx` (server): fetch `/search/trending`
  (revalidate 300), columns moved here, `trendingCoins.coins.slice(0,6)`, table with
  `headerCellClassName="py-3"`, `bodyCellClassName="py-2"`.
- `lib/utils.ts`: add `formatCurrency`, `formatPercentage`, `getTrendingClasses`,
  `timeAgo`, `convertOHLCData` (authored; convertOHLCData maps `[ts,o,h,l,c]` →
  lightweight-charts candle objects, dedup/sort by time).
- `app/page.tsx`: `<Suspense fallback>` around each; `components/home/fallback.tsx`
  with `CoinOverviewFallback`, `TrendingCoinsFallback` skeletons matching CSS ids.
- ESLint+Prettier: add `prettier`, `eslint-config-prettier`, `.prettierrc`, wire into
  eslint config; run format.
- next.config: add `coin-images.coingecko.com` remote pattern.
- Commit, push, PR. Apply video's CodeRabbit fixes: try/catch around fetches in
  CoinOverview + TrendingCoins (extract var above try, return fallback div on error);
  fix duplicate `#trending-coins` id (h4 + div structure). Commit
  `fix coderabbit critical issues`, merge PR.

### ✅ Step 7 — Candlestick chart (branch `feat-candlestick-chart`)

- `npm install --save lightweight-charts`.
- `constants.ts` in root: `PERIOD_BUTTONS` (1D,1W,1M,3M,6M,1Y,Max → daily…max),
  `PERIOD_CONFIG` (days+interval per period), `LIVE_INTERVAL_BUTTONS` (1s/1m),
  `getChartConfig(height, showTime)` + `getCandlestickConfig()` (dark theme colors).
- `components/CandlestickChart.tsx` (`"use client"`): props `{children, data, coinId,
height=360, initialPeriod="daily", liveOhlcv=null, mode="historical", liveInterval,
setLiveInterval}`; refs chartContainerRef/chartRef(IChartApi)/candleSeriesRef
  (ISeriesApi<"Candlestick">)/prevOhlcDataLength; state ohlcData/period; `useTransition`;
  `fetchOHLCData(selectedPeriod)` via fetcher `/coins/{coinId}/ohlc` with PERIOD_CONFIG;
  `handlePeriodChange` with startTransition; chart-create useEffect (deps [height, period]
  per CodeRabbit fix) with createChart, addSeries(CandlestickSeries), setData(convert with
  ms→s conversion — CodeRabbit consistency fix), fitContent, ResizeObserver
  (applyOptions width), cleanup (disconnect, chart.remove, null refs); data useEffect
  (deps [ohlcData, period, liveOhlcv, mode]) with convertedToSeconds map, live merge
  logic (same-timestamp replace last candle else append; sort asc), setData, fitContent
  only when `dataChanged || mode==="historical"`; period buttons UI + (live mode only)
  update-frequency buttons; `disabled={isPending}` (CodeRabbit fix — no isLoading state);
  abort-controller ref canceling in-flight period fetches (CodeRabbit race fix).
- `components/home/CoinOverview.tsx`: `Promise.all([fetcher coin, fetcher bitcoin OHLC
(vs_currency usd, days 1, interval hourly, precision full)])` — no redundant inner
  awaits (CodeRabbit fix); return chart with children markup inside try; catch → fallback.
- Commit `implement candlestick chart`, push, PR, apply fixes, commit
  `implement fixes suggested by coderabbit`, merge; `git checkout main && git pull`.

### ✅ Step 8 — Top categories + All Coins (branch `feat-top-categories`)

- `components/home/Categories.tsx` (server): fetcher `/coins/categories` → `Category[]`;
  columns: name, top 3 gainers (images 28px), 24h change (trending icons +
  formatPercentage), market cap (formatCurrency), 24h volume; DataTable slice(0,10),
  rowKey index, `tableClassName="mt-3"`; used in `app/page.tsx` inside Suspense with
  `CategoriesFallback` skeleton (add to fallback.tsx).
- Fix DataTable to actually apply headerCellClassName/bodyCellClassName + per-column
  head/cell class names (the bug found in the video).
- `app/coins/page.tsx` (server): fetcher `/coins/markets` (vs_currency usd, order,
  per_page 10, page from `searchParams`, price_change_percentage 24h); columns: rank,
  coin (image+name+symbol link), price, 24h change, market cap; DataTable + pagination.
- `npx shadcn@latest add pagination`; `components/CoinsPagination.tsx` (`"use client"`):
  props `{currentPage, totalPages, hasMorePages}`; useRouter push `/coins?page=N`;
  `buildPageNumbers(current,total)` helper (windowed pages + "ellipsis" entries);
  estimatedTotalPages sliding-window math (`current>=100 ? ceil(current/100)*100+100 : 100`);
  prev/next controls with disabled states; keys by index (video fix for duplicate
  ellipsis keys).
- Commit `implement categories and all coins tables`, push, PR; video review = minor only
  (0% change edge case → neutral handling optional; alt text) — merge.
- `git checkout main && git pull`, then `git checkout -b feat-coin-details`.

### ✅ Step 9 — WebSocket hook + coin details page (branch `feat-coin-details`)

- `hooks/useCoinGeckoWebSocket.ts`: exactly per transcript — refs wsRef/subscribed(Set);
  states price/trades/ohlcv/isWsReady; WS_BASE from env + `?x_cg_pro_api_key=`;
  connect useEffect (send helper, handleMessage: ping→pong, confirm_subscription→add
  channel, `c==="c1"`→setPrice mapping (usdPrice p, coin i, price p, change24h pp,
  marketCap m, volume24h v, timestamp t), `c==="g2"`→newTrade {price pu, value vo,
  timestamp t, type ty, amount t} prepend slice(0,7), `ch==="g3"`→candle
  [t, o,h,l,c] Number()-wrapped → setOhlcvData); onopen/onmessage/onclose/onerror
  (CodeRabbit fix) + cleanup ws.close; subscribe useEffect (deps coinId, poolId,
  isWsReady, liveInterval): unsubscribeAll/subscribe helpers, queueMicrotask resets,
  subscribe `cg_simple_price` {coin_id:[coinId], action:"set_tokens"}, poolAddress =
  `(poolId ?? "").replace("_", ":")` (CodeRabbit null fix), subscribe `onchain_trade`
  - `onchain_ohlcv` {network_id, pool_addresses, action:"set_pools", interval};
    return {price, trades, ohlcvData, isConnected}.
- `lib/coingecko.actions.ts`: add `getPools({id, network, contractAddress})` — fallback
  PoolData; if network+contract → onchain pools endpoint (wrapped in try/catch —
  CodeRabbit consistency fix) else `/onchain/search/pools?query=id`; return first pool.
- `app/coins/[id]/page.tsx`: params await; `Promise.all` coin data (`/coins/{id}`,
  dex_pair_format contract_address) + OHLC (`/coins/{id}/ohlc`, usd, 1d, hourly, full);
  platform/network/contractAddress derivation; `getPools`; JSX: `<main id="coin-details-page"
className="page">` > section.primary (LiveDataWrapper w/ children ExchangeListings) +
  section.secondary (Converter, details grid from coinDetails array — market cap, rank,
  total volume, website/explorer/community links w/ ArrowUpRight, TopGainersLosers).
- `npx shadcn@latest add separator badge select input`.
- `components/LiveDataWrapper.tsx` (`"use client"`): liveInterval state ("1s"|"1m");
  hook call; CoinHeader (live price/changes with fallbacks — 24h fallback uses the 24h
  field, CodeRabbit fix); Separator; CandlestickChart (mode live, data coinOHLCData,
  liveOhlcv, initialPeriod daily, liveInterval + setter, children h4 Trend Overview);
  Separator; trades DataTable (trade columns: price, amount, value, buy/sell type
  colored, timeAgo) `tableClassName="trades-table"`.
- `components/CoinHeader.tsx`: stats array (Today %, 30 days %, 24h price change $ w/
  showIcon false + parenthesized nested ternary — CodeRabbit icon fix); badge up/down,
  formatted live price, image 77px.
- `components/Converter.tsx` (`"use client"`): currency/amount state, convertedPrice,
  input panel + divider (line + `/converter.svg` icon) + output + shadcn Select of
  `Object.keys(priceList)`.
- Commit `implement coin details real time page`, push, PR, apply the five CodeRabbit
  fixes, commit `implement coderabbit suggested fixes`, merge, checkout main, pull.

### ✅ Step 10 — Exchange listings + Top gainers/losers (the "on your own" features;

user said don't skip)

- `components/ExchangeListings.tsx` (server): fetcher `/coins/{id}/tickers` → DataTable
  (exchange name+logo, pair, price, volume, trust score) under h4 "Exchange Listings",
  rendered as LiveDataWrapper children.
- `components/TopGainersLosers.tsx` (server): fetcher `/coins/top_gainers_losers`
  (falls back to `/coins/markets` sorted by 24h change if endpoint unavailable on plan);
  two mini tables side by side.
- Wire into coin details page; Suspense + fallbacks; commit + PR + merge
  (branch `feat-exchange-listings`).

### ⬜ Step 11 — Search modal (Cmd/Ctrl+K global search; the "active lesson" challenge)

- Branch `feat-search-modal`. `npx shadcn@latest add dialog command` (cmdk).
- `components/SearchModal.tsx` (`"use client"`): global keydown listener for ⌘K/CtrlK;
  debounced query → fetcher `/search` (client route or server action); results list
  (coin thumb, name, symbol, rank) → navigate to `/coins/{id}`; trending shown when
  query empty (reuse `/search/trending`). Replace the `<p>Search modal</p>` placeholder
  in Header with the trigger. Commit + PR + merge.

### ⬜ Step 12 — Pre-deploy fixes + Vercel deploy **[BLOCKER: Vercel login]**

- Fix the console error the video hits on coin click (guard in websocket hook).
- `next.config.ts`: `typescript: { ignoreBuildErrors: true }` (as the tutorial does) —
  but first run `npm run build` and fix real type errors properly if quick.
- Commit `small fix`, push.
- Deploy: `npm i -g vercel` then `vercel login` (USER ACTION) → `vercel --prod` with the
  env vars from `.env.local`. If user prefers dashboard: import repo at vercel.com,
  paste env vars, deploy.
- Verify production URL renders home, /coins, coin details, search.

## Session Log

- **2026-07-20 (Fable, session 1):** Step 0 done (scaffold). Plan authored. GitHub auth
  confirmed (`rafip770`). Vercel CLI absent. CoinGecko key not yet provided.

- **2026-07-20 (Fable, session 1, cont.):** Steps 2,3,5,6 done. Repo
  https://github.com/rafip770/coinpulse — PR #1 (navigation) + PR #2 (overview/trending)
  merged. Real demo-API data verified in browser (BTC price + 6 trending coins).
  Deviations: shadcn CLI changed (components.json hand-written); Turbopack root pinned in
  next.config.ts (stray ~/package-lock.json broke Tailwind); `react-hooks/error-boundaries`
  downgraded to warn (video keeps the try/catch JSX pattern). Dev server via Claude
  preview on port 3000. Now on branch feat-candlestick-chart starting Step 7.
