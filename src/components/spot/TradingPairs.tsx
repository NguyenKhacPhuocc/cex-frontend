"use client";
import { useState } from "react";
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

// Mock data cho trading pairs
const mockTradingPairs = [
    { pair: "WBTC/BTC", leverage: "5x", price: 0.9999, change24h: -0.01, volume: 1234567, isFavorite: false },
    { pair: "YFI/BTC", leverage: "5x", price: 0.04231, change24h: 0.40, volume: 9876543, isFavorite: false },
    { pair: "ETH/BTC", leverage: "10x", price: 0.03599, change24h: -0.47, volume: 8765432, isFavorite: true },
    { pair: "PAXG/BTC", leverage: "5x", price: 0.03414, change24h: -2.65, volume: 7654321, isFavorite: false },
    { pair: "BNB/BTC", leverage: "10x", price: 0.009912, change24h: -1.19, volume: 6543210, isFavorite: false },
    { pair: "BCH/BTC", leverage: "10x", price: 0.004850, change24h: -0.33, volume: 5432109, isFavorite: false },
    { pair: "TAO/BTC", leverage: "", price: 0.003834, change24h: 9.98, volume: 4321098, isFavorite: false },
    { pair: "ZEC/BTC", leverage: "10x", price: 0.0028629, change24h: -6.32, volume: 3210987, isFavorite: false },
    { pair: "AAVE/BTC", leverage: "5x", price: 0.002070, change24h: -0.58, volume: 2109876, isFavorite: false },
    { pair: "SOL/BTC", leverage: "5x", price: 0.0017752, change24h: 2.55, volume: 1098765, isFavorite: true },
    { pair: "LTC/BTC", leverage: "10x", price: 0.000885, change24h: 2.79, volume: 987654, isFavorite: false },
    { pair: "QNT/BTC", leverage: "5x", price: 0.0007172, change24h: -0.44, volume: 876543, isFavorite: false },
    { pair: "DASH/BTC", leverage: "10x", price: 0.0004221, change24h: -4.09, volume: 765432, isFavorite: false },
];

type TabType = "ALL" | "FDUSD" | "BNB" | "BTC" | "ALTS" | "FIAT";
type SortField = "pair" | "price" | "change24h" | null;
type SortOrder = "asc" | "desc";

export default function TradingPairs() {
    const [activeTab, setActiveTab] = useState<TabType>("BTC");
    const [searchTerm, setSearchTerm] = useState("");
    const [pairs, setPairs] = useState(mockTradingPairs);
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const formatNumber = (num: number, decimals: number) => {
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    const formatPrice = (price: number) => {
        if (price >= 1) return formatNumber(price, 4);
        if (price >= 0.01) return formatNumber(price, 5);
        if (price >= 0.0001) return formatNumber(price, 6);
        return formatNumber(price, 7);
    };

    const toggleFavorite = (index: number) => {
        const newPairs = [...pairs];
        newPairs[index].isFavorite = !newPairs[index].isFavorite;
        setPairs(newPairs);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle sort order
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // New field, default to desc
            setSortField(field);
            setSortOrder("desc");
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <FaSort className="text-gray-400" />;
        }
        return sortOrder === "asc" ? (
            <FaSortUp className="text-black" />
        ) : (
            <FaSortDown className="text-black" />
        );
    };

    let filteredPairs = pairs.filter((pair) =>
        pair.pair.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    if (sortField) {
        filteredPairs = [...filteredPairs].sort((a, b) => {
            // String comparison for pair name
            if (sortField === "pair") {
                const aValue = a[sortField] as string;
                const bValue = b[sortField] as string;
                if (sortOrder === "asc") {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            }

            // Number comparison for price and change24h
            const aValue = a[sortField] as number;
            const bValue = b[sortField] as number;
            if (sortOrder === "asc") {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
    }

    const tabs: TabType[] = ["ALL", "FDUSD", "BNB", "BTC", "ALTS", "FIAT"];

    return (
        <div className="flex-1 bg-white rounded-[8px] flex flex-col">
            {/* Search */}
            <div className="px-[16px] pt-[12px] pb-[8px]">
                <div className="relative">
                    <IoSearchOutline className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
                    <input
                        type="text"
                        placeholder="Tìm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-[36px] pr-[12px] py-[8px] h-[32px] border border-gray-300 rounded-[8px] text-[14px] focus:outline-none focus:border-gray-400"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="px-[16px] border-b border-gray-200">
                <div className="flex gap-[16px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-[14px] whitespace-nowrap pb-[8px] transition-colors ${activeTab === tab
                                ? "text-black font-[500] border-b-2 border-[#FDDD5D]"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Header */}
            <div className="px-[16px] pt-[8px] pb-[6px] border-b border-gray-100">
                <div className="grid grid-cols-[16px_1fr_80px_90px] gap-[6px] items-center text-[12px] text-gray-500">
                    {/* Icon Column */}
                    <div></div>

                    {/* Pair Column */}
                    <button
                        onClick={() => handleSort("pair")}
                        className="flex items-center gap-[4px] hover:text-gray-700 transition-colors min-w-0"
                    >
                        <span className="truncate">Cặp</span>
                        <span className="shrink-0 text-[10px]">{getSortIcon("pair")}</span>
                    </button>

                    {/* Price Column */}
                    <button
                        onClick={() => handleSort("price")}
                        className="flex items-center justify-end gap-[4px] hover:text-gray-700 transition-colors min-w-0"
                    >
                        <span className="truncate">Giá gần nhất</span>
                        <span className="shrink-0 text-[10px]">{getSortIcon("price")}</span>
                    </button>

                    {/* Change Column */}
                    <button
                        onClick={() => handleSort("change24h")}
                        className="flex items-center justify-end gap-[4px] hover:text-gray-700 transition-colors min-w-0"
                    >
                        <span className="truncate">Biến động trong 24h</span>
                        <span className="shrink-0 text-[10px]">{getSortIcon("change24h")}</span>
                    </button>
                </div>
            </div>

            {/* Trading Pairs List */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                {filteredPairs.map((pair, index) => (
                    <div
                        key={index}
                        className="px-[16px] pt-[8px] hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        <div className="grid grid-cols-[16px_1fr_70px_90px] gap-[6px] items-center text-[12px]">
                            {/* Favorite Icon */}
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(index);
                                    }}
                                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                                >
                                    {pair.isFavorite ? (
                                        <FaStar className="text-yellow-500 text-[14px]" />
                                    ) : (
                                        <CiStar className="text-[16px]" />
                                    )}
                                </button>
                            </div>

                            {/* Pair Name */}
                            <div className="flex items-center gap-[4px] min-w-0">
                                <span className="font-[500] text-black truncate">{pair.pair}</span>
                                {pair.leverage && (
                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-[4px] py-[1px] rounded shrink-0 whitespace-nowrap">
                                        {pair.leverage}
                                    </span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="text-right text-black tabular-nums text-[12px]">
                                {formatPrice(pair.price)}
                            </div>

                            {/* 24h Change */}
                            <div className="text-right tabular-nums">
                                <span
                                    className={`font-[500] ${pair.change24h >= 0 ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    {pair.change24h >= 0 ? "+" : ""}
                                    {pair.change24h.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}