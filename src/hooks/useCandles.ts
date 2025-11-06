import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocketContext } from "@/providers/WebSocketProvider";
import { apiClient } from "@/lib/api-client";

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleDto {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const fetchCandles = async (
  symbol: string,
  timeframe: string
): Promise<Candle[]> => {
  try {
    console.log(
      `📊 Fetching candles for ${symbol} with timeframe ${timeframe}`
    );
    const response = await apiClient.get<Candle[]>(
      `/api/candles/${symbol}?timeframe=${timeframe}&limit=500`
    );
    console.log(
      `📊 Received ${response.length} candles for ${symbol}:${timeframe}`
    );
    if (response.length === 0) {
      console.warn(
        `⚠️ No candles found for ${symbol}:${timeframe}. This might be because there's no historical data yet.`
      );
    }
    return response;
  } catch (error) {
    console.error(
      `❌ Failed to fetch candles for ${symbol}:${timeframe}:`,
      error
    );
    const err = error as { response?: { status?: number } };
    if (err?.response?.status === 400) {
      console.error(
        `❌ Bad request - check if timeframe "${timeframe}" is valid`
      );
    }
    return [];
  }
};

export const useCandles = (symbol: string, timeframe: string) => {
  const { socket, isConnected } = useWebSocketContext();
  const queryClient = useQueryClient();
  const [realtimeCandles, setRealtimeCandles] = useState<Candle[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Invalidate cache when symbol or timeframe changes to force fresh fetch
  useEffect(() => {
    if (symbol && timeframe) {
      // Remove old cache entries for this query key to force fresh fetch
      queryClient.removeQueries({ queryKey: ["candles", symbol, timeframe] });
      console.log(`📊 Invalidated cache for ${symbol}:${timeframe}`);
    }
  }, [symbol, timeframe, queryClient]);

  // Fetch initial historical candles
  const {
    data: historicalCandles,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candles", symbol, timeframe],
    queryFn: () => fetchCandles(symbol, timeframe),
    enabled: !!symbol && !!timeframe,
    staleTime: 0, // Always consider data stale - force refetch on mount
    gcTime: 0, // Don't cache old data (previously cacheTime)
    refetchOnMount: "always", // Always refetch when component mounts (e.g., navigating to spot page)
    refetchOnWindowFocus: false, // Don't refetch on window focus (we have WebSocket for real-time updates)
  });

  // Track current symbol/timeframe to detect changes
  const [currentSymbolTimeframe, setCurrentSymbolTimeframe] =
    useState<string>("");
  // Use ref to track current subscription key for WebSocket updates
  const subscriptionKeyRef = useRef<string>("");

  // Initialize realtime candles with historical data on first load or when timeframe/symbol changes
  // This effect runs when historicalCandles changes (new data fetched) or when symbol/timeframe changes
  useEffect(() => {
    const newKey = `${symbol}:${timeframe}`;

    // Only update if we have historical data and it's not loading
    // AND it matches the current symbol/timeframe (to avoid showing stale data)
    if (historicalCandles && !isLoading && newKey === currentSymbolTimeframe) {
      // Always initialize/update when historical data is available (even if empty array)
      // This ensures chart updates properly when switching timeframes
      setRealtimeCandles(historicalCandles);
      if (historicalCandles.length > 0) {
        console.log(
          `📊 Initialized with ${historicalCandles.length} historical candles for ${symbol}:${timeframe}`
        );
      } else {
        console.warn(
          `⚠️ No historical candles for ${symbol}:${timeframe}. Chart will be empty until new trades create candles.`
        );
      }
    }
  }, [historicalCandles, symbol, timeframe, isLoading, currentSymbolTimeframe]);

  // Update current symbol/timeframe key when they change
  useEffect(() => {
    const newKey = `${symbol}:${timeframe}`;
    if (newKey !== currentSymbolTimeframe) {
      setCurrentSymbolTimeframe(newKey);
      // Update subscription key ref
      subscriptionKeyRef.current = newKey;
      // Clear realtime candles immediately when symbol/timeframe changes
      setRealtimeCandles([]);
      console.log(
        `📊 Symbol/timeframe changed to ${newKey}, cleared realtime candles`
      );
    }
  }, [symbol, timeframe, currentSymbolTimeframe]);

  // Combine historical and real-time candles
  // Only return data if it matches current symbol/timeframe to avoid stale data
  const candles =
    currentSymbolTimeframe === `${symbol}:${timeframe}` &&
    realtimeCandles.length > 0
      ? realtimeCandles
      : currentSymbolTimeframe === `${symbol}:${timeframe}` &&
        !isLoading &&
        historicalCandles
      ? historicalCandles
      : [];

  // WebSocket subscription effect
  useEffect(() => {
    if (!socket || !isConnected || !symbol || !timeframe) {
      return;
    }

    // Subscribe to candle updates
    if (!isSubscribed) {
      socket.emit("candle:subscribe", { symbol, timeframe });
      setIsSubscribed(true);
      console.log(`📊 Subscribed to candle updates for ${symbol}:${timeframe}`);
    }

    // Update subscription key ref
    const subscribeKey = `${symbol}:${timeframe}`;
    subscriptionKeyRef.current = subscribeKey;

    // Handle candle:update events
    const handleCandleUpdate = (candle: CandleDto) => {
      // Check if we're still subscribed to the same symbol/timeframe
      // Use ref to get the latest value, not the closure value
      const currentSubscriptionKey = subscriptionKeyRef.current;
      if (currentSubscriptionKey !== subscribeKey) {
        console.log(
          `⏭️ Skipping WebSocket update - symbol/timeframe changed from ${subscribeKey} to ${currentSubscriptionKey}`
        );
        return;
      }

      console.log("📊 [WebSocket] Candle update received:", candle);

      setRealtimeCandles((prev) => {
        // Double-check subscription is still valid (in case it changed during setState)
        // Use ref to get the latest value
        if (subscriptionKeyRef.current !== subscribeKey) {
          return prev;
        }
        // Ensure time is a number for comparison
        const candleTime =
          typeof candle.time === "number" ? candle.time : Number(candle.time);

        // Find existing candle by time (exact match)
        const existingIndex = prev.findIndex((c) => {
          const cTime = typeof c.time === "number" ? c.time : Number(c.time);
          return cTime === candleTime;
        });

        if (existingIndex >= 0) {
          // Update existing candle (current incomplete candle)
          const updated = [...prev];
          // Ensure all values are numbers
          updated[existingIndex] = {
            time: candleTime,
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
            volume: Number(candle.volume || 0),
          };
          console.log(
            `📊 Updated candle at index ${existingIndex}:`,
            updated[existingIndex]
          );
          return updated;
        } else {
          // Append new candle (new complete candle)
          // Ensure all values are numbers
          const newCandle = {
            time: candleTime,
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
            volume: Number(candle.volume || 0),
          };

          const updated = [...prev, newCandle];

          // Sort by time ascending (required by lightweight-charts)
          updated.sort((a, b) => {
            const aTime = typeof a.time === "number" ? a.time : Number(a.time);
            const bTime = typeof b.time === "number" ? b.time : Number(b.time);
            return aTime - bTime;
          });

          // Remove duplicates by time (keep the last one - most recent data)
          const uniqueByTime = new Map<number, typeof newCandle>();
          updated.forEach((candle) => {
            const candleTime =
              typeof candle.time === "number"
                ? candle.time
                : Number(candle.time);
            uniqueByTime.set(candleTime, candle); // Overwrite if duplicate, keeping last
          });

          // Convert back to array and sort again (Map preserves insertion order for same keys)
          const uniqueArray = Array.from(uniqueByTime.values()).sort((a, b) => {
            const aTime = typeof a.time === "number" ? a.time : Number(a.time);
            const bTime = typeof b.time === "number" ? b.time : Number(b.time);
            return aTime - bTime;
          });

          // Keep only last 500 candles
          const finalArray =
            uniqueArray.length > 500 ? uniqueArray.slice(-500) : uniqueArray;

          console.log(
            `📊 Added new candle, total: ${finalArray.length}:`,
            newCandle
          );
          return finalArray;
        }
      });
    };

    socket.on("candle:update", handleCandleUpdate);

    return () => {
      socket.off("candle:update", handleCandleUpdate);
      if (isSubscribed) {
        socket.emit("candle:unsubscribe", { symbol, timeframe });
        setIsSubscribed(false);
        console.log(
          `📊 Unsubscribed from candle updates for ${symbol}:${timeframe}`
        );
      }
    };
  }, [socket, isConnected, symbol, timeframe, isSubscribed]);

  // Reset subscription flag when symbol or timeframe changes
  // realtimeCandles is already cleared in the currentSymbolTimeframe effect above
  useEffect(() => {
    setIsSubscribed(false);
    console.log(`📊 Reset subscription flag for ${symbol}:${timeframe}`);
  }, [symbol, timeframe]);

  // Refetch historical data when symbol or timeframe changes
  useEffect(() => {
    if (symbol && timeframe) {
      refetch();
    }
  }, [symbol, timeframe, refetch]);

  return {
    candles,
    isLoading,
    error,
    isConnected,
  };
};
