"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { IoIosArrowRoundUp } from "react-icons/io";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useTicker } from "@/hooks/useTicker";
import { useSpot } from "@/contexts/SpotContext";
import { useMarketTrades } from "@/hooks/useTrades";


type ViewMode = "all" | "asks" | "bids";

interface HoveredOrder {
    side: "ask" | "bid";
    index: number;
}

export default function OrderBook() {
    const [viewMode, setViewMode] = useState<ViewMode>("all");
    const [precision, setPrecision] = useState(2);
    const [hoveredOrder, setHoveredOrder] = useState<HoveredOrder | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { symbol, timeframe } = useSpot();
    const { trades } = useMarketTrades(symbol);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setIsDarkMode(isDark);
        };

        // Check on mount
        checkDarkMode();

        // Watch for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // 🔥 Connect to OrderBook WebSocket
    const { orderBook } = useOrderBook(symbol);

    // 🔥 Get ticker data (last trade price, change24h)
    const { ticker } = useTicker(symbol);

    // Current price = last trade price, fallback to 0 if not loaded
    const currentPrice = ticker?.price || 0;

    // Track last price for color comparison using ref to avoid re-render issues
    const prevPriceRef = useRef<number>(0);
    const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);

    // Update price direction when currentPrice changes
    useEffect(() => {
        if (currentPrice > 0) {
            if (prevPriceRef.current > 0) {
                if (currentPrice > prevPriceRef.current) {
                    setPriceDirection('up');
                } else if (currentPrice < prevPriceRef.current) {
                    setPriceDirection('down');
                }
                // If currentPrice === prevPriceRef.current, keep the previous direction (don't change)
            }
            prevPriceRef.current = currentPrice;
        }
    }, [currentPrice]);

    // Real-time data từ WebSocket (đã sorted từ backend)
    // Giới hạn số lượng hiển thị để tránh vỡ giao diện
    // Nếu viewMode = "all": 20 orders mỗi bên
    // Nếu viewMode = "asks" | "bids": 42 orders để tận dụng không gian
    const MAX_ORDERS_DISPLAY = viewMode === "all" ? 19 : 38;

    // Memoize sorted arrays để tránh re-compute không cần thiết
    // và đảm bảo reference stability khi data không thay đổi
    // Backend returns: asks ASCENDING (lowest first = best ask), bids DESCENDING (highest first = best bid)
    // Frontend displays: asks từ thấp -> cao (best ask ở đầu), bids từ cao -> thấp (best bid ở đầu)
    const sortedAsks = useMemo(() => {
        // Backend đã sort ASCENDING (lowest first), giữ nguyên để best ask ở đầu
        return (orderBook?.asks || []).slice(0, MAX_ORDERS_DISPLAY);
    }, [orderBook?.asks, MAX_ORDERS_DISPLAY]);

    const sortedBids = useMemo(() => {
        // Backend đã sort DESCENDING (highest first), giữ nguyên để best bid ở đầu
        return (orderBook?.bids || []).slice(0, MAX_ORDERS_DISPLAY);
    }, [orderBook?.bids, MAX_ORDERS_DISPLAY]);

    // Tìm maxAmount trong cả asks và bids để normalize width
    // Memoize để tránh re-compute khi không cần thiết
    const maxAmount = useMemo(() => {
        const allAmounts = [
            ...sortedAsks.map(ask => ask.amount),
            ...sortedBids.map(bid => bid.amount),
        ];
        return allAmounts.length > 0 ? Math.max(...allAmounts) : 1;
    }, [sortedAsks, sortedBids]);

    // Tính width percentage cho depth bar
    const calculateWidth = (amount: number): number => {
        return (amount / maxAmount) * 100;
    };

    const formatNumber = (num: number, decimals: number) => {
        // Format số kiểu Châu Âu: 115.000,34
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    const formatPrice = (price: number) => {
        return formatNumber(price, precision);
    };

    const formatAmount = (amount: number) => {
        return formatNumber(amount, 5);
    };

    const formatTotal = (total: number) => {
        return formatNumber(total, 2);
    };

    // Tính tổng từ đầu đến ô đang hover
    const calculateCumulative = (index: number, side: "ask" | "bid") => {
        const orders = side === "ask" ? sortedAsks : sortedBids;
        let totalBTC = 0;
        let totalUSDT = 0;
        if (!orders || orders.length === 0) {
            return { totalBTC, totalUSDT };
        }

        const maxIndex = Math.min(index, orders.length - 1);
        for (let i = 0; i <= maxIndex; i++) {
            if (orders[i]) {
                totalBTC += orders[i].amount || 0;
                totalUSDT += orders[i].total || 0;
            }
        }

        return { totalBTC, totalUSDT };
    };

    // Handle tooltip position calculation
    const handleRowHover = (side: "ask" | "bid", index: number, element: HTMLDivElement | null) => {
        if (element && containerRef.current) {
            const rect = element.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            setHoveredOrder({ side, index });
            // Tính toán vị trí tooltip: bên phải của row, căn giữa theo chiều dọc
            const rowTopRelative = rect.top - containerRect.top; // Top của row relative to container
            const rowCenterY = rowTopRelative + rect.height / 2; // Center của row
            const rowRightRelative = rect.right - containerRect.left; // Vị trí mép phải của row relative to container

            setTooltipPosition({
                top: rowCenterY,
                left: rowRightRelative + 8, // 8px spacing từ mép phải của row
            });
        }
    };

    const handleRowLeave = () => {
        setHoveredOrder(null);
        setTooltipPosition(null);
    };

    // State để force re-render khi thời gian trôi qua
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Chuyển đổi timeframe thành milliseconds
    const getTimeframeMs = (tf: string): number => {
        const timeframeMap: { [key: string]: number } = {
            "1m": 60 * 1000,
            "15m": 15 * 60 * 1000,
            "30m": 30 * 60 * 1000,
            "1h": 60 * 60 * 1000,
            "4h": 4 * 60 * 60 * 1000,
            "1d": 24 * 60 * 60 * 1000,
            "1w": 7 * 24 * 60 * 60 * 1000,
        };
        return timeframeMap[tf] || 60 * 1000; // Default to 1 minute
    };

    // Update currentTime mỗi giây để tính toán realtime
    useEffect(() => {
        const timeframeMs = getTimeframeMs(timeframe);
        // Update interval dựa trên timeframe: ngắn hơn thì update thường xuyên hơn
        const updateInterval = Math.min(timeframeMs / 10, 1000); // Update tối đa mỗi giây, hoặc 10% của timeframe

        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, updateInterval);

        return () => clearInterval(interval);
    }, [timeframe]);

    // Tính toán % mua/bán theo timeframe (realtime)
    const { buyPercent, sellPercent } = useMemo(() => {
        if (!trades || trades.length === 0) {
            return { buyPercent: 50, sellPercent: 50 };
        }

        const timeframeMs = getTimeframeMs(timeframe);
        const startTime = currentTime - timeframeMs;

        // Filter trades trong timeframe
        const filteredTrades = trades.filter((trade) => {
            const tradeTime = typeof trade.timestamp === "string"
                ? new Date(trade.timestamp).getTime()
                : trade.timestamp.getTime();
            return tradeTime >= startTime;
        });

        // Tính tổng volume mua và bán
        let buyVolume = 0;
        let sellVolume = 0;

        filteredTrades.forEach((trade) => {
            if (trade.side === "BUY") {
                buyVolume += trade.amount;
            } else {
                sellVolume += trade.amount;
            }
        });

        const totalVolume = buyVolume + sellVolume;
        const buyPercent = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;
        const sellPercent = totalVolume > 0 ? (sellVolume / totalVolume) * 100 : 50;

        return { buyPercent, sellPercent };
    }, [trades, timeframe, currentTime]);

    return (
        <div id="orderbook" className="relative w-[30%] h-full">
            <div ref={containerRef} className="relative bg-white dark:bg-[#181A20] rounded-[8px] flex flex-col overflow-visible h-full">
                <div className=" px-[16px] py-[10px]  text-[14px] font-[500]  border-b border-[#F5F5F5] dark:border-[#373c43] dark:text-[#eaecef]">Sổ lệnh</div>

                {/* Header */}
                <div className="px-[12px] py-[8px]  border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-[4px]">
                        <div className="flex gap-[8px]">
                            <button
                                onClick={() => setViewMode("all")}
                                className={`p-[4px] rounded ${viewMode === "all" ? "bg-gray-100" : ""}`}
                            >
                                <div className="flex flex-col gap-[1px]">
                                    <div className="flex gap-[1px]">
                                        <div className="w-[3px] h-[3px] bg-red-500"></div>
                                        <div className="w-[3px] h-[3px] bg-red-500"></div>
                                    </div>
                                    <div className="flex gap-[1px]">
                                        <div className="w-[3px] h-[3px] bg-green-500"></div>
                                        <div className="w-[3px] h-[3px] bg-green-500"></div>
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode("asks")}
                                className={`p-[4px] rounded ${viewMode === "asks" ? "bg-gray-100" : ""}`}
                            >
                                <div className="flex flex-col gap-[1px]">
                                    <div className="flex gap-[1px]">
                                        <div className="w-[3px] h-[3px] bg-red-500"></div>
                                        <div className="w-[3px] h-[3px] bg-red-500"></div>
                                    </div>
                                    <div className="flex gap-[1px]">
                                        <div className="w-[3px] h-[3px] bg-red-500"></div>
                                        <div className="w-[3px] h-[3px] bg-red-500"></div>
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode("bids")}
                                className={`p-[4px] rounded ${viewMode === "bids" ? "bg-gray-100" : ""}`}
                            >
                                <div className="flex flex-col gap-[1px]">
                                    <div className="flex gap-[1px]">
                                        <div className="w-[3px] h-[3px] bg-green-500"></div>
                                        <div className="w-[3px] h-[3px] bg-green-500"></div>
                                    </div>
                                    <div className="flex gap-[1px]">
                                        <div className="w-[3px] h-[3px] bg-green-500"></div>
                                        <div className="w-[3px] h-[3px] bg-green-500"></div>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <select
                            value={precision}
                            onChange={(e) => setPrecision(Number(e.target.value))}
                            className="text-[12px] text-gray-600 dark:text-[#eaecef] rounded px-[8px] py-[2px]"
                        >
                            <option value={0}>0</option>
                            <option value={1}>0.0</option>
                            <option value={2}>0.00</option>
                        </select>
                    </div>
                    <div className="flex justify-between text-[12px] text-gray-500">
                        <span className="flex-1">Giá (USDT)</span>
                        <span className="flex-1 text-right">Số lượng (BTC)</span>
                        <span className="flex-1 text-right">Tổng</span>
                    </div>
                </div>

                {/* Order Book Content */}
                <div className="flex-1 flex flex-col text-[12px] relative h-full overflow-hidden">
                    {/* Asks (Sell Orders) - Display từ thấp -> cao (best ask = lowest price ở đầu, gần current price) */}
                    {/* Backend returns asks ASCENDING (lowest first), so asks[0] = best ask */}
                    {(viewMode === "all" || viewMode === "asks") && (
                        <div className={`relative flex flex-col justify-end overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${viewMode === "all" ? "flex-1 max-h-[calc(50%-18px)]" : "flex-1"}`}>
                            {sortedAsks.slice().reverse().map((ask, index) => {
                                const isAfterHover = hoveredOrder?.side === "ask" && index >= hoveredOrder.index;
                                const isHovered = hoveredOrder?.side === "ask" && index === hoveredOrder.index;

                                return (
                                    <div
                                        key={`ask-${ask.price}`}
                                        className="flex justify-between px-[12px] py-px relative cursor-pointer"
                                        onMouseEnter={(e) => handleRowHover("ask", index, e.currentTarget)}
                                        onMouseLeave={handleRowLeave}
                                        style={{
                                            borderTop: isHovered ? '1px dashed #707a8a' : 'none',
                                        }}
                                    >
                                        <div
                                            className="absolute left-0 top-0 right-0 bottom-0 transition-colors  "
                                            style={{
                                                opacity: isAfterHover ? 1 : 0,
                                                backgroundColor: isAfterHover
                                                    ? (isDarkMode ? '#1E222A' : '#f8f8f8')
                                                    : 'transparent',

                                            }}
                                        ></div>
                                        <div
                                            className="absolute right-0 top-0 h-full bg-[#FEECEE] dark:bg-[#2F1E26]"
                                            style={{ width: `${calculateWidth(ask.amount)}%` }}
                                        ></div>
                                        <span className="text-[#f6465d] relative z-10 flex-1">{formatPrice(ask.price)}</span>
                                        <span className="text-gray-900 relative z-10 flex-1 text-right dark:text-[#eaecef]">{formatAmount(ask.amount)}</span>
                                        <span className="text-gray-600 relative z-10 flex-1 text-right dark:text-[#eaecef]">{formatTotal(ask.total)}</span>
                                    </div>
                                );
                            })}

                        </div>
                    )}

                    {/* Current Price - Last Trade Price */}
                    <div className="px-[7px] py-[8px] border-gray-200 bg-gray-50 dark:bg-[#181A20] ">
                        <div className="flex h-[36px] items-end gap-[4px]">
                            <div className="flex items-center">
                                {currentPrice > 0 ? (
                                    <>
                                        <span className={`text-[20px] font-medium ${priceDirection === 'up'
                                            ? 'text-[#2ebd85]'
                                            : priceDirection === 'down'
                                                ? 'text-[#f6465d]'
                                                : 'text-gray-900 dark:text-[#eaecef]'
                                            }`}>
                                            {formatPrice(currentPrice)}
                                        </span>
                                        {priceDirection && (
                                            <IoIosArrowRoundUp
                                                className={`text-[22px] ${priceDirection === 'up' ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}
                                                style={{ transform: priceDirection === 'down' ? 'rotate(180deg)' : 'none' }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <span className="text-[20px] font-medium text-gray-400">
                                        0,00
                                    </span>
                                )}
                            </div>
                            <span className="text-[12px] text-gray-500 mb-[5px] dark:text-[#707a8a]">
                                ${formatPrice(currentPrice)}
                            </span>
                        </div>
                    </div>

                    {/* Bids (Buy Orders) - Display từ cao -> thấp (gần current price nhất ở trên) */}
                    {(viewMode === "all" || viewMode === "bids") && (
                        <div className={`relative overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${viewMode === "all" ? "flex-1 max-h-[calc(50%-18px)]" : "flex-1"}`}>
                            {sortedBids.map((bid, index) => {
                                const isAfterHover = hoveredOrder?.side === "bid" && index <= hoveredOrder.index;
                                const isHovered = hoveredOrder?.side === "bid" && index === hoveredOrder.index;

                                return (
                                    <div
                                        key={`bid-${bid.price}`}
                                        className="flex justify-between px-[12px] py-px relative cursor-pointer"
                                        onMouseEnter={(e) => handleRowHover("bid", index, e.currentTarget)}
                                        onMouseLeave={handleRowLeave}
                                        style={{
                                            borderBottom: isHovered ? '1px dashed #707a8a' : 'none',
                                        }}
                                    >
                                        <div
                                            className="absolute left-0 top-0 right-0 bottom-0 transition-colors"
                                            style={{
                                                opacity: isAfterHover ? (isDarkMode ? 1 : 0.5) : 0,
                                                backgroundColor: isAfterHover
                                                    ? (isDarkMode ? '#1E222A' : '#F7F2F2')
                                                    : 'transparent'
                                            }}
                                        ></div>
                                        <div
                                            className="absolute right-0 top-0 h-full bg-[#FEECEE] dark:bg-[#1B2A2A]"
                                            style={{ width: `${calculateWidth(bid.amount)}%` }}
                                        ></div>
                                        <span className="text-[#2ebd85] relative z-10 flex-1">{formatPrice(bid.price)}</span>
                                        <span className="text-gray-900 relative z-10 flex-1 text-right dark:text-[#eaecef]">{formatAmount(bid.amount)}</span>
                                        <span className="text-gray-600 relative z-10 flex-1 text-right dark:text-[#eaecef]">{formatTotal(bid.total)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Tooltip - Render outside overflow container */}
                {hoveredOrder && tooltipPosition && (() => {
                    const { totalBTC, totalUSDT } = calculateCumulative(hoveredOrder.index, hoveredOrder.side);
                    const avgPrice = totalBTC > 0 ? totalUSDT / totalBTC : 0;

                    return (
                        <div
                            className="absolute z-[9999] dark:bg-gray-200 bg-[#DFE1E5] dark:text-black text-gray-900 p-[12px] rounded-[4px] shadow-lg border border-gray-200 dark:border-gray-700 pointer-events-none min-w-[180px] whitespace-nowrap"
                            style={{
                                top: `${tooltipPosition.top}px`,
                                left: `${tooltipPosition.left}px`,
                                transform: 'translateY(-50%)',
                            }}
                        >
                            {/* Arrow pointing to the row */}
                            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] dark:border-r-gray-300 border-r-[#DFE1E5]"></div>
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] dark:border-r-gray-200 border-r-[#DFE1E5]"></div>
                            <div className="flex flex-col gap-[4px] text-[12px] relative">
                                <div className="flex justify-between">
                                    <span className="text-gray-900 dark:text-black">Giá trung bình:</span>
                                    <span className="font-medium text-gray-900 dark:text-black">{formatPrice(avgPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 dark:text-black">Tổng BTC:</span>
                                    <span className="font-medium text-gray-900 dark:text-black">{formatAmount(totalBTC)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 dark:text-black">Tổng USDT:</span>
                                    <span className="font-medium text-gray-900 dark:text-black">{formatTotal(totalUSDT)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}
                <div className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="dark:text-white text-black">
                            B <span className="text-green-400">{buyPercent.toFixed(1)}%</span>
                        </span>
                        <div className="flex-1 flex h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-green-400" style={{ width: `${buyPercent}%` }} />
                            <div className="bg-red-400" style={{ width: `${sellPercent}%` }} />
                        </div>
                        <span className="dark:text-white text-black">
                            <span className="text-red-400">{sellPercent.toFixed(1)}%</span> S
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}