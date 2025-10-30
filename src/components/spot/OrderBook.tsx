"use client";
import { useState } from "react";
import { IoIosArrowRoundUp } from "react-icons/io";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useSpot } from "@/contexts/SpotContext";

/**
 * OrderBook Component - Real-time WebSocket Integration
 * 
 * Data từ Redis ZSET qua WebSocket:
 * - Backend sorted sẵn by price (asks ascending, bids descending)
 * - Aggregate by price level
 * - Real-time updates khi có orders mới/matched
 */

const currentPrice = 115307.00;
const priceChange24h = -1.46; // %

type ViewMode = "all" | "asks" | "bids";

export default function OrderBook() {
    const [viewMode, setViewMode] = useState<ViewMode>("all");
    const [precision, setPrecision] = useState(2);
    const { symbol } = useSpot();

    // 🔥 Connect to OrderBook WebSocket
    const { orderBook, isLoading, isConnected } = useOrderBook(symbol);

    // Real-time data từ WebSocket (đã sorted từ backend)
    const sortedAsks = orderBook?.asks || [];
    const sortedBids = orderBook?.bids || [];

    // Tìm maxAmount trong cả asks và bids để normalize width
    const maxAmount = Math.max(
        ...sortedAsks.map(ask => ask.amount),
        ...sortedBids.map(bid => bid.amount),
        1 // Fallback to 1 để tránh division by zero
    );

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

    return (
        <div className="bg-white w-[30%] rounded-[8px] flex flex-col h-full">
            <div className=" px-[16px] py-[10px]  text-[14px] font-[500]  border-b border-[#F5F5F5]">Sổ lệnh</div>

            {/* Header */}
            <div className="px-[12px] py-[8px]  border-gray-200">
                <div className="flex justify-between items-center mb-[8px]">
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
                        className="text-[12px] text-gray-600 border border-gray-300 rounded px-[8px] py-[2px]"
                    >
                        <option value={0}>0</option>
                        <option value={1}>0.0</option>
                        <option value={2}>0.00</option>
                    </select>
                </div>
                <div className="flex justify-between text-[12px] text-gray-500">
                    <span className="flex-1">Giá(USDT)</span>
                    <span className="flex-1 text-right">Số lượng(BTC)</span>
                    <span className="flex-1 text-right">Tổng</span>
                </div>
            </div>

            {/* Order Book Content */}
            <div className="flex-1 overflow-hidden flex flex-col text-[12px]">
                {/* Asks (Sell Orders) - Display từ thấp -> cao (gần current price nhất ở dưới) */}
                {(viewMode === "all" || viewMode === "asks") && (
                    <div className="flex-1 overflow-y-auto">
                        {sortedAsks.slice().map((ask, index) => (
                            <div
                                key={`ask-${index}`}
                                className="group flex justify-between px-[12px] py-[2px] hover:bg-gray-50 relative"
                            >
                                <div
                                    className="absolute right-0 top-0 h-full bg-[#FBE9EB] dark:bg-[#2F1E26]"
                                    style={{ width: `${calculateWidth(ask.amount)}%` }}
                                ></div>
                                <span className="text-red-500 relative z-10 flex-1">{formatPrice(ask.price)}</span>
                                <span className="text-gray-900 relative z-10 flex-1 text-right">{formatAmount(ask.amount)}</span>
                                <span className="text-gray-600 relative z-10 flex-1 text-right">{formatTotal(ask.total)}</span>
                                <div className="w-[50px] absolute top-0 right-0 bg-amber-50 group-hover:block hidden z-99 ">
                                    aaaaaa
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Current Price */}
                <div className="px-[12px] py-[8px] border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-[8px]">
                        <div className="flex items-center">
                            <span className={`text-[20px] font-[500] ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatPrice(currentPrice)}
                            </span>
                            <IoIosArrowRoundUp className={`text-[22px] ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                        <span className="text-[12px] text-gray-500">
                            ${formatPrice(currentPrice)}
                        </span>
                    </div>
                    {/* <div className={`text-[12px] ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {priceChange24h >= 0 ? '+' : ''}{priceChange24h}%
                    </div> */}
                </div>

                {/* Bids (Buy Orders) - Display từ cao -> thấp (gần current price nhất ở trên) */}
                {(viewMode === "all" || viewMode === "bids") && (
                    <div className="flex-1 overflow-y-auto">
                        {sortedBids.map((bid, index) => (
                            <div
                                key={`bid-${index}`}
                                className="group flex justify-between px-[12px] py-[2px] hover:bg-gray-50 relative"
                            >
                                <div
                                    className="absolute right-0 top-0 h-full bg-[#EAF8F2] dark:bg-[#1B2A2A]"
                                    style={{ width: `${calculateWidth(bid.amount)}%` }}
                                ></div>
                                <span className="text-green-500 relative z-10 flex-1">{formatPrice(bid.price)}</span>
                                <span className="text-gray-900 relative z-10 flex-1 text-right">{formatAmount(bid.amount)}</span>
                                <span className="text-gray-600 relative z-10 flex-1 text-right">{formatTotal(bid.total)}</span>
                                <div className="w-[50px] absolute top-0 right-[-30px] bg-gray-400 group-hover:block hidden z-9999 ">
                                    aaaaaa
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}