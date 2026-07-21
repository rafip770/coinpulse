import Image from "next/image";
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import { CoinOverviewFallback } from "@/components/home/fallback";
import CandlestickChart from "@/components/CandlestickChart";

const CoinOverview = async () => {
  try {
    const [coin, coinOhlcData] = await Promise.all([
      fetcher<CoinDetailsData>("/coins/bitcoin", { dex_pair_format: "symbol" }),
      fetcher<OHLCData[]>("/coins/bitcoin/ohlc", {
        vs_currency: "usd",
        days: 1,
        precision: "full",
      }),
    ]);

    return (
      <div id="coin-overview">
        <CandlestickChart data={coinOhlcData} coinId="bitcoin">
          <div className="header">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={56}
              height={56}
            />
            <div className="info pt-2">
              <p>
                {coin.name} {coin.symbol.toUpperCase()}
              </p>
              <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch coin overview:", error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
