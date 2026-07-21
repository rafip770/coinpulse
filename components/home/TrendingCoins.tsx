import Link from "next/link";
import Image from "next/image";
import { TrendingDown, TrendingUp } from "lucide-react";
import DataTable from "@/components/DataTable";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingCoinsFallback } from "@/components/home/fallback";

const columns: DataTableColumn<TrendingCoin>[] = [
  {
    header: "Name",
    cellClassName: "name-cell",
    cell: (coin) => {
      const item = coin.item;

      return (
        <Link href={`/coins/${item.id}`} className="name-cell">
          <Image src={item.small} alt={item.name} width={24} height={24} />
          <span>{item.name}</span>
        </Link>
      );
    },
  },
  {
    header: "24h Change",
    cellClassName: "change-cell",
    cell: (coin) => {
      const change = coin.item.data.price_change_percentage_24h.usd;
      const isTrendingUp = change > 0;

      return (
        <p
          className={cn(
            "change-cell flex items-center gap-1",
            isTrendingUp ? "text-green-500" : "text-red-500",
          )}
        >
          {isTrendingUp ? (
            <TrendingUp width={16} height={16} />
          ) : (
            <TrendingDown width={16} height={16} />
          )}
          {formatPercentage(change)}
        </p>
      );
    },
  },
  {
    header: "Price",
    cellClassName: "price-cell",
    cell: (coin) => formatCurrency(coin.item.data.price),
  },
];

const TrendingCoins = async () => {
  let trendingCoins: TrendingCoins;

  try {
    trendingCoins = await fetcher<TrendingCoins>(
      "/search/trending",
      undefined,
      300,
    );
  } catch (error) {
    console.error("Failed to fetch trending coins:", error);
    return <TrendingCoinsFallback />;
  }

  return (
    <div id="trending-coins">
      <h4>Trending Coins</h4>
      <DataTable
        columns={columns}
        data={trendingCoins.coins.slice(0, 6)}
        rowKey={(coin) => coin.item.id}
        tableClassName="mt-3"
        headerCellClassName="py-3"
        bodyCellClassName="py-2"
      />
    </div>
  );
};

export default TrendingCoins;
