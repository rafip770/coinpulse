"use client";

import { useState } from "react";
import CoinHeader from "@/components/CoinHeader";
import CandlestickChart from "@/components/CandlestickChart";
import DataTable from "@/components/DataTable";
import { Separator } from "@/components/ui/separator";
import { useCoinGeckoWebSocket } from "@/hooks/useCoinGeckoWebSocket";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";

const tradeColumns: DataTableColumn<Trade>[] = [
  {
    header: "Price",
    cellClassName: "price-cell",
    cell: (trade) => formatCurrency(trade.price),
  },
  {
    header: "Amount",
    cell: (trade) => trade.amount.toLocaleString(),
  },
  {
    header: "Value",
    cellClassName: "price-cell",
    cell: (trade) => formatCurrency(trade.value),
  },
  {
    header: "Buy/Sell",
    cell: (trade) => {
      const isBuy = trade.type.toLowerCase().startsWith("b");

      return (
        <span
          className={cn(
            "font-medium",
            isBuy ? "text-green-500" : "text-red-500",
          )}
        >
          {isBuy ? "Buy" : "Sell"}
        </span>
      );
    },
  },
  {
    header: "Time",
    cellClassName: "text-purple-100/60",
    cell: (trade) => timeAgo(trade.timestamp),
  },
];

const LiveDataWrapper = ({
  coinId,
  poolId,
  coin,
  coinOHLCData,
  children,
}: LiveDataProps) => {
  const [liveInterval, setLiveInterval] = useState<"1s" | "1m">("1s");

  const { price, trades, ohlcvData } = useCoinGeckoWebSocket({
    coinId,
    poolId,
    liveInterval,
  });

  return (
    <section id="live-data-wrapper">
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={price?.usdPrice ?? coin.market_data.current_price.usd}
        livePriceChangePercentage24h={
          price?.change24h ??
          coin.market_data.price_change_percentage_24h_in_currency.usd
        }
        priceChangePercentage30d={
          coin.market_data.price_change_percentage_30d_in_currency.usd
        }
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />

      <Separator className="divider" />

      <div className="trend">
        <CandlestickChart
          coinId={coinId}
          data={coinOHLCData}
          liveOhlcv={ohlcvData}
          mode="live"
          initialPeriod="daily"
          liveInterval={liveInterval}
          setLiveInterval={setLiveInterval}
        >
          <h4>Trend Overview</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />

      {tradeColumns && (
        <div className="trades">
          <h4>Recent Trades</h4>
          <DataTable
            columns={tradeColumns}
            data={trades}
            rowKey={(_, index) => index}
            tableClassName="trades-table"
          />
        </div>
      )}

      <Separator className="divider" />

      {children}
    </section>
  );
};

export default LiveDataWrapper;
