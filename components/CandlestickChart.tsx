"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { fetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";
import {
  getCandlestickConfig,
  getChartConfig,
  LIVE_INTERVAL_BUTTONS,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from "@/constants";

const toSeconds = (data: OHLCData[]): OHLCData[] =>
  data.map(
    (item) =>
      [
        Math.floor(item[0] / 1000),
        item[1],
        item[2],
        item[3],
        item[4],
      ] as OHLCData,
  );

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily",
  liveOhlcv = null,
  mode = "historical",
  liveInterval,
  setLiveInterval,
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  /* cancels stale period fetches so an older response can't overwrite a newer one */
  const abortControllerRef = useRef<AbortController | null>(null);
  /* tracks the data length so we only refit the view when the data set changes,
     not on every live candle update */
  const prevOhlcDataLength = useRef<number>(data?.length || 0);

  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [isPending, startTransition] = useTransition();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const { days } = PERIOD_CONFIG[selectedPeriod];

      const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
        vs_currency: "usd",
        days,
        precision: "full",
      });

      if (controller.signal.aborted) return;

      startTransition(() => {
        setOhlcData(newData ?? []);
      });
    } catch (error) {
      if (!controller.signal.aborted)
        console.error("Failed to fetch OHLC data:", error);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;

    startTransition(async () => {
      setPeriod(newPeriod);
      await fetchOHLCData(newPeriod);
    });
  };

  /* create the chart instance (re-created when the height or period changes —
     the period drives the time-label visibility) */
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ["daily", "weekly", "monthly"].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });

    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());
    series.setData(convertOHLCData(toSeconds(ohlcData)));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, period]);

  /* feed new (historical or live) data into the existing chart */
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = toSeconds(ohlcData);

    let merged: OHLCData[];

    if (mode === "live" && liveOhlcv) {
      const liveTimestamp = liveOhlcv[0];
      const lastHistoricalCandle =
        convertedToSeconds[convertedToSeconds.length - 1];

      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
        /* still within the same time bucket — update the last candle */
        merged = [...convertedToSeconds.slice(0, -1), liveOhlcv];
      } else {
        /* a new time bucket started — append a new candle */
        merged = [...convertedToSeconds, liveOhlcv];
      }
    } else {
      merged = convertedToSeconds;
    }

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged);

    candleSeriesRef.current.setData(converted);

    /* refit only when the data set changes (period switch), not on live ticks */
    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

    if (dataChanged || mode === "historical") {
      chartRef.current?.timeScale().fitContent();
    }

    prevOhlcDataLength.current = ohlcData.length;
  }, [ohlcData, period, liveOhlcv, mode]);

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>

        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50">
            Period
          </span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={value === period ? "config-btn-active" : "config-btn"}
              onClick={() => handlePeriodChange(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>

        {liveInterval && (
          <div className="button-group">
            <span className="text-sm mx-2 font-medium text-purple-100/50">
              Update frequency
            </span>
            {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                className={
                  value === liveInterval ? "config-btn-active" : "config-btn"
                }
                onClick={() => setLiveInterval && setLiveInterval(value)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  );
};

export default CandlestickChart;
