"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useWebSocketContext } from "@/providers/WebSocketProvider";

export interface PlaceOrderRequest {
  marketSymbol: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  price?: number; // Optional for market orders
  amount: number;
}

export interface PlaceOrderResponse {
  id: number;
  marketSymbol: string;
  side: string;
  type: string;
  price: string;
  amount: string;
  status: string;
  createdAt: string;
}

// API function để đặt lệnh
const placeOrder = async (
  orderData: PlaceOrderRequest
): Promise<PlaceOrderResponse> => {
  return await apiClient.post<PlaceOrderResponse>("/api/orders", orderData);
};

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      // console.log('✅ Order placed successfully');

      // Only invalidate spot balances to avoid rate limiting
      queryClient.invalidateQueries({
        queryKey: ["balances", "spot"],
        refetchType: "active",
      });

      // Invalidate open orders to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["orders", "open"],
      });

      // console.log('🔄 Spot balances invalidated and refetching...');

      // Có thể invalidate thêm các queries khác nếu cần
      // queryClient.invalidateQueries({ queryKey: ['orders'] });
      // queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
    onError: (error: Error) => {
      console.error("❌ Error placing order:", error);
    },
  });
};

// ========== Order Types ==========

export interface Order {
  id: string;
  userId: string;
  market: {
    id: string;
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
  };
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  price: number | null;
  amount: number;
  filled: number;
  status: "OPEN" | "FILLED" | "CANCELLED" | "PARTIALLY_FILLED";
  createdAt: string;
  updatedAt: string;
}

// ========== Fetch Functions ==========

// Fetch open orders (status = OPEN)
const fetchOpenOrders = async (): Promise<Order[]> => {
  console.log("🔄 [fetchOpenOrders] Fetching open orders...");
  const result = await apiClient.get<Order[]>("/api/orders/open");
  console.log(`✅ [fetchOpenOrders] Received ${result.length} orders:`, result);
  return result;
};

// Fetch order history (status != OPEN)
const fetchOrderHistory = async (): Promise<Order[]> => {
  console.log("🔄 [fetchOrderHistory] Fetching order history...");
  const result = await apiClient.get<Order[]>("/api/orders/history");
  console.log(
    `✅ [fetchOrderHistory] Received ${result.length} orders:`,
    result
  );
  return result;
};

// ========== Hooks ==========

/**
 * Hook to get open orders with real-time updates via WebSocket
 */
export const useOpenOrders = (enabled: boolean = true) => {
  const { socket, isConnected } = useWebSocketContext();
  const [realtimeOrders, setRealtimeOrders] = useState<Order[]>([]);

  // Fetch initial orders
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders", "open"],
    queryFn: fetchOpenOrders,
    enabled,
    staleTime: 5000, // 5 seconds
  });

  // Initialize realtime orders from fetched data
  useEffect(() => {
    if (data) {
      console.log(
        `📊 [useOpenOrders] Setting ${data.length} orders to state:`,
        data
      );
      setRealtimeOrders(data);
    }
  }, [data]);

  // Listen for order updates via WebSocket with optimistic update
  useEffect(() => {
    if (!socket || !isConnected || !enabled) return;

    const handleOrderUpdate = (data: {
      userId: string;
      orderId: string;
      status: string;
    }) => {
      console.log("📋 [WebSocket] Order updated event received:", data);

      // ✅ Optimistic update: Remove order immediately if status is FILLED
      if (data.status === "FILLED") {
        setRealtimeOrders((prev) => {
          const filtered = prev.filter((order) => order.id !== data.orderId);
          console.log(
            `🗑️ [Optimistic] Removed order ${data.orderId} from UI (status: ${data.status})`
          );
          return filtered;
        });
      }

      // Refetch to get updated data (partially filled orders need updated filled amount)
      // Delay to ensure backend cache is cleared and DB is updated
      setTimeout(() => {
        refetch();
      }, 500);
    };

    const handleTradeExecuted = (tradeData?: {
      tradeId: string;
      userId: string;
      side: string;
      symbol: string;
      price: number;
      amount: number;
      timestamp: number;
    }) => {
      console.log(
        "🎯 [WebSocket] Trade executed, updating open orders...",
        tradeData
      );

      // ✅ Optimistic update: Update orders immediately based on trade data
      if (tradeData) {
        // Note: We can't update filled amount optimistically without knowing which order
        // So we'll refetch, but with minimal delay
      }

      // Refetch to get updated filled amounts and statuses
      // Delay to ensure backend cache is cleared and DB is updated
      setTimeout(() => {
        refetch();
      }, 500);
    };

    socket.on("order:updated", handleOrderUpdate);
    socket.on("trade:executed", handleTradeExecuted);

    return () => {
      socket.off("order:updated", handleOrderUpdate);
      socket.off("trade:executed", handleTradeExecuted);
    };
  }, [socket, isConnected, enabled, refetch]);

  return {
    orders: realtimeOrders,
    isLoading,
    error,
    isConnected,
    refetch,
  };
};

/**
 * Hook to get order history (filled/cancelled orders) with real-time updates via WebSocket
 */
export const useOrderHistory = (enabled: boolean = true) => {
  const { socket, isConnected } = useWebSocketContext();
  const queryClient = useQueryClient();

  // Fetch order history
  const query = useQuery({
    queryKey: ["orders", "history"],
    queryFn: fetchOrderHistory,
    enabled,
    staleTime: 30000, // 30 seconds (history doesn't change as often)
  });

  // Listen for order updates via WebSocket to auto-refetch
  useEffect(() => {
    if (!socket || !isConnected || !enabled) return;

    const handleOrderUpdate = (data: {
      userId: string;
      orderId: string;
      status: string;
    }) => {
      console.log(
        "📋 [WebSocket] Order updated event received (history tab):",
        data
      );
      // When order status changes (filled/cancelled), it moves to history
      // Invalidate to refresh history list
      queryClient.invalidateQueries({
        queryKey: ["orders", "history"],
        refetchType: "active",
      });
    };

    const handleTradeExecuted = () => {
      console.log("🎯 [WebSocket] Trade executed, refetching order history...");
      // When trade executed, order might be filled/partially filled → move to history
      queryClient.invalidateQueries({
        queryKey: ["orders", "history"],
        refetchType: "active",
      });
    };

    socket.on("order:updated", handleOrderUpdate);
    socket.on("trade:executed", handleTradeExecuted);

    return () => {
      socket.off("order:updated", handleOrderUpdate);
      socket.off("trade:executed", handleTradeExecuted);
    };
  }, [socket, isConnected, enabled, queryClient]);

  return query;
};
