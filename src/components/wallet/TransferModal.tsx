"use client";

import { useState, useEffect, useMemo } from "react";
import { HiX } from "react-icons/hi";
import { HiArrowsUpDown } from "react-icons/hi2";
import Image from "next/image";
import { useAllBalances } from "@/hooks/useBalances";
import { useAvailableCoins } from "@/hooks/useMarkets";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

type WalletType = "spot" | "funding" | "futures";

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
    spot: "Spot",
    funding: "Funding",
    futures: "Futures",
};

export default function TransferModal({ isOpen, onClose }: TransferModalProps) {
    const { isLogin } = useAuth();
    const queryClient = useQueryClient();
    const { spot, futures, funding } = useAllBalances(isLogin);
    const { coins: availableCoins } = useAvailableCoins(true);

    const [fromWalletType, setFromWalletType] = useState<WalletType>("spot");
    const [toWalletType, setToWalletType] = useState<WalletType>("funding");
    const [selectedCoin, setSelectedCoin] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>("");

    // Get balances for selected wallet type
    const fromWalletBalances = useMemo(() => {
        switch (fromWalletType) {
            case "spot":
                return spot.data || [];
            case "futures":
                return futures.data || [];
            case "funding":
                return funding.data || [];
            default:
                return [];
        }
    }, [fromWalletType, spot.data, futures.data, funding.data]);

    // Get all coins in the from wallet (show all coins, even with 0 balance)
    const availableCoinsInWallet = useMemo(() => {
        const coins = fromWalletBalances.map((balance) => balance.asset);
        // Remove duplicates and sort
        return Array.from(new Set(coins)).sort();
    }, [fromWalletBalances]);

    // Get selected coin balance
    const selectedCoinBalance = useMemo(() => {
        if (!selectedCoin) return null;
        return fromWalletBalances.find((b) => b.asset === selectedCoin);
    }, [selectedCoin, fromWalletBalances]);

    const availableBalance = selectedCoinBalance
        ? parseFloat(selectedCoinBalance.available)
        : 0;

    // Reset form when wallet type changes
    useEffect(() => {
        setSelectedCoin("");
        setAmount("");
        setError("");
    }, [fromWalletType]);

    // Auto-select first coin if available
    useEffect(() => {
        if (availableCoinsInWallet.length > 0 && !selectedCoin) {
            setSelectedCoin(availableCoinsInWallet[0]);
        } else if (availableCoinsInWallet.length === 0) {
            setSelectedCoin("");
        } else if (selectedCoin && !availableCoinsInWallet.includes(selectedCoin)) {
            setSelectedCoin("");
        }
    }, [availableCoinsInWallet, selectedCoin]);

    // Handle swap wallets
    const handleSwap = () => {
        const temp = fromWalletType;
        setFromWalletType(toWalletType);
        setToWalletType(temp);
        setSelectedCoin("");
        setAmount("");
        setError("");
    };

    // Handle MAX button
    const handleMax = () => {
        if (availableBalance > 0) {
            setAmount(availableBalance.toString());
            setError("");
        }
    };

    // Handle amount change
    const handleAmountChange = (value: string) => {
        // Only allow numbers and decimal point
        const regex = /^\d*\.?\d*$/;
        if (regex.test(value) || value === "") {
            setAmount(value);
            setError("");

            // Validate amount
            const numValue = parseFloat(value);
            if (numValue > availableBalance) {
                setError("Số tiền vượt quá số dư khả dụng");
            } else if (numValue > 0 && numValue < 0.00000001) {
                setError("Số tiền tối thiểu là 0.00000001");
            }
        }
    };

    // Validate form
    const isFormValid = useMemo(() => {
        if (!selectedCoin || !amount) return false;
        if (fromWalletType === toWalletType) return false;
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;
        if (numAmount < 0.00000001) return false;
        if (numAmount > availableBalance) return false;
        return true;
    }, [selectedCoin, amount, fromWalletType, toWalletType, availableBalance]);

    // Handle transfer
    const handleTransfer = async () => {
        if (!isFormValid || isSubmitting) return;

        setError("");
        setIsSubmitting(true);

        try {
            await apiClient.post("/api/wallets/transfer", {
                fromWalletType,
                toWalletType,
                currency: selectedCoin,
                amount: parseFloat(amount),
            });

            // Refresh balances
            await queryClient.invalidateQueries({ queryKey: ["balances"] });

            // Reset form and close
            setAmount("");
            setSelectedCoin("");
            onClose();
        } catch (err: unknown) {
            const errorMessage =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Có lỗi xảy ra khi chuyển tiền. Vui lòng thử lại.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle overlay click
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen, onClose]);

    // Get coin icon path
    const getCoinIconPath = (asset: string): string | null => {
        if (availableCoins.includes(asset.toUpperCase())) {
            return `/${asset.toUpperCase()}.png`;
        }
        return null;
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleOverlayClick}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Modal */}
            <div className="relative bg-[#181A20] rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-[20px] font-bold">Chuyển tiền</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <HiX className="text-[20px]" />
                    </button>
                </div>

                {/* Transfer Wallets Section */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <label className="text-gray-400 text-[14px] mb-1 block">Từ</label>
                            <div className="relative">
                                <select
                                    value={fromWalletType}
                                    onChange={(e) => setFromWalletType(e.target.value as WalletType)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FCD535]"
                                >
                                    <option value="spot">{WALLET_TYPE_LABELS.spot}</option>
                                    <option value="funding">{WALLET_TYPE_LABELS.funding}</option>
                                    <option value="futures">{WALLET_TYPE_LABELS.futures}</option>
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSwap}
                            className="mt-7 text-gray-400 hover:text-[#FCD535] transition-colors shrink-0"
                            title="Đổi ví"
                        >
                            <HiArrowsUpDown className="text-[20px]" />
                        </button>

                        <div className="flex-1">
                            <label className="text-gray-400 text-[14px] mb-1 block">Đến</label>
                            <div className="relative">
                                <select
                                    value={toWalletType}
                                    onChange={(e) => setToWalletType(e.target.value as WalletType)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FCD535]"
                                >
                                    <option value="spot">{WALLET_TYPE_LABELS.spot}</option>
                                    <option value="funding">{WALLET_TYPE_LABELS.funding}</option>
                                    <option value="futures">{WALLET_TYPE_LABELS.futures}</option>
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coin Selection */}
                <div className="mb-4">
                    <label className="text-white text-[14px] mb-2 block">Coin</label>
                    {availableCoinsInWallet.length === 0 ? (
                        <div className="bg-gray-800 rounded-lg px-4 py-3 text-gray-400 text-[14px]">
                            Không có coin nào trong ví này
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedCoin}
                                onChange={(e) => setSelectedCoin(e.target.value)}
                                className="w-full bg-gray-800 text-white rounded-lg pl-12 pr-10 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FCD535]"
                            >
                                <option value="">Chọn coin</option>
                                {availableCoinsInWallet.map((coin) => (
                                    <option key={coin} value={coin}>
                                        {coin}
                                    </option>
                                ))}
                            </select>
                            {selectedCoin && getCoinIconPath(selectedCoin) && (
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none w-5 h-5">
                                    <Image
                                        src={getCoinIconPath(selectedCoin)!}
                                        alt={selectedCoin}
                                        width={20}
                                        height={20}
                                        className="rounded-full"
                                    />
                                </div>
                            )}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}
                    {selectedCoin && availableBalance === 0 && (
                        <p className="text-red-500 text-[12px] mt-1">
                            Không có sẵn tiền để chuyển, vui lòng chọn đồng coin khác.
                        </p>
                    )}
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                    <label className="text-white text-[14px] mb-2 block">Số tiền</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            placeholder="Tối thiểu 0.00000001"
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-[#FCD535]"
                            disabled={!selectedCoin || availableBalance === 0}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            <span className="text-white text-[14px]">{selectedCoin || ""}</span>
                            <button
                                onClick={handleMax}
                                disabled={!selectedCoin || availableBalance === 0}
                                className="text-[#FCD535] text-[14px] font-medium hover:text-[#FCD535]/80 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                TỐI ĐA
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 text-gray-400 text-[12px]">
                        Khả dụng {availableBalance.toFixed(8)} {selectedCoin || ""}
                    </div>
                    {error && (
                        <p className="text-red-500 text-[12px] mt-1">{error}</p>
                    )}
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleTransfer}
                    disabled={!isFormValid || isSubmitting}
                    className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg py-3 text-[14px] font-medium transition-colors"
                >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                </button>
            </div>
        </div>
    );
}

