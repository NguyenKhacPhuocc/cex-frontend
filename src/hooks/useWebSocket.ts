"use client";

import { useEffect, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8000";

export const useWebSocket = () => {
  const { isLogin } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isLogin) {
      // Disconnect if user logs out
      if (socketRef.current) {
        console.log("🔌 Disconnecting WebSocket (user logged out)");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Create socket connection
    // Token will be sent automatically via httpOnly cookie
    console.log("🔌 Connecting to WebSocket...", SOCKET_URL);
    console.log("🔑 Using httpOnly cookie for authentication");

    const socket = io(`${SOCKET_URL}/trading`, {
      withCredentials: true, // ✅ Send httpOnly cookies automatically
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("✅ WebSocket connected:", socket.id);
    });

    socket.on("connected", (data) => {
      console.log("✅ WebSocket authenticated:", data);
      console.log("👤 My User ID for WebSocket room:", data.userId);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
    });

    socket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connect_error:", error.message);
      console.error("Full error:", error);
    });

    // Trading events
    socket.on("balance:updated", (data) => {
      console.log("💰 Balance updated event received:", data);

      // Small delay to ensure DB transaction is fully committed
      setTimeout(() => {
        // Only invalidate spot balances to avoid rate limiting
        queryClient.invalidateQueries({
          queryKey: ["balances", "spot"],
          refetchType: "active",
        });
        console.log("🔄 Spot balances invalidated and refetching...");
      }, 100); // 100ms delay
    });

    socket.on("order:updated", (data) => {
      console.log("📋 Order updated event received:", data);

      // Invalidate orders queries
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        refetchType: "active",
      });
    });

    socket.on("trade:executed", (data) => {
      console.log("🎯 Trade executed event received:", data);

      // Small delay to ensure DB transaction is fully committed
      setTimeout(() => {
        // Only invalidate spot balances to avoid rate limiting
        queryClient.invalidateQueries({
          queryKey: ["balances", "spot"],
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: ["orders"],
          refetchType: "active",
        });
        console.log(
          "🔄 Spot balances and orders invalidated and refetching..."
        );
      }, 100); // 100ms delay

      // Optional: Show toast notification
      // toast.success(`Trade executed: ${data.amount} ${data.symbol} @ ${data.price}`);
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Cleaning up WebSocket connection");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLogin, queryClient]);

  return useMemo(
    () => ({
      socket: socketRef.current,
      isConnected: socketRef.current?.connected || false,
    }),
    [socketRef.current?.connected]
  );
};
