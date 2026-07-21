import { ColorType, CrosshairMode } from "lightweight-charts";

export const PERIOD_BUTTONS: { value: Period; label: string }[] = [
  { value: "daily", label: "1D" },
  { value: "weekly", label: "1W" },
  { value: "monthly", label: "1M" },
  { value: "three_months", label: "3M" },
  { value: "six_months", label: "6M" },
  { value: "yearly", label: "1Y" },
  { value: "max", label: "Max" },
];

/* NOTE: the tutorial also sets an `interval` per period, but the explicit
   interval param on /coins/{id}/ohlc is paid-plan-only — the demo API returns
   "400 invalid interval parameter" and picks the granularity automatically
   based on `days`, so we omit it. */
export const PERIOD_CONFIG: Record<Period, { days: number | "max" }> = {
  daily: { days: 1 },
  weekly: { days: 7 },
  monthly: { days: 30 },
  three_months: { days: 90 },
  six_months: { days: 180 },
  yearly: { days: 365 },
  max: { days: "max" },
};

export const LIVE_INTERVAL_BUTTONS: { value: "1s" | "1m"; label: string }[] = [
  { value: "1s", label: "1 second" },
  { value: "1m", label: "1 minute" },
];

export const getChartConfig = (height: number, showTime: boolean) => ({
  layout: {
    background: { type: ColorType.Solid, color: "transparent" },
    textColor: "#9b9cb8",
    attributionLogo: false,
  },
  grid: {
    vertLines: { color: "rgba(207, 208, 228, 0.06)" },
    horzLines: { color: "rgba(207, 208, 228, 0.06)" },
  },
  height,
  timeScale: {
    timeVisible: showTime,
    secondsVisible: false,
    borderColor: "rgba(207, 208, 228, 0.1)",
  },
  rightPriceScale: {
    borderColor: "rgba(207, 208, 228, 0.1)",
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
});

export const getCandlestickConfig = () => ({
  upColor: "#22c55e",
  downColor: "#ef4444",
  borderUpColor: "#22c55e",
  borderDownColor: "#ef4444",
  wickUpColor: "#22c55e",
  wickDownColor: "#ef4444",
});
