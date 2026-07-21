import DataTable from "@/components/DataTable";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency } from "@/lib/utils";

/* contract-address pairs are unreadable — shorten anything long */
const shortenPair = (value: string) =>
  value.length > 10 ? `${value.slice(0, 6)}…` : value;

const columns: DataTableColumn<CoinTicker>[] = [
  {
    header: "Exchange",
    cellClassName: "category-cell",
    cell: (ticker) => ticker.market.name,
  },
  {
    header: "Pair",
    cellClassName: "text-purple-100",
    cell: (ticker) =>
      `${shortenPair(ticker.base)}/${shortenPair(ticker.target)}`,
  },
  {
    header: "Price",
    cellClassName: "price-cell",
    cell: (ticker) => formatCurrency(ticker.converted_last?.usd ?? ticker.last),
  },
  {
    header: "24h Volume",
    cellClassName: "volume-cell",
    cell: (ticker) =>
      formatCurrency(ticker.converted_volume?.usd ?? ticker.volume),
  },
  {
    header: "Trust",
    cell: (ticker) => (
      <span
        className={cn(
          "inline-block size-2.5 rounded-full",
          ticker.trust_score === "green"
            ? "bg-green-500"
            : ticker.trust_score === "yellow"
              ? "bg-yellow-500"
              : "bg-red-500",
        )}
      />
    ),
  },
];

const ExchangeListings = async ({ id }: { id: string }) => {
  let tickers: CoinTicker[];

  try {
    const data = await fetcher<{ name: string; tickers: CoinTicker[] }>(
      `/coins/${id}/tickers`,
      { order: "trust_score_desc" },
      300,
    );

    tickers = data.tickers ?? [];
  } catch (error) {
    console.error("Failed to fetch exchange listings:", error);
    return null;
  }

  return (
    <div id="exchange-listings">
      <h4>Exchange Listings</h4>
      <DataTable
        columns={columns}
        data={tickers.slice(0, 8)}
        rowKey={(_, index) => index}
        tableClassName="mt-3"
        headerCellClassName="py-3"
        bodyCellClassName="py-2"
      />
    </div>
  );
};

export default ExchangeListings;
