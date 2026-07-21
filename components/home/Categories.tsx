import Image from "next/image";
import { TrendingDown, TrendingUp } from "lucide-react";
import DataTable from "@/components/DataTable";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { CategoriesFallback } from "@/components/home/fallback";

const columns: DataTableColumn<Category>[] = [
  {
    header: "Category",
    cellClassName: "category-cell",
    cell: (category) => category.name,
  },
  {
    header: "Top Gainers",
    cellClassName: "top-gainers-cell",
    cell: (category) =>
      category.top_3_coins.map((coin) => (
        <Image src={coin} alt={coin} key={coin} width={28} height={28} />
      )),
  },
  {
    header: "24h Change",
    headClassName: "change-header-cell",
    cell: (category) => {
      const isTrendingUp = category.market_cap_change_24h > 0;

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
          {formatPercentage(category.market_cap_change_24h)}
        </p>
      );
    },
  },
  {
    header: "Market Cap",
    cellClassName: "market-cap-cell",
    cell: (category) => formatCurrency(category.market_cap),
  },
  {
    header: "24h Volume",
    cellClassName: "volume-cell",
    cell: (category) => formatCurrency(category.volume_24h),
  },
];

const Categories = async () => {
  let categories: Category[];

  try {
    categories = await fetcher<Category[]>("/coins/categories");
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return <CategoriesFallback />;
  }

  return (
    <div id="categories" className="custom-scrollbar">
      <h4>Top Categories</h4>
      <DataTable
        columns={columns}
        data={categories.slice(0, 10)}
        rowKey={(_, index) => index}
        tableClassName="mt-3"
      />
    </div>
  );
};

export default Categories;
