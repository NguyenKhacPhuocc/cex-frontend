"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useTradingPairs } from "@/hooks/useTradingPairs";

type TabType = "ALL" | "FDUSD" | "BNB" | "BTC" | "ALTS" | "FIAT";
type SortField = "pair" | "price" | "change24h" | null;
type SortOrder = "asc" | "desc";

// Favorite pairs stored in localStorage
const FAVORITE_PAIRS_KEY = "favorite_trading_pairs";

const getFavoritePairs = (): string[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(FAVORITE_PAIRS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveFavoritePairs = (favorites: string[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(FAVORITE_PAIRS_KEY, JSON.stringify(favorites));
};

export default function TradingPairs() {
    const router = useRouter();
    const { tickers, isLoading } = useTradingPairs();
    const [activeTab, setActiveTab] = useState<TabType>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [favoritePairs, setFavoritePairs] = useState<string[]>([]);

    // Load favorites from localStorage on mount
    useEffect(() => {
        setFavoritePairs(getFavoritePairs());
    }, []);

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

    const toggleFavorite = (symbol: string) => {
        setFavoritePairs((prev) => {
            const newFavorites = prev.includes(symbol)
                ? prev.filter((s) => s !== symbol)
                : [...prev, symbol];
            saveFavoritePairs(newFavorites);
            return newFavorites;
        });
    };

    // Extract quote asset from pair (e.g., "BTC/USDT" -> "USDT")
    const getQuoteAsset = (pair: string): string => {
        const parts = pair.split("/");
        return parts.length > 1 ? parts[1] : "";
    };

    // Filter tickers based on active tab
    const filteredByTab = useMemo(() => {
        if (activeTab === "ALL") return tickers;

        return tickers.filter((ticker) => {
            const quoteAsset = getQuoteAsset(ticker.pair);
            switch (activeTab) {
                case "BTC":
                    return quoteAsset === "BTC";
                case "BNB":
                    return quoteAsset === "BNB";
                case "FDUSD":
                    return quoteAsset === "FDUSD";
                case "FIAT":
                    // FIAT currencies (USDT, USDC, etc.)
                    return ["USDT", "USDC", "BUSD"].includes(quoteAsset);
                case "ALTS":
                    // Everything that's not BTC, BNB, FDUSD, or FIAT
                    return !["BTC", "BNB", "FDUSD", "USDT", "USDC", "BUSD"].includes(quoteAsset);
                default:
                    return true;
            }
        });
    }, [tickers, activeTab]);

    // Transform tickers to display format with favorites
    const pairsWithFavorites = useMemo(() => {
        return filteredByTab.map((ticker) => ({
            symbol: ticker.symbol,
            pair: ticker.pair,
            price: ticker.price,
            change24h: ticker.change24h,
            volume24h: ticker.volume24h,
            leverage: "", // Not available in current data, can be added later
            isFavorite: favoritePairs.includes(ticker.symbol),
        }));
    }, [filteredByTab, favoritePairs]);

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

    // Filter by search term
    let filteredPairs = pairsWithFavorites.filter((pair) =>
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

    const handlePairClick = (symbol: string) => {
        router.push(`/spot/${symbol}`);
    };

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
                {isLoading ? (
                    <div className="px-[16px] py-[20px] text-center text-gray-400 text-[14px]">
                        Đang tải...
                    </div>
                ) : filteredPairs.length === 0 ? (
                    <div className="px-[16px] py-[20px] text-center text-gray-400 text-[14px]">
                        Không tìm thấy cặp giao dịch
                    </div>
                ) : (
                    filteredPairs.map((pair) => (
                        <div
                            key={pair.symbol}
                            onClick={() => handlePairClick(pair.symbol)}
                            className="px-[16px] pt-[8px] hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="grid grid-cols-[16px_1fr_70px_90px] gap-[6px] items-center text-[12px]">
                                {/* Favorite Icon */}
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(pair.symbol);
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
                    ))
                )}
            </div>
        </div>
    );
}