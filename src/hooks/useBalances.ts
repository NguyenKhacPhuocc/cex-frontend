"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Balance {
  asset: string;
  available: string;
  locked: string;
  type?: string;
}

type WalletType = "spot" | "futures" | "funding";

// API function để fetch balances
const fetchBalances = async (type: WalletType): Promise<Balance[]> => {
  console.log(`🔄 Fetching ${type} balances...`);
  try {
    const data = await apiClient.get<Balance[]>(`/api/balances/${type}`);
    console.log(`✅ ${type} balances fetched:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${type} balances:`, error);
    throw error; // Re-throw to let React Query handle it
  }
};

export const useBalances = (type: WalletType, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["balances", type],
    queryFn: () => fetchBalances(type),
    enabled, // Only fetch when enabled (e.g., user is logged in)
    staleTime: 0, // Always refetch when invalidated
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1,
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  });
};

// Hook để fetch tất cả balances cùng lúc
export const useAllBalances = (enabled: boolean = true) => {
  const spotBalances = useBalances("spot", enabled);
  const futuresBalances = useBalances("futures", enabled);
  const fundingBalances = useBalances("funding", enabled);

  return {
    spot: spotBalances,
    futures: futuresBalances,
    funding: fundingBalances,
    isLoading:
      spotBalances.isLoading ||
      futuresBalances.isLoading ||
      fundingBalances.isLoading,
  };
};
