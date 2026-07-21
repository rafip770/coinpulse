import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CandlestickData, UTCTimestamp } from "lightweight-charts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* Formats a number as a currency value, e.g. 89123.4 -> "$89,123.40".
   Pass showSymbol = false to get the formatted number without the symbol. */
export const formatCurrency = (
  value: number | null | undefined,
  currency = "usd",
  showSymbol = true,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";

  const maximumFractionDigits = Math.abs(value) >= 1 ? 2 : 8;

  if (!showSymbol) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(
      value,
    );
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(
      value,
    );
  }
};

/* Formats a percentage value, keeping its sign, e.g. -1.126 -> "-1.13%". */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";

  return `${value.toFixed(2)}%`;
};

/* Returns the text color classes for a positive/negative change value. */
export const getTrendingClasses = (value: number) =>
  value > 0 ? "text-green-500" : "text-red-500";

/* Relative time, e.g. "12s ago", "3m ago", "2h ago". */
export const timeAgo = (timestamp: number | null | undefined): string => {
  if (!timestamp) return "-";

  /* accept both seconds and milliseconds */
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const seconds = Math.max(0, Math.floor((Date.now() - ms) / 1000));

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
};

/* Converts CoinGecko OHLC tuples ([timestamp, open, high, low, close], with the
   timestamp already in SECONDS) into the candlestick objects that
   lightweight-charts accepts: deduped by time (last one wins) and sorted
   ascending, since the chart requires strictly increasing times. */
export const convertOHLCData = (
  data: OHLCData[],
): CandlestickData<UTCTimestamp>[] => {
  const byTime = new Map<number, CandlestickData<UTCTimestamp>>();

  for (const [timestamp, open, high, low, close] of data) {
    /* defensively normalize millisecond timestamps to seconds */
    const time = (
      timestamp > 1e12 ? Math.floor(timestamp / 1000) : timestamp
    ) as UTCTimestamp;

    byTime.set(time, { time, open, high, low, close });
  }

  return [...byTime.values()].sort((a, b) => a.time - b.time);
};
