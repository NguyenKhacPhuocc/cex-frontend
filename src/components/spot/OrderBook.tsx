"use client";
import { useState } from "react";
import { IoIosArrowRoundUp } from "react-icons/io";

// Mock data cho OrderBook
const mockAsks = [
    { price: 115312.00, amount: 0.15234, total: 17560.23 },
    { price: 115311.50, amount: 0.28456, total: 32813.45 },
    { price: 115311.00, amount: 0.42178, total: 48634.89 },
    { price: 115310.50, amount: 0.19234, total: 22180.12 },
    { price: 115310.00, amount: 0.35678, total: 41139.45 },
    { price: 115309.50, amount: 0.52341, total: 60361.78 },
    { price: 115309.00, amount: 0.18923, total: 21818.34 },
    { price: 115308.50, amount: 0.43567, total: 50239.67 },
    { price: 115308.00, amount: 0.31245, total: 36029.12 },
    { price: 115307.50, amount: 0.27890, total: 32161.45 },
];

const mockBids = [
    { price: 115306.50, amount: 0.24567, total: 28323.45 },
    { price: 115306.00, amount: 0.38912, total: 44876.23 },
    { price: 115305.50, amount: 0.19234, total: 22178.90 },
    { price: 115305.00, amount: 0.45678, total: 52681.34 },
    { price: 115304.50, amount: 0.32145, total: 37068.12 },
    { price: 115304.00, amount: 0.28934, total: 33366.78 },
    { price: 115303.50, amount: 0.51234, total: 59099.45 },
    { price: 115303.00, amount: 0.17823, total: 20548.67 },
    { price: 115302.50, amount: 0.39876, total: 45989.34 },
    { price: 115302.00, amount: 0.26789, total: 30889.12 },
];

const currentPrice = 115307.00;
const priceChange24h = -1.46; // %

type ViewMode = "all" | "asks" | "bids";

export default function OrderBook() {
    const [viewMode, setViewMode] = useState<ViewMode>("all");
    const [precision, setPrecision] = useState(2);

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
                {/* Asks (Sell Orders) */}
                {(viewMode === "all" || viewMode === "asks") && (
                    <div className="flex-1 overflow-y-auto">
                        {mockAsks.slice().reverse().map((ask, index) => (
                            <div
                                key={`ask-${index}`}
                                className="flex justify-between px-[12px] py-[2px] hover:bg-gray-50 relative"
                            >
                                <div
                                    className="absolute right-0 top-0 h-full bg-red-50"
                                    style={{ width: `${(ask.amount / 0.6) * 100}%` }}
                                ></div>
                                <span className="text-red-500 relative z-10 flex-1">{formatPrice(ask.price)}</span>
                                <span className="text-gray-900 relative z-10 flex-1 text-right">{formatAmount(ask.amount)}</span>
                                <span className="text-gray-600 relative z-10 flex-1 text-right">{formatTotal(ask.total)}</span>
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

                {/* Bids (Buy Orders) */}
                {(viewMode === "all" || viewMode === "bids") && (
                    <div className="flex-1 overflow-y-auto">
                        {mockBids.map((bid, index) => (
                            <div
                                key={`bid-${index}`}
                                className="flex justify-between px-[12px] py-[2px] hover:bg-gray-50 relative"
                            >
                                <div
                                    className="absolute right-0 top-0 h-full bg-green-50"
                                    style={{ width: `${(bid.amount / 0.6) * 100}%` }}
                                ></div>
                                <span className="text-green-500 relative z-10 flex-1">{formatPrice(bid.price)}</span>
                                <span className="text-gray-900 relative z-10 flex-1 text-right">{formatAmount(bid.amount)}</span>
                                <span className="text-gray-600 relative z-10 flex-1 text-right">{formatTotal(bid.total)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}