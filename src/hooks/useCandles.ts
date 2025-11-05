import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [realtimeCandles, setRealtimeCandles] = useState<Candle[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

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
    staleTime: 1000 * 60, // 1 minute
  });

  // Initialize realtime candles with historical data on first load or when timeframe/symbol changes
  useEffect(() => {
    if (historicalCandles) {
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
  }, [historicalCandles, symbol, timeframe]);

  // Combine historical and real-time candles
  const candles =
    realtimeCandles.length > 0 ? realtimeCandles : historicalCandles || [];

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

    // Handle candle:update events
    const handleCandleUpdate = (candle: CandleDto) => {
      console.log("📊 [WebSocket] Candle update received:", candle);

      setRealtimeCandles((prev) => {
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

  // Reset real-time candles when symbol or timeframe changes
  // This ensures clean state before fetching new data
  useEffect(() => {
    setRealtimeCandles([]);
    setIsSubscribed(false);
    console.log(`📊 Reset candles state for ${symbol}:${timeframe}`);
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
