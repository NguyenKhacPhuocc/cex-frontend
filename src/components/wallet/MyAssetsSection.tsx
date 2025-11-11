"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { HiSearch } from "react-icons/hi";
import { HiDotsVertical } from "react-icons/hi";
import { Balance, useAllBalances } from "@/hooks/useBalances";
import { Ticker } from "@/hooks/useAllTickers";
import { useAvailableCoins } from "@/hooks/useMarkets";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
    HiOutlineCash,
    HiOutlineArrowsExpand,
    HiOutlineSwitchHorizontal
} from "react-icons/hi";

interface AssetWithPrice extends Balance {
    price: number;
    totalValue: number;
    totalValueUSD: number;
    coinName?: string;
}

interface MyAssetsSectionProps {
    balances: Balance[];
    tickers: Ticker[];
}

interface AccountSummary {
    type: "spot" | "futures" | "funding";
    name: string;
    icon: React.ReactNode;
    totalValueUSD: number;
    totalAmount: number;
    ratio: number; // Percentage of total
}

// Coin names mapping
const COIN_NAMES: { [key: string]: string } = {
    "BNB": "BNB",
    "BTC": "Bitcoin",
    "ETH": "Ethereum",
    "USDT": "TetherUS",
    "SOL": "Solana",
    "XRP": "Ripple",
    "ADA": "Cardano",
    "DOGE": "Dogecoin",
    "TON": "Toncoin",
    "LINK": "Chainlink",
    "PEPE": "Pepe",
    "ZEC": "Zcash",
    "TAO": "Bittensor",
    "LUMIA": "Lumia"
};

// Get coin icon path - will be used inside component to access availableCoins
const getCoinIconPath = (asset: string, availableCoins: string[]): string | null => {
    // Check if coin is in the list of available coins from active markets
    if (availableCoins.includes(asset.toUpperCase())) {
        return `/${asset.toUpperCase()}.png`;
    }
    return null;
};

export default function MyAssetsSection({ balances, tickers }: MyAssetsSectionProps) {
    const { isLogin } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [hideSmallAssets, setHideSmallAssets] = useState(false);
    const [viewMode, setViewMode] = useState<"coin" | "account">("coin");
    const [sortBy, setSortBy] = useState<"asset" | "amount" | "price" | "value" | "account" | "ratio">("asset");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Fetch balances by wallet type for account view (always fetch to avoid conditional hook)
    const { spot, futures, funding } = useAllBalances(isLogin);

    // Get available coins from active markets
    const { coins: availableCoins } = useAvailableCoins(true);

    // Calculate assets with prices
    const assetsWithPrices = useMemo(() => {
        const assets: AssetWithPrice[] = balances.map(balance => {
            // If asset is USDT, price is 1
            let price = 1;
            if (balance.asset === "USDT") {
                price = 1;
            } else {
                // Find ticker for this asset (look for USDT pair)
                const ticker = tickers.find(t => {
                    // Check if symbol matches (e.g., BTC_USDT, ETH_USDT)
                    if (t.symbol === `${balance.asset}_USDT` || t.symbol === `USDT_${balance.asset}`) {
                        return true;
                    }
                    // Check if pair matches (e.g., BTC/USDT, ETH/USDT)
                    if (t.pair === `${balance.asset}/USDT` || t.pair === `USDT/${balance.asset}`) {
                        return true;
                    }
                    return false;
                });

                if (ticker) {
                    // Extract price from ticker
                    if (ticker.pair.startsWith(`${balance.asset}/USDT`) || ticker.symbol.startsWith(`${balance.asset}_USDT`)) {
                        price = ticker.price;
                    } else if (ticker.pair.startsWith(`USDT/${balance.asset}`) || ticker.symbol.startsWith(`USDT_${balance.asset}`)) {
                        price = ticker.price > 0 ? 1 / ticker.price : 0;
                    }
                }
            }

            const total = parseFloat(balance.available) + parseFloat(balance.locked);
            const totalValue = total * price;
            const totalValueUSD = totalValue; // Assuming USDT ≈ USD

            return {
                ...balance,
                price,
                totalValue,
                totalValueUSD,
                coinName: COIN_NAMES[balance.asset] || balance.asset
            };
        });

        // Filter by search
        let filtered = assets.filter(asset =>
            asset.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.coinName?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Filter small assets
        if (hideSmallAssets) {
            filtered = filtered.filter(asset => asset.totalValueUSD >= 1);
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue: number | string = 0;
            let bValue: number | string = 0;

            switch (sortBy) {
                case "asset":
                    aValue = a.asset;
                    bValue = b.asset;
                    break;
                case "amount":
                    aValue = parseFloat(a.available) + parseFloat(a.locked);
                    bValue = parseFloat(b.available) + parseFloat(b.locked);
                    break;
                case "price":
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case "value":
                    aValue = a.totalValueUSD;
                    bValue = b.totalValueUSD;
                    break;
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortOrder === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else {
                return sortOrder === "asc"
                    ? (aValue as number) - (bValue as number)
                    : (bValue as number) - (aValue as number);
            }
        });

        return filtered;
    }, [balances, tickers, searchQuery, hideSmallAssets, sortBy, sortOrder]);

    // Calculate account summaries for account view mode
    const accountSummaries = useMemo(() => {
        if (viewMode !== "account") return [];

        const calculateAccountValue = (accountBalances: Balance[] | undefined): number => {
            if (!accountBalances || accountBalances.length === 0) return 0;

            let totalValue = 0;

            accountBalances.forEach(balance => {
                const available = parseFloat(balance.available) || 0;
                const locked = parseFloat(balance.locked) || 0;
                const total = available + locked;

                if (balance.asset === "USDT") {
                    totalValue += total;
                } else {
                    // Find ticker for this asset
                    const ticker = tickers.find(t => {
                        if (t.symbol === `${balance.asset}_USDT` || t.symbol === `USDT_${balance.asset}`) {
                            return true;
                        }
                        if (t.pair === `${balance.asset}/USDT` || t.pair === `USDT/${balance.asset}`) {
                            return true;
                        }
                        return false;
                    });

                    if (ticker) {
                        let price = 1;
                        if (ticker.pair.startsWith(`${balance.asset}/USDT`) || ticker.symbol.startsWith(`${balance.asset}_USDT`)) {
                            price = ticker.price;
                        } else if (ticker.pair.startsWith(`USDT/${balance.asset}`) || ticker.symbol.startsWith(`USDT_${balance.asset}`)) {
                            price = ticker.price > 0 ? 1 / ticker.price : 0;
                        }
                        totalValue += total * price;
                    }
                }
            });

            return totalValue;
        };

        const spotValue = calculateAccountValue(spot.data);
        const futuresValue = calculateAccountValue(futures.data);
        const fundingValue = calculateAccountValue(funding.data);

        const totalValue = spotValue + futuresValue + fundingValue;

        const accounts: AccountSummary[] = [
            {
                type: "spot",
                name: "Spot",
                icon: <HiOutlineCash className="text-[20px]" />,
                totalValueUSD: spotValue,
                totalAmount: spotValue,
                ratio: totalValue > 0 ? (spotValue / totalValue) * 100 : 0
            },
            {
                type: "futures",
                name: "Futures",
                icon: <HiOutlineArrowsExpand className="text-[20px]" />,
                totalValueUSD: futuresValue,
                totalAmount: futuresValue,
                ratio: totalValue > 0 ? (futuresValue / totalValue) * 100 : 0
            },
            {
                type: "funding",
                name: "Funding",
                icon: <HiOutlineSwitchHorizontal className="text-[20px]" />,
                totalValueUSD: fundingValue,
                totalAmount: fundingValue,
                ratio: totalValue > 0 ? (fundingValue / totalValue) * 100 : 0
            }
        ];

        // Sort accounts
        accounts.sort((a, b) => {
            let aValue: number | string = 0;
            let bValue: number | string = 0;

            switch (sortBy) {
                case "account":
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case "amount":
                    aValue = a.totalAmount;
                    bValue = b.totalAmount;
                    break;
                case "ratio":
                    aValue = a.ratio;
                    bValue = b.ratio;
                    break;
                default:
                    aValue = a.totalValueUSD;
                    bValue = b.totalValueUSD;
            }

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortOrder === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else {
                return sortOrder === "asc"
                    ? (aValue as number) - (bValue as number)
                    : (bValue as number) - (aValue as number);
            }
        });

        return accounts;
    }, [viewMode, spot.data, futures.data, funding.data, tickers, sortBy, sortOrder]);

    const formatNumber = (num: number, decimals: number = 2) => {
        if (num === 0) return "0,00";
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    const handleSort = (column: "asset" | "amount" | "price" | "value" | "account" | "ratio") => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    return (
        <div className="dark:bg-[#181A20] bg-white rounded-[18px] dark:border-gray-700 border border-black p-6 mb-6  ">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-black dark:text-[#eaecef] text-[24px] font-[600]">Tài sản của tôi</h2>
                <div className="flex gap-[20px] justify-center items-center">
                    <div className="flex items-center gap-2 dark:bg-gray-800 bg-white rounded-lg px-3 py-2 border-gray-200 border">
                        <HiSearch className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm coin"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent dark:text-white text-black text-[14px] outline-none"
                        />
                    </div>
                    <Link href="/my/wallet/assets/all" className="dark:text-[#eaecef] text-black text-[14px] hover:underline font-[500]">
                        Xem tất cả coin &gt;
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("coin")}
                            className={`px-2 py-1 text-[14px] ${viewMode === "coin"
                                ? "dark:text-white text-black font-[600] border-b-2 border-[#FCD535]"
                                : "text-gray-400"
                                }`}
                        >
                            Xem theo Coin
                        </button>
                        <button
                            onClick={() => setViewMode("account")}
                            className={`px-2 py-1 text-[14px] ${viewMode === "account"
                                ? "dark:text-white text-black font-[600] border-b-2 border-[#FCD535]"
                                : "text-gray-400"
                                }`}
                        >
                            Chế độ xem tài khoản
                        </button>
                    </div>

                </div>
                <label className="flex items-center gap-2 text-gray-400 text-[12px] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={hideSmallAssets}
                        onChange={(e) => setHideSmallAssets(e.target.checked)}
                        className="rounded"
                    />
                    <span>Ẩn tài sản &lt;1 USD</span>
                </label>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="dark:text-[#eaecef] text-gray-600 text-[12px] border-b border-gray-800">
                            {viewMode === "coin" ? (
                                <>
                                    <th
                                        className="text-left py-3 px-4 cursor-pointer dark:hover:text-white hover:text-black"
                                        onClick={() => handleSort("asset")}
                                    >
                                        Coin {sortBy === "asset" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th
                                        className="text-right py-3 px-4 cursor-pointer dark:hover:text-white hover:text-black"
                                        onClick={() => handleSort("amount")}
                                    >
                                        Số lượng {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th
                                        className="text-right py-3 px-4 cursor-pointer dark:hover:text-white hover:text-black"
                                        onClick={() => handleSort("price")}
                                    >
                                        Giá coin {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-right py-3 px-4">Hành động</th>
                                </>
                            ) : (
                                <>
                                    <th
                                        className="text-left py-3 px-4 cursor-pointer dark:hover:text-white hover:text-black"
                                        onClick={() => handleSort("account")}
                                    >
                                        Tài khoản {sortBy === "account" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th
                                        className="text-center py-3 px-4 cursor-pointer dark:hover:text-white hover:text-black"
                                        onClick={() => handleSort("amount")}
                                    >
                                        Số lượng {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th
                                        className="text-center py-3 px-4 cursor-pointer dark:hover:text-white hover:text-black"
                                        onClick={() => handleSort("ratio")}
                                    >
                                        Tỷ lệ {sortBy === "ratio" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-right py-3 px-4">Hành động</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {viewMode === "coin" ? (
                            assetsWithPrices.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-400">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                assetsWithPrices.map((asset) => {
                                    const totalAmount = parseFloat(asset.available) + parseFloat(asset.locked);
                                    return (
                                        <tr key={asset.asset} className="border-b border-gray-800 dark:hover:bg-gray-800/50 hover:bg-gray-200/50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {getCoinIconPath(asset.asset, availableCoins) ? (
                                                        <div className="w-6 h-6 relative shrink-0">
                                                            <Image
                                                                src={getCoinIconPath(asset.asset, availableCoins)!}
                                                                alt={asset.asset}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center dark:text-white text-black text-[10px] font-bold shrink-0">
                                                            {asset.asset.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="dark:text-white  text-black text-[14px] font-medium">{asset.asset}</div>
                                                        <div className="dark:text-gray-400 text-gray-600 text-[12px]">{asset.coinName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <div className="dark:text-white text-gray-900 text-[14px]">{formatNumber(totalAmount, 2)}</div>
                                                <div className="dark:text-gray-400 text-gray-600 text-[12px]">{formatNumber(asset.totalValueUSD, 2)} USD</div>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <div className="dark:text-white text-black text-[14px]">{formatNumber(asset.price, 2)} USD</div>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <Link href={`/my/wallet/assets/${asset.asset}`} className="text-green-400 text-[12px] hover:underline">
                                                    Tiền mặt
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )
                        ) : (
                            accountSummaries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-400">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                accountSummaries.map((account) => (
                                    <tr key={account.type} className="border-b border-gray-800 dark:hover:bg-gray-800/50 hover:bg-gray-200/50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="dark:text-gray-400 text-gray-600">
                                                    {account.icon}
                                                </div>
                                                <div>
                                                    <div className="dark:text-white text-black text-[14px] font-medium">{account.name}</div>
                                                    <div className="dark:text-gray-400 text-gray-600 text-[12px]">{formatNumber(account.totalValueUSD, 2)} USD</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <div className="dark:text-white text-black text-[14px]">
                                                {account.totalAmount > 0 ? formatNumber(account.totalAmount, 2) : "--"}
                                            </div>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <div className="dark:text-white text-black text-[14px]">
                                                {account.ratio > 0 ? `${formatNumber(account.ratio, 2)}%` : "--"}
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <button className="dark:text-gray-400 text-gray-600 hover:text-gray-600 dark:hover:text-white">
                                                <HiDotsVertical className="text-[20px]" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

