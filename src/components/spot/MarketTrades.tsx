"use client";
import { useState } from "react";

// Mock data cho market trades
const mockTrades = [
    { price: 114473.32, amount: 0.00010, time: "17:14:18", type: "sell" },
    { price: 114473.33, amount: 0.00009, time: "17:14:18", type: "buy" },
    { price: 114473.33, amount: 0.00044, time: "17:14:18", type: "buy" },
    { price: 114473.33, amount: 0.00007, time: "17:14:18", type: "buy" },
    { price: 114473.33, amount: 0.00009, time: "17:14:18", type: "buy" },
    { price: 114473.33, amount: 0.00014, time: "17:14:18", type: "buy" },
    { price: 114473.33, amount: 0.00009, time: "17:14:18", type: "buy" },
    { price: 114473.32, amount: 0.00013, time: "17:14:17", type: "sell" },
    { price: 114473.32, amount: 0.00011, time: "17:14:17", type: "sell" },
    { price: 114473.32, amount: 0.00162, time: "17:14:15", type: "sell" },
    { price: 114473.32, amount: 0.09846, time: "17:14:15", type: "sell" },
    { price: 114473.33, amount: 0.00036, time: "17:14:14", type: "buy" },
    { price: 114473.32, amount: 0.06005, time: "17:14:14", type: "sell" },
    { price: 114473.33, amount: 0.00015, time: "17:14:13", type: "buy" },
    { price: 114473.32, amount: 0.00021, time: "17:14:12", type: "sell" },
];

type TabType = "market" | "myTrades";

export default function MarketTrades() {
    const [activeTab, setActiveTab] = useState<TabType>("market");

    const formatNumber = (num: number, decimals: number) => {
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    return (
        <div className="flex-1 bg-white rounded-[8px] flex flex-col">
            {/* Tabs */}
            <div className="px-[16px] pt-[12px] border-b border-gray-200">
                <div className="flex gap-[24px]">
                    <button
                        onClick={() => setActiveTab("market")}
                        className={`text-[14px] pb-[12px] transition-colors ${activeTab === "market"
                            ? "text-black font-[500] border-b-2 border-[#FDDD5D]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Thị trường giao dịch
                    </button>
                    <button
                        onClick={() => setActiveTab("myTrades")}
                        className={`text-[14px] pb-[12px] transition-colors ${activeTab === "myTrades"
                            ? "text-black font-[500] border-b-2 border-[#FDDD5D]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Giao dịch của tôi
                    </button>
                </div>
            </div>

            {/* Table Header */}
            <div className="px-[16px] py-[8px] border-b border-gray-100">
                <div className="grid grid-cols-3 gap-[8px] text-[12px] text-gray-500">
                    <div>Giá (USDT)</div>
                    <div className="text-right">Số lượng (BTC)</div>
                    <div className="text-right">Thời gian</div>
                </div>
            </div>

            {/* Trades List */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                {activeTab === "market" ? (
                    mockTrades.map((trade, index) => (
                        <div
                            key={index}
                            className="px-[16px] py-[4px] h-[20px] hover:bg-gray-50 transition-colors"
                        >
                            <div className="grid grid-cols-3 gap-[8px] text-[12px]">
                                <div
                                    className={` tabular-nums ${trade.type === "buy" ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    {formatNumber(trade.price, 2)}
                                </div>
                                <div className="text-right text-gray-900 tabular-nums">
                                    {trade.amount.toFixed(5)}
                                </div>
                                <div className="text-right text-gray-600 tabular-nums">
                                    {trade.time}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-[12px]">
                        Chưa có giao dịch
                    </div>
                )}
            </div>
        </div>
    );
}