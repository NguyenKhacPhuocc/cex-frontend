"use client";
import { useState, useEffect } from "react";
import { useSpot } from "@/contexts/SpotContext";
import { useAuth } from "@/hooks/useAuth";
import { useMarketTrades, useUserTrades } from "@/hooks/useTrades";

type TabType = "market" | "myTrades";

export default function MarketTrades() {
    const [activeTab, setActiveTab] = useState<TabType>("market");
    const { symbol } = useSpot();
    const { isLogin } = useAuth();

    // Market trades (public, real-time)
    const { trades: marketTrades, isLoading: marketLoading } = useMarketTrades(symbol);

    // User trades (private, requires auth)
    const { data: userTrades, isLoading: userLoading } = useUserTrades(symbol, isLogin && activeTab === "myTrades");

    // Debug logs
    useEffect(() => {
        console.log(`🖼️ [MarketTrades Component] Market trades (${marketTrades?.length || 0}):`, marketTrades);
    }, [marketTrades]);

    useEffect(() => {
        console.log(`🖼️ [MarketTrades Component] User trades (${userTrades?.length || 0}):`, userTrades);
    }, [userTrades]);

    const formatNumber = (num: number | undefined, decimals: number): string => {
        if (typeof num !== 'number' || isNaN(num)) {
            return '0';
        }
        // After typeof check, TypeScript knows num is a valid number
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    const formatAmount = (amount: number | undefined): string => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '0.00000';
        }
        return amount.toFixed(5);
    };

    const formatTime = (timestamp: Date | string | undefined): string => {
        if (!timestamp) return '--:--:--';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            console.warn('⚠️ Invalid timestamp:', timestamp);
            return '--:--:--';
        }
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="flex-1 bg-white rounded-[8px] flex flex-col">
            {/* Tabs */}
            <div className="px-[16px] pt-[12px] border-b border-gray-200">
                <div className="flex gap-[24px]">
                    <button
                        onClick={() => setActiveTab("market")}
                        className={`text-[14px] pb-[12px] transition-colors ${activeTab === "market"
                            ? "text-black font-medium border-b-2 border-[#FDDD5D]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Thị trường giao dịch
                    </button>
                    <button
                        onClick={() => setActiveTab("myTrades")}
                        className={`text-[14px] pb-[12px] transition-colors ${activeTab === "myTrades"
                            ? "text-black font-medium border-b-2 border-[#FDDD5D]"
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
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400  max-h-[420px]">
                {activeTab === "market" ? (
                    marketLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-[12px]">
                            Đang tải...
                        </div>
                    ) : marketTrades.length > 0 ? (
                        marketTrades.map((trade) => (
                            <div
                                key={trade.id}
                                className="px-[16px] py-[4px] h-[20px] hover:bg-gray-50 transition-colors"
                            >
                                <div className="grid grid-cols-3 gap-[8px] text-[12px]">
                                    <div className={`tabular-nums ${trade.side === "BUY" ? "text-green-500" : "text-red-500"}`}>
                                        {formatNumber(trade.price, 2)}
                                    </div>
                                    <div className="text-right text-gray-900 tabular-nums">
                                        {formatAmount(trade.amount)}
                                    </div>
                                    <div className="text-right text-gray-600 tabular-nums">
                                        {formatTime(trade.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-[12px]">
                            Chưa có giao dịch
                        </div>
                    )
                ) : !isLogin ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-[12px]">
                        Vui lòng đăng nhập để xem giao dịch của bạn
                    </div>
                ) : userLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-[12px]">
                        Đang tải...
                    </div>
                ) : userTrades && userTrades.length > 0 ? (
                    userTrades.map((trade) => (
                        <div
                            key={trade.id}
                            className="px-[16px] py-[4px] h-[20px] hover:bg-gray-50 transition-colors"
                        >
                            <div className="grid grid-cols-3 gap-[8px] text-[12px]">
                                <div className={`tabular-nums ${trade.side === "BUY" ? "text-green-500" : "text-red-500"}`}>
                                    {formatNumber(trade.price, 2)}
                                </div>
                                <div className="text-right text-gray-900 tabular-nums">
                                    {formatAmount(trade.amount)}
                                </div>
                                <div className="text-right text-gray-600 tabular-nums">
                                    {formatTime(trade.timestamp)}
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