"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useWebSocketContext } from "@/providers/WebSocketProvider";

export interface MarketTrade {
  id: number;
  price: number;
  amount: number;
  total: string;
  side: "BUY" | "SELL";
  timestamp: string | Date; // API returns ISO string, converted to Date by new Date()
}

export interface UserTrade {
  id: number;
  market: string;
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  total: string;
  fee: number;
  timestamp: string | Date; // API returns ISO string, converted to Date by new Date()
  counterparty: {
    id: string;
    type: "BUYER" | "SELLER";
  };
}

// Fetch market trades (PUBLIC - no auth required)
const fetchMarketTrades = async (symbol: string): Promise<MarketTrade[]> => {
  console.log(`🔄 [fetchMarketTrades] Fetching market trades for ${symbol}...`);
  const result = await apiClient.get<MarketTrade[]>(
    `/api/trades/market/${symbol}`
  );
  console.log(
    `✅ [fetchMarketTrades] Received ${result.length} trades:`,
    result
  );
  console.log(`🕐 [fetchMarketTrades] First trade:`, result[0]);
  console.log(
    `🕐 [fetchMarketTrades] First trade timestamp:`,
    result[0]?.timestamp,
    typeof result[0]?.timestamp
  );
  console.log(
    `🕐 [fetchMarketTrades] First trade keys:`,
    result[0] ? Object.keys(result[0]) : "no data"
  );
  return result;
};

// Fetch user trades (PRIVATE - requires auth)
const fetchUserTrades = async (symbol: string): Promise<UserTrade[]> => {
  console.log(`🔄 [fetchUserTrades] Fetching user trades for ${symbol}...`);
  const result = await apiClient.get<UserTrade[]>(
    `/api/trades/history/${symbol}`
  );
  console.log(`✅ [fetchUserTrades] Received ${result.length} trades:`, result);
  console.log(
    `🕐 [fetchUserTrades] First trade timestamp:`,
    result[0]?.timestamp,
    typeof result[0]?.timestamp
  );
  console.log(
    `🕐 [fetchUserTrades] First trade keys:`,
    result[0] ? Object.keys(result[0]) : "no data"
  );
  return result;
};

/**
 * Hook to get market trades with real-time updates via WebSocket
 */
export const useMarketTrades = (symbol: string) => {
  const { socket, isConnected } = useWebSocketContext();
  const [realtimeTrades, setRealtimeTrades] = useState<MarketTrade[]>([]);

  // Fetch initial trades
  const { data, isLoading, error } = useQuery({
    queryKey: ["trades", "market", symbol],
    queryFn: () => fetchMarketTrades(symbol),
    staleTime: 5000, // 5 seconds
    enabled: !!symbol,
  });

  // Initialize realtime trades from fetched data
  useEffect(() => {
    if (data) {
      console.log(
        `📊 [useMarketTrades] Setting ${data.length} trades to state:`,
        data
      );
      setRealtimeTrades(data);
    }
  }, [data]);

  // Listen for new trades via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewTrade = (trade: MarketTrade & { symbol: string }) => {
      console.log("🔔 [WebSocket] Received trade:new event:", {
        tradeSymbol: trade.symbol,
        expectedSymbol: symbol,
      });
      if (trade.symbol === symbol) {
        console.log("✅ [WebSocket] Symbols match! Processing trade:", trade);

        // Add new trade to the top, keep only last 50, avoid duplicates
        setRealtimeTrades((prev) => {
          // Filter out duplicate trades by id
          const filteredPrev = prev.filter((t) => t.id !== trade.id);
          const newTrades = [trade, ...filteredPrev].slice(0, 50);
          console.log(
            `📊 [WebSocket] Updated trades (${
              newTrades.length
            } total, removed ${prev.length - filteredPrev.length} duplicates):`,
            newTrades
          );
          return newTrades;
        });
      } else {
        console.log(
          `❌ [WebSocket] Symbol mismatch: got ${trade.symbol}, expected ${symbol}`
        );
      }
    };

    // Always register listener (even if not connected, it will work once connected)
    socket.on("trade:new", handleNewTrade);
    console.log(
      `📊 [useMarketTrades] Registered trade:new listener for ${symbol}`
    );

    return () => {
      console.log(
        `📊 [useMarketTrades] Removing trade:new listener for ${symbol}`
      );
      socket.off("trade:new", handleNewTrade);
    };
  }, [socket, symbol]);

  return {
    trades: realtimeTrades,
    isLoading,
    error,
    isConnected,
  };
};

/**
 * Hook to get user's own trades for a specific symbol (requires authentication)
 */
export const useUserTrades = (symbol: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trades", "user", symbol],
    queryFn: () => fetchUserTrades(symbol),
    enabled: enabled && !!symbol,
    staleTime: 10000, // 10 seconds
  });
};

// Fetch all user trades (no symbol filter) - for trade history tab
const fetchAllUserTrades = async (): Promise<UserTrade[]> => {
  console.log(`🔄 [fetchAllUserTrades] Fetching all user trades...`);
  const result = await apiClient.get<UserTrade[]>(`/api/trades/history`);
  console.log(
    `✅ [fetchAllUserTrades] Received ${result.length} trades:`,
    result
  );
  return result;
};

/**
 * Hook to get all user's trades (trade history tab) with real-time updates via WebSocket
 */
export const useAllUserTrades = (enabled: boolean = true) => {
  const { socket, isConnected } = useWebSocketContext();
  const queryClient = useQueryClient();

  // Fetch all user trades
  const query = useQuery({
    queryKey: ["trades", "user", "all"],
    queryFn: fetchAllUserTrades,
    enabled,
    staleTime: 30000, // 30 seconds
  });

  // Listen for trade executed events via WebSocket to auto-refetch
  useEffect(() => {
    if (!socket || !isConnected || !enabled) return;

    const handleTradeExecuted = (data: {
      tradeId: string;
      userId: string;
      side: string;
      symbol: string;
      price: number;
      amount: number;
      timestamp: number;
    }) => {
      console.log("🎯 [WebSocket] Trade executed (trade history tab):", data);
      // When new trade executed, add it to trade history
      // Invalidate to refresh trade history list
      queryClient.invalidateQueries({
        queryKey: ["trades", "user", "all"],
        refetchType: "active",
      });
    };

    socket.on("trade:executed", handleTradeExecuted);

    return () => {
      socket.off("trade:executed", handleTradeExecuted);
    };
  }, [socket, isConnected, enabled, queryClient]);

  return query;
};
