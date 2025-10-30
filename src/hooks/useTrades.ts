"use client";

import { useQuery } from "@tanstack/react-query";
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
    if (!socket || !isConnected) return;

    const handleNewTrade = (trade: MarketTrade & { symbol: string }) => {
      if (trade.symbol === symbol) {
        console.log("💹 [WebSocket] New market trade received:", trade);

        // Add new trade to the top, keep only last 50
        setRealtimeTrades((prev) => {
          const newTrades = [trade, ...prev].slice(0, 50);
          console.log(
            `📊 [WebSocket] Updated trades (${newTrades.length} total):`,
            newTrades
          );
          return newTrades;
        });
      }
    };

    socket.on("trade:new", handleNewTrade);

    return () => {
      socket.off("trade:new", handleNewTrade);
    };
  }, [socket, isConnected, symbol]);

  return {
    trades: realtimeTrades,
    isLoading,
    error,
    isConnected,
  };
};

/**
 * Hook to get user's own trades (requires authentication)
 */
export const useUserTrades = (symbol: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trades", "user", symbol],
    queryFn: () => fetchUserTrades(symbol),
    enabled: enabled && !!symbol,
    staleTime: 10000, // 10 seconds
  });
};
