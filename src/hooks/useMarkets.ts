"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "@/lib/api-client";

export interface Market {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  minOrderSize?: number;
  pricePrecision?: number;
  amountPrecision?: number;
}

// Fetch all markets from API
const fetchMarkets = async (): Promise<Market[]> => {
  console.log(`🔄 [fetchMarkets] Fetching all markets...`);
  try {
    const result = await apiClient.get<Market[]>("/api/market");
    console.log(`✅ [fetchMarkets] Received ${result.length} markets:`, result);
    return result;
  } catch (error) {
    console.error(`❌ [fetchMarkets] Error fetching markets:`, error);
    throw error;
  }
};

/**
 * Hook to get all markets
 * Returns markets data with baseAsset, quoteAsset, status
 */
export const useMarkets = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

/**
 * Hook to get list of available coins from active markets
 * Extracts baseAsset and quoteAsset from active markets
 * Always includes USDT (main quote asset)
 */
export const useAvailableCoins = (enabled: boolean = true) => {
  const { data: markets = [], isLoading } = useMarkets(enabled);

  const coins = useMemo(() => {
    const coinSet = new Set<string>();

    // Extract coins from active markets (status can be 'active' or 'ACTIVE')
    markets
      .filter((market) => market.status?.toUpperCase() === "ACTIVE")
      .forEach((market) => {
        if (market.baseAsset) {
          coinSet.add(market.baseAsset.toUpperCase());
        }
        if (market.quoteAsset) {
          coinSet.add(market.quoteAsset.toUpperCase());
        }
      });

    // Always include USDT (main quote asset, even if not in markets as baseAsset)
    coinSet.add("USDT");

    return Array.from(coinSet).sort();
  }, [markets]);

  return {
    coins,
    isLoading,
  };
};
