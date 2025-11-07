"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocketContext } from "@/providers/WebSocketProvider";
import { apiClient } from "@/lib/api-client";

export interface Ticker {
  symbol: string; // "BTC_USDT"
  pair: string; // "BTC/USDT"
  price: number; // Last trade price
  change24h: number; // % change in 24h
  volume24h: number;
  high24h?: number;
  low24h?: number;
}

/**
 * Hook to get all tickers from API and update real-time via WebSocket
 *
 * - Fetches initial data from `/api/market/ticker`
 * - Listens to `ticker:update` WebSocket events for real-time updates
 */
export const useAllTickers = () => {
  const { socket, isConnected } = useWebSocketContext();
  const [tickers, setTickers] = useState<Ticker[]>([]);

  // Fetch initial tickers from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tickers", "all"],
    queryFn: async (): Promise<Ticker[]> => {
      return await apiClient.get<Ticker[]>("/api/market/ticker");
    },
    staleTime: 5000, // 5 seconds
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });

  // Initialize tickers from API data
  useEffect(() => {
    if (data) {
      setTickers(data);
    }
  }, [data]);

  // Listen for real-time ticker updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTickerUpdate = (updatedTicker: Ticker) => {
      setTickers((prev) => {
        // Find and update the ticker for this symbol
        const index = prev.findIndex((t) => t.symbol === updatedTicker.symbol);
        if (index >= 0) {
          // Update existing ticker
          const newTickers = [...prev];
          newTickers[index] = updatedTicker;
          return newTickers;
        } else {
          // Add new ticker if not found (shouldn't happen, but just in case)
          return [...prev, updatedTicker];
        }
      });
    };

    socket.on("ticker:update", handleTickerUpdate);

    return () => {
      socket.off("ticker:update", handleTickerUpdate);
    };
  }, [socket, isConnected]);

  return {
    tickers,
    isLoading,
    error,
    refetch,
    isConnected,
  };
};
