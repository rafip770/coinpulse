import Link from "next/link";
import Image from "next/image";
import { TrendingDown, TrendingUp } from "lucide-react";
import DataTable from "@/components/DataTable";
import CoinsPagination from "@/components/CoinsPagination";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

const PER_PAGE = 10;

const columns: DataTableColumn<CoinMarketData>[] = [
  {
    header: "Rank",
    cellClassName: "rank-cell text-purple-100/60",
    cell: (coin) => `#${coin.market_cap_rank}`,
  },
  {
    header: "Coin",
    cellClassName: "name-cell",
    cell: (coin) => (
      <Link href={`/coins/${coin.id}`} className="name-cell">
        <Image src={coin.image} alt={coin.name} width={24} height={24} />
        <span>{coin.name}</span>
        <span className="text-purple-100/50 uppercase">{coin.symbol}</span>
      </Link>
    ),
  },
  {
    header: "Price",
    cellClassName: "price-cell",
    cell: (coin) => formatCurrency(coin.current_price),
  },
  {
    header: "24h Change",
    headClassName: "change-header-cell",
    cell: (coin) => {
      const isTrendingUp = coin.price_change_percentage_24h > 0;

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
          {formatPercentage(coin.price_change_percentage_24h)}
        </p>
      );
    },
  },
  {
    header: "Market Cap",
    cellClassName: "market-cap-cell",
    cell: (coin) => formatCurrency(coin.market_cap),
  },
];

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const coinsData = await fetcher<CoinMarketData[]>("/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: PER_PAGE,
    page: currentPage,
    price_change_percentage: "24h",
  });

  /* if a full page came back, assume there are more pages after it */
  const hasMorePages = coinsData.length === PER_PAGE;

  /* estimated total for smart pagination that expands as users navigate
     further: start at 100 pages and add 100 more as they reach the edge */
  const estimatedTotalPages =
    currentPage >= 100 ? Math.ceil(currentPage / 100) * 100 + 100 : 100;

  return (
    <main className="main-container">
      <section className="w-full space-y-4 custom-scrollbar">
        <h4 className="text-lg font-semibold text-white">All Coins</h4>

        <DataTable
          columns={columns}
          data={coinsData}
          rowKey={(coin) => coin.id}
        />

        <CoinsPagination
          currentPage={currentPage}
          totalPages={estimatedTotalPages}
          hasMorePages={hasMorePages}
        />
      </section>
    </main>
  );
};

export default Page;
