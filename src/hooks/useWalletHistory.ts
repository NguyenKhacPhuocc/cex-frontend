"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface WalletHistoryEntry {
  id: string;
  currency: string;
  changeAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId?: string;
  description?: string;
  createdAt: Date;
}

interface WalletHistoryResponse {
  data: WalletHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WalletHistoryQuery {
  page?: number;
  limit?: number;
  currency?: string;
  walletType?: string;
  startDate?: string;
  endDate?: string;
}

// Fetch wallet history from API
const fetchWalletHistory = async (
  query: WalletHistoryQuery = {}
): Promise<WalletHistoryResponse> => {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.currency) params.append("currency", query.currency);
  if (query.walletType) params.append("walletType", query.walletType);
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);

  const url = `/api/wallets/history${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  try {
    const data = await apiClient.get<WalletHistoryResponse>(url);
    return data;
  } catch (error) {
    // If API requires admin role, return empty data
    console.warn(
      "Wallet history API requires admin role, returning empty data"
    );
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
};

export const useWalletHistory = (
  query: WalletHistoryQuery = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["walletHistory", query],
    queryFn: () => fetchWalletHistory(query),
    enabled,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
};
