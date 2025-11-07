"use client";

import { useWebSocketContext } from "@/providers/WebSocketProvider";
import { useAllTickers } from "@/hooks/useAllTickers";
import { IoMdSwitch } from "react-icons/io";
import { PiCellSignalFullBold, PiCellSignalSlashBold } from "react-icons/pi";
import { useMemo, useRef, useEffect, useState } from "react";

// Helper function to format price with appropriate decimals
const formatPrice = (price: number): string => {
    if (price >= 1000) {
        return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
    } else if (price >= 1) {
        return price.toLocaleString("en-US", { maximumFractionDigits: 4 });
    } else {
        return price.toLocaleString("en-US", { maximumFractionDigits: 6 });
    }
};

// Helper function to format change percentage
const formatChange = (change24h: number): string => {
    const sign = change24h >= 0 ? "+" : "";
    return `${sign}${change24h.toFixed(2)}%`;
};

export default function SpotFooter() {
    const { isConnected } = useWebSocketContext();
    const { tickers, isLoading } = useAllTickers();
    const connectionStatus = isConnected ? "Kết nối ổn định" : "Đang kết nối...";

    // Format tickers for display - memoized to prevent unnecessary recalculations
    const displayTickers = useMemo(() => {
        return tickers.map((ticker) => ({
            symbol: ticker.pair, // Use pair (BTC/USDT) instead of symbol (BTC_USDT)
            change: formatChange(ticker.change24h),
            price: formatPrice(ticker.price),
            isPositive: ticker.change24h >= 0,
        }));
    }, [tickers]);

    // Use state to store stable tickers for animation (with debounce to prevent jank)
    const [stableTickers, setStableTickers] = useState(displayTickers);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update stable tickers with debounce to prevent animation jank
    useEffect(() => {
        if (displayTickers.length > 0) {
            // Clear any pending updates
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            // Update during next animation frame for smooth transition
            const rafId = requestAnimationFrame(() => {
                // Small delay to batch updates and prevent animation jank
                updateTimeoutRef.current = setTimeout(() => {
                    setStableTickers(displayTickers);
                }, 150); // Small delay to batch updates
            });

            return () => {
                cancelAnimationFrame(rafId);
                if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                }
            };
        } else {
            // If no tickers, update immediately
            setStableTickers(displayTickers);
        }
    }, [displayTickers]);

    // Use stable tickers for rendering to prevent animation jank
    const tickersToRender = stableTickers.length > 0 ? stableTickers : displayTickers;

    // Duplicate tickers for seamless scrolling animation - memoized
    const duplicatedTickers = useMemo(() => {
        if (tickersToRender.length === 0) return [];
        return [...tickersToRender, ...tickersToRender];
    }, [tickersToRender]);
    return (
        <div className="fixed bottom-0 left-0 right-0 dark:bg-[#181A20] bg-white w-full overflow-hidden py-1 z-50 border-t-4 dark:border-[#0f1119] border-gray-100">
            <div className="flex gap-2 text-xs items-center justify-between dark:text-white text-black px-4">
                <div
                    className={`flex gap-2 items-center shrink-0 w-auto justify-center ${isConnected ? "text-[#2ebd85]" : "text-red-400"
                        }`}
                >
                    {isConnected === true ? (
                        <PiCellSignalFullBold className="text-[18px]" />
                    ) : (
                        <PiCellSignalSlashBold className="text-[18px]" />
                    )}
                    {connectionStatus}
                </div>
                <div className="w-[70%] flex items-center flex-row gap-1">
                    <IoMdSwitch className="text-[16px] text-muted-foreground hover:text-foreground text-gray-400" />
                    <div className="overflow-hidden flex-1">
                        {isLoading && displayTickers.length === 0 ? (
                            <div className="flex items-center justify-center py-1">
                                <span className="text-gray-400 text-xs">Đang tải...</span>
                            </div>
                        ) : (
                            <div
                                className="animate-scroll flex gap-6 whitespace-nowrap will-change-transform"
                                key="ticker-scroll-container"
                            >
                                {duplicatedTickers.length > 0 ? (
                                    duplicatedTickers.map((ticker, idx) => (
                                        <div
                                            key={`${ticker.symbol}-${idx}`}
                                            className="flex items-center gap-1 shrink-0 min-w-[180px] max-w-[220px]"
                                        >
                                            <span className="font-medium whitespace-nowrap">{ticker.symbol}</span>
                                            <span
                                                className={`whitespace-nowrap ${ticker.isPositive
                                                    ? "text-[#2ebd85]"
                                                    : "text-[#f6465d]"
                                                    }`}
                                            >
                                                {ticker.change}
                                            </span>
                                            <span className="dark:text-gray-300 text-gray-600 whitespace-nowrap">
                                                {ticker.price}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center py-1">
                                        <span className="text-gray-400 text-xs">Không có dữ liệu</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="text-gray-300">|</div>
                </div>

                <div className="flex w-auto gap-4 justify-end ">
                    <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
                        Thông báo
                    </div>
                    <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
                        Tuỳ chọn Cookie
                    </div>
                    <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
                        Hỗ trợ trực tuyến
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
      `}</style>
        </div>
    );
}