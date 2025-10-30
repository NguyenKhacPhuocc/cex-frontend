"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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
    onSuccess: (data) => {
      // console.log('✅ Order placed successfully:', data);

      // Only invalidate spot balances to avoid rate limiting
      queryClient.invalidateQueries({
        queryKey: ["balances", "spot"],
        refetchType: "active",
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
