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
  id: string; // UUID from backend
  market?: {
    id: string;
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
  };
  side: string;
  type: string;
  price: number | null;
  amount: number;
  filled: number;
  status: string;
  createdAt: string;
  updatedAt: string;
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
    onSuccess: (data: PlaceOrderResponse) => {
      console.log("✅ Order placed successfully:", data);

      // ✅ Optimistic update: Add order to cache immediately
      // This ensures UI shows order instantly without waiting for refetch
      queryClient.setQueryData<Order[]>(["orders", "open"], (oldData = []) => {
        // Convert PlaceOrderResponse to Order format
        const newOrder: Order = {
          id: data.id,
          userId: "", // Will be filled by refetch if needed
          market: data.market || {
            id: "",
            symbol: "",
            baseAsset: "",
            quoteAsset: "",
          },
          side: data.side.toUpperCase() as "BUY" | "SELL",
          type: data.type.toUpperCase() as "LIMIT" | "MARKET",
          price: data.price,
          amount: data.amount,
          filled: data.filled || 0,
          status: data.status.toUpperCase() as
            | "OPEN"
            | "FILLED"
            | "CANCELLED"
            | "PARTIALLY_FILLED",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt,
        };

        // Check if order already exists (avoid duplicates)
        const exists = oldData.some((order) => order.id === newOrder.id);
        if (exists) {
          return oldData;
        }

        // Add new order at the beginning
        return [newOrder, ...oldData];
      });

      // Only invalidate spot balances to avoid rate limiting
      queryClient.invalidateQueries({
        queryKey: ["balances", "spot"],
        refetchType: "active",
      });

      // Refetch open orders in background to get full order data (market info, etc.)
      // But UI already shows the order from optimistic update above
      queryClient.invalidateQueries({
        queryKey: ["orders", "open"],
      });
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
  const queryClient = useQueryClient();
  const [realtimeOrders, setRealtimeOrders] = useState<Order[]>([]);

  // Fetch initial orders
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders", "open"],
    queryFn: fetchOpenOrders,
    enabled,
    staleTime: 5000, // 5 seconds
  });

  // Initialize realtime orders from fetched data
  // Also sync with query cache to get optimistic updates from usePlaceOrder
  useEffect(() => {
    // Get latest data from query cache (includes optimistic updates)
    const cachedData = queryClient.getQueryData<Order[]>(["orders", "open"]);
    const ordersToUse = cachedData || data || [];

    if (ordersToUse.length > 0 || data) {
      console.log(
        `📊 [useOpenOrders] Setting ${ordersToUse.length} orders to state:`,
        ordersToUse
      );
      setRealtimeOrders(ordersToUse);
    }
  }, [data, queryClient]);

  // Listen for order updates via WebSocket with optimistic update
  useEffect(() => {
    if (!socket || !isConnected || !enabled) return;

    const handleOrderUpdate = (data: {
      userId: string;
      orderId: string;
      status: string;
    }) => {
      console.log("📋 [WebSocket] Order updated event received:", data);

      // ✅ Optimistic update: Update order status immediately in cache and state
      queryClient.setQueryData<Order[]>(["orders", "open"], (oldData = []) => {
        if (data.status === "FILLED" || data.status === "CANCELLED") {
          // Remove order immediately if filled or cancelled
          const filtered = oldData.filter((order) => order.id !== data.orderId);
          console.log(
            `🗑️ [Optimistic] Removed order ${data.orderId} from cache (status: ${data.status})`
          );
          return filtered;
        } else {
          // Update order status for PARTIALLY_FILLED or other statuses
          return oldData.map((order) => {
            if (order.id === data.orderId) {
              return { ...order, status: data.status as Order["status"] };
            }
            return order;
          });
        }
      });

      // Also update state immediately
      if (data.status === "FILLED" || data.status === "CANCELLED") {
        setRealtimeOrders((prev) => {
          const filtered = prev.filter((order) => order.id !== data.orderId);
          return filtered;
        });
      } else if (data.status === "OPEN") {
        // If order status is OPEN, refetch to get full order data
        refetch();
      } else {
        // For PARTIALLY_FILLED or other statuses, update state immediately
        setRealtimeOrders((prev) => {
          return prev.map((order) => {
            if (order.id === data.orderId) {
              return { ...order, status: data.status as Order["status"] };
            }
            return order;
          });
        });
        // Refetch to get updated filled amount
        refetch();
      }
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

      // Refetch immediately to get updated filled amounts and statuses
      // No delay needed - backend already updated DB and cache
      refetch();
    };

    socket.on("order:updated", handleOrderUpdate);
    socket.on("trade:executed", handleTradeExecuted);

    return () => {
      socket.off("order:updated", handleOrderUpdate);
      socket.off("trade:executed", handleTradeExecuted);
    };
  }, [socket, isConnected, enabled, refetch, queryClient]);

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
