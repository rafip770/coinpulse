"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { fetcher } from "@/lib/coingecko.actions";

const SearchModal = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCoin[]>([]);
  const [trending, setTrending] = useState<SearchCoin[]>([]);
  const [loading, setLoading] = useState(false);

  /* global ⌘K / Ctrl+K shortcut */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  /* trending coins shown while the query is empty (fetched once on open) */
  useEffect(() => {
    if (!open || trending.length) return;

    fetcher<TrendingCoins>("/search/trending", undefined, 300)
      .then((data) =>
        setTrending(
          data.coins.slice(0, 6).map((coin) => ({
            id: coin.item.id,
            name: coin.item.name,
            symbol: coin.item.symbol,
            thumb: coin.item.thumb,
            market_cap_rank: coin.item.market_cap_rank,
          })),
        ),
      )
      .catch((error) =>
        console.error("Failed to fetch trending coins:", error),
      );
  }, [open, trending.length]);

  /* debounced market-wide search */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const data = await fetcher<{ coins: SearchCoin[] }>("/search", {
          query: query.trim(),
        });

        setResults(data.coins.slice(0, 8));
      } catch (error) {
        console.error("Failed to search coins:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/coins/${id}`);
  };

  const coins = query.trim() ? results : trending;

  return (
    <>
      <button className="search-trigger" onClick={() => setOpen(true)}>
        Search
        <kbd className="bg-dark-300 ml-2 rounded px-1.5 py-0.5 text-xs">⌘K</kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        shouldFilter={false}
        className="search-modal-content"
        title="Search coins"
        description="Search for any cryptocurrency"
      >
        <div id="search-modal">
          <CommandInput
            placeholder="Search coins..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : "No coins found."}
            </CommandEmpty>

            <CommandGroup heading={query.trim() ? "Coins" : "Trending"}>
              {coins.map((coin) => (
                <CommandItem
                  key={coin.id}
                  value={coin.id}
                  onSelect={() => handleSelect(coin.id)}
                  className="cursor-pointer"
                >
                  {coin.thumb && (
                    <Image
                      src={coin.thumb}
                      alt={coin.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  )}
                  <span className="font-medium text-white">{coin.name}</span>
                  <span className="text-purple-100/50 uppercase">
                    {coin.symbol}
                  </span>
                  {coin.market_cap_rank && (
                    <span className="text-purple-100/40 ml-auto text-xs">
                      #{coin.market_cap_rank}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
};

export default SearchModal;
