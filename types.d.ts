/* ------------------------------------------------------------------ */
/* Global type declarations for CoinPulse (authored to match the       */
/* tutorial's video-kit types.d.ts based on how each type is used).    */
/* ------------------------------------------------------------------ */

type ReactNode = import("react").ReactNode;

type Period =
  | "daily"
  | "weekly"
  | "monthly"
  | "three_months"
  | "six_months"
  | "yearly"
  | "max";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface CoinGeckoErrorBody {
  error?: string;
  status?: {
    error_code: number;
    error_message: string;
  };
}

/* ---------------------------- Data table --------------------------- */

interface DataTableColumn<T> {
  header: ReactNode;
  headClassName?: string;
  cellClassName?: string | ((row: T) => string);
  cell: (row: T, rowIndex: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, rowIndex: number) => string | number;
  tableClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
}

/* ------------------------- Trending search ------------------------- */

interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
    data: {
      price: number;
      price_btc: string;
      price_change_percentage_24h: Record<string, number>;
      market_cap: string;
      market_cap_btc: string;
      total_volume: string;
      total_volume_btc: string;
      sparkline: string;
      content: { title: string; description: string } | null;
    };
  };
}

interface TrendingCoins {
  coins: TrendingCoin[];
}

/* --------------------------- Coin details -------------------------- */

interface CoinDetailsData {
  id: string;
  symbol: string;
  name: string;
  web_slug: string;
  asset_platform_id: string | null;
  detail_platforms: Record<
    string,
    {
      decimal_place: number | null;
      contract_address: string;
      geckoterminal_url?: string;
    }
  >;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    price_change_percentage_24h_in_currency: Record<string, number>;
    price_change_percentage_30d_in_currency: Record<string, number>;
    price_change_24h_in_currency: Record<string, number>;
    price_change_percentage_24h: number;
    price_change_percentage_30d: number;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    subreddit_url: string | null;
  };
  tickers?: CoinTicker[];
}

interface CoinTicker {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    logo?: string;
  };
  last: number;
  volume: number;
  trust_score: string | null;
  converted_last: Record<string, number>;
  converted_volume: Record<string, number>;
  trade_url: string | null;
}

/* [timestamp, open, high, low, close] */
type OHLCData = [number, number, number, number, number];

/* --------------------------- Categories ---------------------------- */

interface Category {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  content: string | null;
  top_3_coins_id: string[];
  top_3_coins: string[];
  volume_24h: number;
  updated_at: string;
}

/* --------------------------- Coins markets ------------------------- */

interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  atl: number;
  last_updated: string;
}

/* --------------------------- Pagination ----------------------------- */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasMorePages: boolean;
}

/* ------------------------------ Pools ------------------------------- */

interface PoolData {
  id: string;
  address: string;
  name: string;
  network: string;
}

/* ---------------------------- WebSocket ----------------------------- */

interface Trade {
  price: number;
  value: number;
  timestamp: number;
  type: string;
  amount: number;
}

interface ExtendedPriceData {
  usdPrice: number;
  coin: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  timestamp: number;
}

interface WebSocketMessage {
  type?: string;
  identifier?: string;
  /* channel markers */
  c?: string;
  ch?: string;
  /* cg_simple_price payload */
  i?: string;
  p?: number;
  pp?: number;
  m?: number;
  v?: number;
  t?: number;
  /* onchain_trade payload */
  pu?: number;
  vo?: number;
  ty?: string;
  a?: number;
  /* onchain_ohlcv payload */
  o?: number;
  h?: number;
  l?: number;
}

interface UseCoinGeckoWebSocketProps {
  coinId: string;
  poolId?: string;
  liveInterval?: "1s" | "1m";
}

interface UseCoinGeckoWebSocketReturn {
  price: ExtendedPriceData | null;
  trades: Trade[];
  ohlcvData: OHLCData | null;
  isConnected: boolean;
}

/* ------------------------- Component props -------------------------- */

interface CandlestickChartProps {
  children?: ReactNode;
  data: OHLCData[];
  coinId: string;
  height?: number;
  initialPeriod?: Period;
  liveOhlcv?: OHLCData | null;
  mode?: "historical" | "live";
  liveInterval?: "1s" | "1m";
  setLiveInterval?: (interval: "1s" | "1m") => void;
}

interface LiveDataProps {
  coinId: string;
  poolId: string;
  coin: CoinDetailsData;
  coinOHLCData: OHLCData[];
  children?: ReactNode;
}

interface LiveCoinHeaderProps {
  name: string;
  image: string;
  livePrice: number;
  livePriceChangePercentage24h: number;
  priceChangePercentage30d: number;
  priceChange24h: number;
}

interface ConverterProps {
  symbol: string;
  icon: string;
  priceList: Record<string, number>;
}

interface NextPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/* --------------------------- Onchain pools -------------------------- */

interface OnchainPoolsResponse {
  data: {
    id: string;
    attributes: {
      address: string;
      name: string;
    };
  }[];
}
