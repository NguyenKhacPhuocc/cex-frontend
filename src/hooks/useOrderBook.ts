"use client";

import { useState, useEffect } from "react";
import { useWebSocketContext } from "@/providers/WebSocketProvider";

export interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookData {
  symbol: string;
  asks: OrderBookItem[];
  bids: OrderBookItem[];
}

/**
 * Hook to subscribe to OrderBook updates via WebSocket
 *
 * Backend emits:
 * - "orderbook:snapshot" - Initial full orderbook data
 * - "orderbook:update" - Incremental updates
 *
 * Data từ Redis ZSET đã sorted sẵn:
 * - Asks: sorted by price ascending (lowest first)
 * - Bids: sorted by price descending (highest first)
 */
export const useOrderBook = (symbol: string) => {
  const { socket, isConnected } = useWebSocketContext();
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) {
      setIsLoading(true);
      return;
    }

    // Always register listeners (they will work once connected)
    const handleSnapshot = (data: OrderBookData) => {
      console.log(`📸 [useOrderBook] Snapshot received for ${symbol}:`, data);
      setOrderBook(data);
      setIsLoading(false);
    };

    // Listen for orderbook updates (incremental changes)
    const handleUpdate = (data: OrderBookData) => {
      console.log(`🔄 [useOrderBook] Update received for ${symbol}:`, data);
      setOrderBook(data);
    };

    socket.on("orderbook:snapshot", handleSnapshot);
    socket.on("orderbook:update", handleUpdate);
    console.log(
      `📊 [useOrderBook] Registered orderbook listeners for ${symbol}`
    );

    // Subscribe to orderbook for this symbol if connected
    if (isConnected) {
      console.log(`📊 [useOrderBook] Subscribing to orderbook: ${symbol}`);
      socket.emit("orderbook:subscribe", { symbol });
    }

    // Also subscribe when connection is established
    const handleConnect = () => {
      console.log(
        `📊 [useOrderBook] Socket connected, subscribing to orderbook: ${symbol}`
      );
      socket.emit("orderbook:subscribe", { symbol });
    };
    socket.on("connect", handleConnect);

    // Cleanup
    return () => {
      console.log(`📊 [useOrderBook] Unsubscribing from orderbook: ${symbol}`);
      socket.emit("orderbook:unsubscribe", { symbol });
      socket.off("orderbook:snapshot", handleSnapshot);
      socket.off("orderbook:update", handleUpdate);
      socket.off("connect", handleConnect);
    };
  }, [socket, isConnected, symbol]);

  return {
    orderBook,
    isLoading,
    isConnected,
  };
};
