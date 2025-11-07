"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useMemo,
    ReactNode,
} from "react";
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
    const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

    useEffect(() => {
        // ALWAYS connect WebSocket - even when logged out
        // Public market data (ticker, orderbook) doesn't require authentication
        // Only private events (balance, orders) require authentication

        // If socket already exists and connected, don't reconnect
        if (socketRef.current && socketRef.current.connected) {
            return;
        }

        // Create socket connection (works for both logged in and logged out users)
        console.log("Connecting to WebSocket...", SOCKET_URL);
        if (isLogin) {
            console.log("Using httpOnly cookie for authentication");
        } else {
            console.log("Connecting as anonymous (public market data only)");
        }

        const newSocket = io(`${SOCKET_URL}/trading`, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Copy timeoutRefs to local variable for cleanup
        const timeouts = timeoutRefs.current;

        // Helper function to track and cleanup timeouts
        const createTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
            const timeoutId = setTimeout(() => {
                timeouts.delete(timeoutId);
                callback();
            }, delay);
            timeouts.add(timeoutId);
            return timeoutId;
        };

        // Connection event handlers
        const handleConnect = () => {
            console.log("[WebSocketProvider] WebSocket connected:", newSocket.id);
            setIsConnected(true);
        };

        const handleConnected = (data: { userId?: string }) => {
            if (data?.userId) {
                console.log("[WebSocketProvider] WebSocket authenticated:", data);
                console.log("[WebSocketProvider] My User ID for WebSocket room:", data.userId);
            } else {
                console.log(
                    "[WebSocketProvider] WebSocket connected (anonymous - public data only)"
                );
            }
        };

        const handleDisconnect = (reason: string) => {
            console.log("[WebSocketProvider] WebSocket disconnected:", reason);
            setIsConnected(false);
        };

        const handleError = (error: Error) => {
            console.error("[WebSocketProvider] WebSocket error:", error);
        };

        const handleConnectError = (error: Error) => {
            console.error("[WebSocketProvider] WebSocket connect_error:", error.message);
            console.error("Full error:", error);
        };

        // Public market events (only in development to avoid console spam)
        const handleAnyEvent = (eventName: string, ...args: unknown[]) => {
            if (process.env.NODE_ENV === "development") {
                console.log(`[WebSocketProvider] Received event: ${eventName}`, args[0]);
            }
        };

        // Trading events - Balance updates
        const handleBalanceUpdated = (data: {
            balances?: Array<{ asset: string; available: string; locked: string }>;
        }) => {
            if (data.balances && Array.isArray(data.balances)) {
                queryClient.setQueryData(["balances", "spot"], data.balances);
            } else {
                // Fallback: invalidate to refetch
                createTimeout(() => {
                    queryClient.invalidateQueries({
                        queryKey: ["balances", "spot"],
                        refetchType: "active",
                    });
                }, 100);
            }
        };

        // Trade executed - Use WebSocket data to update balance optimistically
        const handleTradeExecuted = (data: {
            tradeId: string;
            userId: string;
            side: string;
            symbol: string;
            price: number;
            amount: number;
            timestamp: number;
        }) => {
            queryClient.setQueryData<Array<{ asset: string; available: string; locked: string }>>(
                ["balances", "spot"],
                (oldBalances = []) => {
                    if (!oldBalances.length) return oldBalances;

                    const tradeValue = data.price * data.amount;
                    const [baseAsset, quoteAsset] = data.symbol.split("/");

                    return oldBalances.map((balance) => {
                        if (data.side === "BUY") {
                            // Mua: trừ quoteAsset (USDT), cộng baseAsset (BTC)
                            if (balance.asset === quoteAsset) {
                                const newAvailable = Math.max(
                                    0,
                                    Number(balance.available) - tradeValue
                                );
                                return {
                                    ...balance,
                                    available: newAvailable.toFixed(8),
                                };
                            }
                            if (balance.asset === baseAsset) {
                                return {
                                    ...balance,
                                    available: (Number(balance.available) + data.amount).toFixed(8),
                                };
                            }
                        } else {
                            // Bán: trừ baseAsset (BTC), cộng quoteAsset (USDT)
                            if (balance.asset === baseAsset) {
                                const newAvailable = Math.max(
                                    0,
                                    Number(balance.available) - data.amount
                                );
                                return {
                                    ...balance,
                                    available: newAvailable.toFixed(8),
                                };
                            }
                            if (balance.asset === quoteAsset) {
                                return {
                                    ...balance,
                                    available: (Number(balance.available) + tradeValue).toFixed(8),
                                };
                            }
                        }
                        return balance;
                    });
                }
            );

            createTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ["orders"],
                    refetchType: "active",
                });
                // Also invalidate balance as backup to ensure accuracy
                queryClient.invalidateQueries({
                    queryKey: ["balances", "spot"],
                    refetchType: "active",
                });
            }, 100);
        };

        // Register all event listeners
        newSocket.on("connect", handleConnect);
        newSocket.on("connected", handleConnected);
        newSocket.on("disconnect", handleDisconnect);
        newSocket.on("error", handleError);
        newSocket.on("connect_error", handleConnectError);
        newSocket.onAny(handleAnyEvent);
        newSocket.on("balance:updated", handleBalanceUpdated);
        newSocket.on("trade:executed", handleTradeExecuted);

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            // Remove all event listeners
            newSocket.off("connect", handleConnect);
            newSocket.off("connected", handleConnected);
            newSocket.off("disconnect", handleDisconnect);
            newSocket.off("error", handleError);
            newSocket.off("connect_error", handleConnectError);
            newSocket.offAny(handleAnyEvent);
            newSocket.off("balance:updated", handleBalanceUpdated);
            newSocket.off("trade:executed", handleTradeExecuted);

            // Clear all pending timeouts
            timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
            timeouts.clear();

            // Disconnect socket
            newSocket.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryClient]); // isLogin only used for logging, not needed in dependencies

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        socket, isConnected
    }),[socket, isConnected]);

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

