"use client";

import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import Link from "next/link";
import TransferModal from "./TransferModal";

interface EstimatedBalanceSectionProps {
    totalBalance: number; // in USDT
    totalBalanceUSD: number; // in USD
}

export default function EstimatedBalanceSection({
    totalBalance,
    totalBalanceUSD
}: EstimatedBalanceSectionProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const formatNumber = (num: number, decimals: number = 2) => {
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    return (
        <div className="dark:bg-[#181A20] bg-white rounded-[18px] p-6 mb-6  dark:border-gray-700 border border-black">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="dark:text-[#eaecef] text-black text-[20px] font-semibold">Số dư ước tính</h2>
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-gray-400 dark:hover:text-white hover:text-black hover:cursor-pointer transition-colors"
                    >
                        {isVisible ? <HiEyeOff /> : <HiEye />}
                    </button>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-[32px] font-medium dark:text-white text-black mb-1">
                        {isVisible ? `${formatNumber(totalBalance)} USDT` : "******"}
                    </div>
                    <div className="text-[14px] text-gray-600">
                        {isVisible ? `≈ ${formatNumber(totalBalanceUSD)} USD` : "******"}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-[14px] transition-colors"
                    >
                        Nạp
                    </button>
                    <Link
                        href="/my/wallet/withdraw"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-[14px] transition-colors"
                    >
                        Rút
                    </Link>
                    <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-[14px] transition-colors"
                    >
                        Chuyển
                    </button>
                    <Link
                        href="/my/wallet/history"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-[14px] transition-colors"
                    >
                        Lịch sử
                    </Link>
                </div>
            </div>

            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
            />
        </div>
    );
}

