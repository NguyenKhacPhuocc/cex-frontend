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
    if (!socket || !isConnected) {
      setIsLoading(true);
      return;
    }

    console.log(`📊 Subscribing to orderbook: ${symbol}`);

    // Subscribe to orderbook for this symbol
    socket.emit("orderbook:subscribe", { symbol });

    // Listen for orderbook snapshot (initial data)
    const handleSnapshot = (data: OrderBookData) => {
      console.log(`📸 OrderBook snapshot received for ${symbol}:`, data);
      setOrderBook(data);
      setIsLoading(false);
    };

    // Listen for orderbook updates (incremental changes)
    const handleUpdate = (data: OrderBookData) => {
      console.log(`🔄 OrderBook update received for ${symbol}:`, data);
      setOrderBook(data);
    };

    socket.on("orderbook:snapshot", handleSnapshot);
    socket.on("orderbook:update", handleUpdate);

    // Cleanup
    return () => {
      console.log(`📊 Unsubscribing from orderbook: ${symbol}`);
      socket.emit("orderbook:unsubscribe", { symbol });
      socket.off("orderbook:snapshot", handleSnapshot);
      socket.off("orderbook:update", handleUpdate);
    };
  }, [socket, isConnected, symbol]);

  return {
    orderBook,
    isLoading,
    isConnected,
  };
};
