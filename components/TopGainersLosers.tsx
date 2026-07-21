import Link from "next/link";
import Image from "next/image";
import DataTable from "@/components/DataTable";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

/* NOTE: the final app uses /coins/top_gainers_losers, which is a paid-plan
   endpoint — on the demo plan we derive the same lists from /coins/markets. */

const columns: DataTableColumn<CoinMarketData>[] = [
  {
    header: "Coin",
    cellClassName: "name-cell",
    cell: (coin) => (
      <Link href={`/coins/${coin.id}`} className="name-cell">
        <Image src={coin.image} alt={coin.name} width={20} height={20} />
        <span className="uppercase">{coin.symbol}</span>
      </Link>
    ),
  },
  {
    header: "Price",
    cellClassName: "price-cell",
    cell: (coin) => formatCurrency(coin.current_price),
  },
  {
    header: "24h",
    cell: (coin) => (
      <span
        className={cn(
          "font-medium",
          coin.price_change_percentage_24h > 0
            ? "text-green-500"
            : "text-red-500",
        )}
      >
        {formatPercentage(coin.price_change_percentage_24h)}
      </span>
    ),
  },
];

const TopGainersLosers = async () => {
  let coins: CoinMarketData[];

  try {
    coins = await fetcher<CoinMarketData[]>(
      "/coins/markets",
      {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 250,
        price_change_percentage: "24h",
      },
      300,
    );
  } catch (error) {
    console.error("Failed to fetch top gainers and losers:", error);
    return null;
  }

  const sorted = [...coins].sort(
    (a, b) =>
      (b.price_change_percentage_24h ?? 0) -
      (a.price_change_percentage_24h ?? 0),
  );

  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();

  return (
    <div id="top-gainers-losers">
      <h4>Top Gainers &amp; Losers</h4>

      <div className="mt-3 space-y-5">
        <div>
          <p className="text-xs font-medium tracking-wide text-purple-100/50 uppercase">
            Top Gainers
          </p>
          <DataTable
            columns={columns}
            data={gainers}
            rowKey={(coin) => coin.id}
            tableClassName="mt-2"
            headerCellClassName="py-2"
            bodyCellClassName="py-1.5"
          />
        </div>

        <div>
          <p className="text-xs font-medium tracking-wide text-purple-100/50 uppercase">
            Top Losers
          </p>
          <DataTable
            columns={columns}
            data={losers}
            rowKey={(coin) => coin.id}
            tableClassName="mt-2"
            headerCellClassName="py-2"
            bodyCellClassName="py-1.5"
          />
        </div>
      </div>
    </div>
  );
};

export default TopGainersLosers;
