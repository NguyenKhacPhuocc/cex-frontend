"use client";

import { useEffect, useState } from "react";
import { useWebSocketContext } from "@/providers/WebSocketProvider";

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
 * Hook to get ticker data (last price, change24h) for a specific symbol
 * 100% WebSocket-based - no HTTP requests, no rate limiting concerns
 *
 * Backend emits:
 * - "ticker:snapshot" - Initial ticker data when subscribing
 * - "ticker:update" - Real-time updates when trades execute
 */
export const useTicker = (symbol: string) => {
  const { socket, isConnected } = useWebSocketContext();
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to ticker via WebSocket (no HTTP requests!)
  useEffect(() => {
    if (!socket || !symbol) {
      setIsLoading(true);
      return;
    }

    // Always register listeners (they will work once connected)
    const handleSnapshot = (data: Ticker) => {
      console.log(`📸 [useTicker] Snapshot received:`, {
        receivedSymbol: data.symbol,
        expectedSymbol: symbol.toUpperCase(),
      });
      if (data.symbol === symbol.toUpperCase()) {
        console.log("✅ [useTicker] Snapshot symbols match!");
        setTicker(data);
        setIsLoading(false);
        setError(null);
      } else {
        console.log(`❌ [useTicker] Snapshot symbol mismatch!`);
      }
    };

    // Listen for ticker updates (real-time)
    const handleUpdate = (updatedTicker: Ticker) => {
      console.log("💹 [useTicker] Update received:", {
        receivedSymbol: updatedTicker.symbol,
        expectedSymbol: symbol.toUpperCase(),
      });

      // Only update if it's for this symbol
      if (updatedTicker.symbol === symbol.toUpperCase()) {
        console.log("✅ [useTicker] Update symbols match! Updating ticker");
        setTicker(updatedTicker);
        setError(null);
      } else {
        console.log(`❌ [useTicker] Update symbol mismatch!`);
      }
    };

    // Listen for errors
    const handleError = (errorData: { message: string }) => {
      console.error(`❌ [useTicker] Error for ${symbol}:`, errorData);
      setError(new Error(errorData.message));
      setIsLoading(false);
    };

    socket.on("ticker:snapshot", handleSnapshot);
    socket.on("ticker:update", handleUpdate);
    socket.on("ticker:error", handleError);
    console.log(`📈 [useTicker] Registered ticker listeners for ${symbol}`);

    // Subscribe to ticker for this symbol if connected
    if (isConnected) {
      console.log(`📈 [useTicker] Subscribing to ticker: ${symbol}`);
      socket.emit("ticker:subscribe", { symbol });
    }

    // Also subscribe when connection is established
    const handleConnect = () => {
      console.log(
        `📈 [useTicker] Socket connected, subscribing to ticker: ${symbol}`
      );
      socket.emit("ticker:subscribe", { symbol });
    };
    socket.on("connect", handleConnect);

    // Cleanup
    return () => {
      console.log(`📈 [useTicker] Unsubscribing from ticker: ${symbol}`);
      socket.emit("ticker:unsubscribe", { symbol });
      socket.off("ticker:snapshot", handleSnapshot);
      socket.off("ticker:update", handleUpdate);
      socket.off("ticker:error", handleError);
      socket.off("connect", handleConnect);
    };
  }, [socket, isConnected, symbol]);

  return {
    ticker,
    isLoading,
    error,
    isConnected,
  };
};
