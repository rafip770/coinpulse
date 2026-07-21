"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error("Couldn't get a base URL");
if (!API_KEY) throw new Error("Could not get API key");

/* Rafi's key is a DEMO-plan key, so the demo header is sent when the base URL
   is the public api.coingecko.com host (pro keys use x-cg-pro-api-key). */
const API_KEY_HEADER = BASE_URL.includes("pro-api")
  ? "x-cg-pro-api-key"
  : "x-cg-demo-api-key";

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const headers: Record<string, string> = {
    [API_KEY_HEADER]: API_KEY!,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    headers,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response
      .json()
      .catch(() => ({}));

    throw new Error(
      `API Error: ${response.status} ${
        errorBody.error ??
        errorBody.status?.error_message ??
        response.statusText
      }`,
    );
  }

  return response.json();
}

/* Finds the most relevant trading pool for a coin so the live data can
   connect to a real market. Uses the token's network + contract address when
   available, otherwise falls back to searching pools by the coin id. */
export async function getPools({
  id,
  network,
  contractAddress,
}: {
  id: string;
  network?: string | null;
  contractAddress?: string | null;
}): Promise<PoolData> {
  const fallback: PoolData = { id: "", address: "", name: "", network: "" };

  const toPool = (response: OnchainPoolsResponse): PoolData => {
    const pool = response.data?.[0];
    if (!pool) return fallback;

    return {
      id: pool.id,
      address: pool.attributes.address,
      name: pool.attributes.name,
      network: pool.id.split("_")[0],
    };
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<OnchainPoolsResponse>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return toPool(poolData);
    } catch (error) {
      console.error("Failed to fetch pools:", error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<OnchainPoolsResponse>(
      "/onchain/search/pools",
      { query: id },
    );

    return toPool(poolData);
  } catch (error) {
    console.error("Failed to fetch pools:", error);
    return fallback;
  }
}
