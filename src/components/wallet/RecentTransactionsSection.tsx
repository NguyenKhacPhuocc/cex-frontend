"use client";

import Link from "next/link";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";

interface Transaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
}

interface RecentTransactionsSectionProps {
    transactions: Transaction[];
}

export default function RecentTransactionsSection({ transactions }: RecentTransactionsSectionProps) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatNumber = (num: number, decimals: number = 2) => {
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    return (
        <div className="dark:bg-[#181A20] bg-white rounded-[18px] dark:border-gray-700 border border-black p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="dark:text-[#eaecef] text-black text-[14px]">Giao dịch gần đây</h2>
                <Link href="/my/wallet/history" className="dark:text-[#eaecef] text-gray-800  text-[14px] font-[600] hover:underline">
                    Xem thêm &gt;
                </Link>
            </div>

            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <HiOutlineDocumentDuplicate className="text-[48px] text-gray-600 mb-4" />
                    <p className="text-gray-400 text-[14px]">Không có dữ liệu</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-gray-400 text-[12px] border-b border-gray-800">
                                <th className="text-left py-3 px-4">Loại</th>
                                <th className="text-right py-3 px-4">Số lượng</th>
                                <th className="text-right py-3 px-4">Trạng thái</th>
                                <th className="text-right py-3 px-4">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="py-3 px-4 text-white text-[14px]">{tx.type}</td>
                                    <td className="text-right py-3 px-4 text-white text-[14px]">
                                        {formatNumber(tx.amount)} {tx.currency}
                                    </td>
                                    <td className="text-right py-3 px-4">
                                        <span className={`text-[12px] ${tx.status === "completed" ? "text-green-400" :
                                            tx.status === "pending" ? "text-yellow-400" :
                                                "text-red-400"
                                            }`}>
                                            {tx.status === "completed" ? "Hoàn thành" :
                                                tx.status === "pending" ? "Đang chờ" :
                                                    "Thất bại"}
                                        </span>
                                    </td>
                                    <td className="text-right py-3 px-4 text-gray-400 text-[12px]">
                                        {formatDate(tx.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

