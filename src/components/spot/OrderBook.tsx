"use client";
import { useState, useEffect } from "react";
import { IoIosArrowRoundUp } from "react-icons/io";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useTicker } from "@/hooks/useTicker";
import { useSpot } from "@/contexts/SpotContext";

/**
 * OrderBook Component - Real-time WebSocket Integration
 * 
 * Data từ Redis ZSET qua WebSocket:
 * - Backend sorted sẵn by price (asks descending, bids descending)
 * - Aggregate by price level
 * - Real-time updates khi có orders mới/matched
 */

type ViewMode = "all" | "asks" | "bids";

interface HoveredOrder {
    side: "ask" | "bid";
    index: number;
}

export default function OrderBook() {
    const [viewMode, setViewMode] = useState<ViewMode>("all");
    const [precision, setPrecision] = useState(2);
    const [hoveredOrder, setHoveredOrder] = useState<HoveredOrder | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { symbol } = useSpot();

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
    const priceChange24h = ticker?.change24h || 0;

    // Real-time data từ WebSocket (đã sorted từ backend)
    const sortedAsks = orderBook?.asks || [];
    const sortedBids = orderBook?.bids || [];

    // Tìm maxAmount trong cả asks và bids để normalize width
    const allAmounts = [
        ...sortedAsks.map(ask => ask.amount),
        ...sortedBids.map(bid => bid.amount),
    ];
    const maxAmount = allAmounts.length > 0 ? Math.max(...allAmounts) : 1;

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

    return (
        <div className="relative w-[30%]">
            <div className="relative bg-white dark:bg-[#181A20] rounded-[8px] flex flex-col overflow-visible h-full">
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
                <div className="flex-1 overflow-hidden flex flex-col text-[12px] relative h-full">
                    {/* Asks (Sell Orders) - Display từ cao -> thấp */}
                    {(viewMode === "all" || viewMode === "asks") && (
                        <div className="flex-1 h-full overflow-hidden relative align-text-bottom">
                            {sortedAsks.slice().map((ask, index) => {
                                const isAfterHover = hoveredOrder?.side === "ask" && index >= hoveredOrder.index;
                                const isHovered = hoveredOrder?.side === "ask" && index === hoveredOrder.index;

                                return (
                                    <div
                                        key={`ask-${index}`}
                                        className="flex justify-between px-[12px] py-px relative"
                                        onMouseEnter={() => setHoveredOrder({ side: "ask", index })}
                                        onMouseLeave={() => setHoveredOrder(null)}
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
                                        <span className={`text-[20px] font-medium ${priceChange24h >= 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}>
                                            {formatPrice(currentPrice)}
                                        </span>
                                        <IoIosArrowRoundUp
                                            className={`text-[22px] ${priceChange24h >= 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}
                                            style={{ transform: priceChange24h < 0 ? 'rotate(180deg)' : 'none' }}
                                        />
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
                        <div className="flex-1 h-full overflow-hidden relative">
                            {sortedBids.map((bid, index) => {
                                const isAfterHover = hoveredOrder?.side === "bid" && index <= hoveredOrder.index;
                                const isHovered = hoveredOrder?.side === "bid" && index === hoveredOrder.index;

                                return (
                                    <div
                                        key={`bid-${index}`}
                                        className="flex justify-between px-[12px] py-px relative"
                                        onMouseEnter={() => setHoveredOrder({ side: "bid", index })}
                                        onMouseLeave={() => setHoveredOrder(null)}
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

                {/* Tooltips outside of overflow-hidden container */}
                {/* Tooltip for Ask */}
                {hoveredOrder?.side === "ask" && (() => {
                    const { totalBTC, totalUSDT } = calculateCumulative(hoveredOrder.index, "ask");
                    const avgPrice = totalBTC > 0 ? totalUSDT / totalBTC : 0;
                    const rowHeight = 20; // Height of each row in pixels
                    const headerHeight = 100; // Title + Header section
                    const tooltipTop = headerHeight + hoveredOrder.index * rowHeight + rowHeight / 2;
                    return (
                        <div className="absolute right-[16px] bg-[#DFE1E5] shadow-lg rounded-[4px] p-[12px] min-w-[180px] z-50 border border-gray-200 dark:border-gray-700 pointer-events-none" style={{ top: `${tooltipTop}px`, right: "-180px", transform: 'translateY(-50%)' }}>
                            {/* Arrow pointing to the hovered row */}
                            <div className="absolute left-[-8px] top-[50%] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#DFE1E5] border-b-8 border-b-transparent"></div>
                            <div className="flex flex-col gap-[4px] text-[12px] relative">
                                <div className="flex justify-between">
                                    <span className="text-gray-900 ">Giá trung bình:</span>
                                    <span className="font-medium text-gray-900 ">{formatPrice(avgPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 ">Tổng BTC:</span>
                                    <span className="font-medium text-gray-900 ">{formatAmount(totalBTC)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 ">Tổng USDT:</span>
                                    <span className="font-medium text-gray-900 ">{formatTotal(totalUSDT)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Tooltip for Bid */}
                {hoveredOrder?.side === "bid" && (() => {
                    const { totalBTC, totalUSDT } = calculateCumulative(hoveredOrder.index, "bid");
                    const avgPrice = totalBTC > 0 ? totalUSDT / totalBTC : 0;
                    const rowHeight = 20; // Height of each row in pixels
                    const headerHeight = 100; // Title + Header section
                    const asksHeight = viewMode === "all" ? sortedAsks.length * rowHeight : 0;
                    const currentPriceHeight = 60; // Approximate height of current price section
                    const tooltipTop = headerHeight + asksHeight + currentPriceHeight + hoveredOrder.index * rowHeight + rowHeight / 2 + 40;
                    return (
                        <div className="absolute right-[16px] bg-[#DFE1E5] shadow-lg rounded-[4px] p-[12px] min-w-[180px] z-50 border border-gray-200 dark:border-gray-700 pointer-events-none" style={{ top: `${tooltipTop}px`, right: "-180px", transform: 'translateY(-50%)' }}>
                            {/* Arrow pointing to the hovered row */}
                            <div className="absolute left-[-8px] top-[50%] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#DFE1E5] border-b-8 border-b-transparent"></div>
                            <div className="flex flex-col gap-[4px] text-[12px] relative">
                                <div className="flex justify-between">
                                    <span className="text-gray-900 ">Giá trung bình:</span>
                                    <span className="font-medium text-gray-900 ">{formatPrice(avgPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 ">Tổng BTC:</span>
                                    <span className="font-medium text-gray-900 ">{formatAmount(totalBTC)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-900 ">Tổng USDT:</span>
                                    <span className="font-medium text-gray-900">{formatTotal(totalUSDT)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}