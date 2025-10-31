"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useWebSocketContext } from "@/providers/WebSocketProvider";

export interface Ticker {
  symbol: string; // "BTC_USDT"
  pair: string; // "BTC/USDT"
  price: number;
  change24h: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
}

// Fetch all tickers from API
const fetchTickers = async (): Promise<Ticker[]> => {
  console.log(`🔄 [fetchTickers] Fetching all tickers...`);
  const result = await apiClient.get<Ticker[]>("/api/market/ticker");
  console.log(`✅ [fetchTickers] Received ${result.length} tickers:`, result);
  return result;
};

/**
 * Hook to get trading pairs with real-time updates via WebSocket
 * Returns ticker data for all markets
 */
export const useTradingPairs = () => {
  const { socket, isConnected } = useWebSocketContext();
  const [realtimeTickers, setRealtimeTickers] = useState<Ticker[]>([]);

  // Fetch initial tickers
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tradingPairs"],
    queryFn: fetchTickers,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds as fallback
  });

  // Initialize realtime tickers from fetched data
  useEffect(() => {
    if (data) {
      console.log(
        `📊 [useTradingPairs] Setting ${data.length} tickers to state:`,
        data
      );
      setRealtimeTickers(data);
    }
  }, [data]);

  // Listen for ticker updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTickerUpdate = (updatedTicker: Ticker) => {
      console.log("💹 [WebSocket] Ticker update received:", updatedTicker);

      setRealtimeTickers((prev) => {
        // Update ticker if exists, otherwise add it
        const index = prev.findIndex((t) => t.symbol === updatedTicker.symbol);
        if (index >= 0) {
          const newTickers = [...prev];
          newTickers[index] = updatedTicker;
          return newTickers;
        }
        // If new market, add it to the list
        return [...prev, updatedTicker];
      });
    };

    socket.on("ticker:update", handleTickerUpdate);

    return () => {
      socket.off("ticker:update", handleTickerUpdate);
    };
  }, [socket, isConnected]);

  return {
    tickers: realtimeTickers,
    isLoading,
    error,
    isConnected,
    refetch,
  };
};
