"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const SOCKET_URL = process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8000";

interface WebSocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
    socket: null,
    isConnected: false,
});

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocketContext must be used within WebSocketProvider");
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const { isLogin } = useAuth();
    const queryClient = useQueryClient();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // ✅ ALWAYS connect WebSocket - even when logged out
        // Public market data (ticker, orderbook) doesn't require authentication
        // Only private events (balance, orders) require authentication

        // If socket already exists and connected, don't reconnect
        if (socketRef.current && socketRef.current.connected) {
            return;
        }

        // Create socket connection (works for both logged in and logged out users)
        console.log("🔌 Connecting to WebSocket...", SOCKET_URL);
        if (isLogin) {
            console.log("🔑 Using httpOnly cookie for authentication");
        } else {
            console.log("👤 Connecting as anonymous (public market data only)");
        }

        const newSocket = io(`${SOCKET_URL}/trading`, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection events
        newSocket.on("connect", () => {
            console.log("✅ WebSocket connected:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("connected", (data) => {
            if (data?.userId) {
                console.log("✅ WebSocket authenticated:", data);
                console.log("👤 My User ID for WebSocket room:", data.userId);
            } else {
                console.log("✅ WebSocket connected (anonymous - public data only)");
            }
        });

        newSocket.on("disconnect", (reason) => {
            console.log("❌ WebSocket disconnected:", reason);
            setIsConnected(false);
        });

        newSocket.on("error", (error) => {
            console.error("❌ WebSocket error:", error);
        });

        newSocket.on("connect_error", (error) => {
            console.error("❌ WebSocket connect_error:", error.message);
            console.error("Full error:", error);
        });

        // Trading events - Balance updates
        newSocket.on("balance:updated", (data) => {
            console.log("💰 Balance updated event received:", data);

            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ["balances", "spot"],
                    refetchType: "active",
                });
                console.log("🔄 Spot balances invalidated and refetching...");
            }, 100);
        });

        // Order updates
        newSocket.on("order:updated", (data) => {
            console.log("📋 Order updated event received:", data);

            queryClient.invalidateQueries({
                queryKey: ["orders"],
                refetchType: "active",
            });
        });

        // Trade executed
        newSocket.on("trade:executed", (data) => {
            console.log("🎯 Trade executed event received:", data);

            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ["balances", "spot"],
                    refetchType: "active",
                });
                queryClient.invalidateQueries({
                    queryKey: ["orders"],
                    refetchType: "active",
                });
                console.log("🔄 Spot balances and orders invalidated and refetching...");
            }, 100);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log("🔌 Cleaning up WebSocket connection");
            newSocket.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        };
    }, [isLogin, queryClient]);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

