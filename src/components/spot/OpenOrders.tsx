"use client"
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { IoChevronDown } from "react-icons/io5";
import DateFilters from "@/components/DateFilters";
import { useAuth } from "@/hooks/useAuth";
import { useOpenOrders, useOrderHistory, useCancelOrder } from "@/hooks/useOrders";
import { useAllUserTrades } from "@/hooks/useTrades";
import { useSpot } from "@/contexts/SpotContext";
import { toast } from "react-hot-toast";

interface TableHeader {
    label: string;
    hasDropdown: boolean;
    align?: "left" | "right";
}

export default function OpenOrders() {
    const { isLogin } = useAuth();
    const { symbol } = useSpot();
    const [activeTab, setActiveTab] = useState("orders");
    const [hideOtherPairs, setHideOtherPairs] = useState(false);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
    const [sortByTime] = useState("Sắp xếp theo thời gian đặt lệnh"); // TODO: Implement dropdown later
    const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const fee = 0; // phí giao dịch
    // Fetch data based on active tab
    const { orders: openOrders, isLoading: isLoadingOpenOrders } = useOpenOrders(isLogin && activeTab === "orders");
    const { data: orderHistory, isLoading: isLoadingHistory } = useOrderHistory(isLogin && activeTab === "history");
    const { data: tradeHistory, isLoading: isLoadingTradeHistory } = useAllUserTrades(isLogin && activeTab === "trade-history");

    // Cancel order mutation
    const cancelOrderMutation = useCancelOrder();

    // Filter by symbol if hideOtherPairs is true
    const filteredOpenOrders = useMemo(() => {
        if (!hideOtherPairs || !symbol) return openOrders;
        return openOrders.filter(order => order.market.symbol === symbol);
    }, [openOrders, hideOtherPairs, symbol]);
    const filteredOrderHistory = useMemo(() => {
        if (!hideOtherPairs || !symbol) return orderHistory || [];
        return (orderHistory || []).filter(order => order.market.symbol === symbol);
    }, [orderHistory, hideOtherPairs, symbol]);

    const filteredTradeHistory = useMemo(() => {
        if (!hideOtherPairs || !symbol) return tradeHistory || [];
        return (tradeHistory || []).filter(trade => trade.market === symbol);
    }, [tradeHistory, hideOtherPairs, symbol]);

    const tabs = [
        { id: "orders", label: "Giao dịch đang chờ khớp lệnh", count: filteredOpenOrders.length },
        { id: "history", label: "Lịch sử lệnh", count: null },
        { id: "trade-history", label: "Lịch sử giao dịch", count: null },
    ];

    const ordersTableHeaders: TableHeader[] = [
        { label: "Ngày giờ", hasDropdown: false },
        { label: "Cặp", hasDropdown: false },
        { label: "Loại", hasDropdown: true },
        { label: "Bên", hasDropdown: true },
        { label: "Giá", hasDropdown: true },
        { label: "Số lượng", hasDropdown: false },
        { label: "Thành tiền", hasDropdown: false },
        { label: "Đã khớp", hasDropdown: false },
        { label: "Tổng", hasDropdown: false },
        { label: "Điều kiện kích hoạt", hasDropdown: false },
        { label: "SOR", hasDropdown: false },
        { label: "TP/SL", hasDropdown: false },
        { label: "Hành động", hasDropdown: false },
    ];

    const historyTableHeaders: TableHeader[] = [
        { label: "Ngày", hasDropdown: false },
        { label: "Cặp", hasDropdown: false },
        { label: "Loại", hasDropdown: true },
        { label: "Bên", hasDropdown: true },
        { label: "Trung bình", hasDropdown: false },
        { label: "Giá", hasDropdown: false },
        { label: "Đã khớp", hasDropdown: false },
        { label: "Số lượng", hasDropdown: false },
        { label: "Thành tiền", hasDropdown: false },
        { label: "Tổng", hasDropdown: false },
        { label: "Điều kiện kích hoạt", hasDropdown: false },
        { label: "SOR", hasDropdown: false },
        { label: "TP/SL", hasDropdown: false },
        { label: "Trạng thái", hasDropdown: false },
    ];

    const tradeHistoryTableHeaders: TableHeader[] = [
        { label: "Lệnh số", hasDropdown: false, align: "left" },
        { label: "Ngày giờ", hasDropdown: false, align: "left" },
        { label: "Cặp", hasDropdown: false, align: "left" },
        { label: "Bên", hasDropdown: true, align: "left" },
        { label: "Giá", hasDropdown: false, align: "left" },
        { label: "Đã khớp", hasDropdown: false, align: "left" },
        { label: "Phí", hasDropdown: false, align: "left" },
        { label: "Vai trò", hasDropdown: false, align: "left" },
        { label: "SOR", hasDropdown: false, align: "left" },
        { label: "Tổng", hasDropdown: false, align: "left" },
        { label: "Tổng tính bằng (USDT)", hasDropdown: false, align: "right" },
    ];

    const getTableHeaders = () => {
        if (activeTab === "history") return historyTableHeaders;
        if (activeTab === "trade-history") return tradeHistoryTableHeaders;
        return ordersTableHeaders;
    };

    const tableHeaders = getTableHeaders();

    const handleSort = (columnLabel: string) => {
        if (sortColumn === columnLabel) {
            // Toggle direction nếu click vào cùng column
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // Set column mới và reset về desc
            setSortColumn(columnLabel);
            setSortDirection("desc");
        }
    };

    const handleDateRangeChange = (startDate: string, endDate: string) => {
        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        console.log('📅 Khoảng thời gian được chọn:', {
            startDate,
            endDate,
            days,
            tab: activeTab
        });
        // TODO: Fetch data with new date range (filter on backend)
    };

    // Format helpers
    const formatNumber = (num: number | undefined | null, decimals: number): string => {
        if (typeof num !== 'number' || isNaN(num) || num === 0) return '0';
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        // Remove trailing zeros
        const trimmedDecimal = decimalPart ? decimalPart.replace(/0+$/, '') : '';
        return trimmedDecimal ? `${integerPart},${trimmedDecimal}` : integerPart;
    };

    const formatDate = (date: string | Date | undefined | unknown): string => {
        if (!date) {
            return '--/--/----';
        }

        try {
            // Handle object rỗng {} - fallback cho cache cũ
            if (typeof date === 'object' && date !== null && !(date instanceof Date)) {
                if (Object.keys(date).length === 0) {
                    return '--/--/----';
                }
                return '--/--/----';
            }

            // Handle different date formats
            let d: Date;

            if (date instanceof Date) {
                d = date;
            } else if (typeof date === 'string') {
                // Skip if empty string
                if (date.trim() === '') {
                    return '--/--/----';
                }
                // Parse ISO string (backend đã serialize thành ISO string)
                d = new Date(date);

                // If invalid, try parsing as timestamp (fallback)
                if (isNaN(d.getTime()) && !isNaN(Number(date))) {
                    d = new Date(Number(date));
                }
            } else {
                return '--/--/----';
            }

            // Check if date is valid
            if (isNaN(d.getTime())) {
                return '--/--/----';
            }

            // Format manually to ensure consistent output: dd/MM/yyyy
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('formatDate: Error formatting date:', date, 'error:', error);
            return '--/--/----';
        }
    };

    const formatTime = (date: string | Date | undefined): string => {
        if (!date) return '--/--/---- --:--:--';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '--/--/---- --:--:--';
            return d.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return '--/--/---- --:--:--';
        }
    };

    const getOrderStatusColor = (status: string): string => {
        switch (status.toUpperCase()) {
            case 'OPEN':
                return 'text-blue-600';
            case 'FILLED':
                return 'text-green-600';
            case 'CANCELED':
                return 'text-red-400';
            case 'PARTIALLY_FILLED':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getSideColor = (side: string): string => {
        return side === 'BUY' || side === 'buy' ? 'text-[#2ebd85]' : 'text-[#f6465d]';
    };

    // Update underline position khi activeTab thay đổi
    useEffect(() => {
        const timer = setTimeout(() => {
            const activeElement = tabsRef.current[activeTab];
            if (activeElement) {
                const { offsetLeft, offsetWidth } = activeElement;
                setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
            }
        }, 10);
        return () => clearTimeout(timer);
    }, [activeTab]);

    return (
        <div id="open-orders" className="min-h-[560px] h-full bg-white dark:bg-[#181A20] rounded-[8px] flex flex-col">
            {/* Tabs */}
            <div className="flex items-center justify-between px-[16px] border-b border-[#F5F5F5] dark:border-[#373c43]">
                <div className="flex items-center gap-[24px] h-[42px] relative">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            ref={(el) => {
                                tabsRef.current[tab.id] = el;
                            }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-[12px] text-[14px] font-medium  ${activeTab === tab.id
                                ? "text-[#F0B90B]"
                                : "text-[#9c9c9c] hover:text-black dark:hover:text-[#eaecef]"
                                }`}
                        >
                            {tab.label}
                            {tab.count !== null && ` (${tab.count})`}
                        </button>
                    ))}
                    {/* Animated Underline */}
                    <div
                        className="absolute bottom-0 h-[2px] bg-[#F0B90B] transition-all duration-300 ease-out"
                        style={{
                            left: `${underlineStyle.left}px`,
                            width: `${underlineStyle.width}px`,
                        }}
                    />
                </div>

                {isLogin && activeTab === "orders" && (
                    <label className="flex items-center gap-[8px] text-[12px] font-medium cursor-pointer dark:text-[#eaecef]">
                        <input
                            type="checkbox"
                            checked={hideOtherPairs}
                            onChange={(e) => setHideOtherPairs(e.target.checked)}
                            className="w-[16px] h-[16px] cursor-pointer "
                        />
                        Ẩn các cặp tỉ giá khác
                    </label>
                )}
                {isLogin && (activeTab === "history" || activeTab === "trade-history") && (
                    <div className="flex items-center gap-[12px]">
                        <button className="flex items-center gap-[4px] text-[12px] text-[#9c9c9c] hover:text-black dark:hover:text-[#eaecef]">
                            {sortByTime}
                            <IoChevronDown className="text-[14px]" />
                        </button>
                        <label className="flex items-center gap-[8px] text-[12px] font-medium cursor-pointer dark:text-[#eaecef]">
                            <input
                                type="checkbox"
                                checked={hideOtherPairs}
                                onChange={(e) => setHideOtherPairs(e.target.checked)}
                                className="w-[16px] h-[16px] cursor-pointer"
                            />
                            Ẩn các cặp tỉ giá khác
                        </label>
                    </div>
                )}
            </div>

            {/* Content */}
            {!isLogin ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-[14px]">
                        <Link href="/login" className="text-[#D89F00] hover:underline">
                            Đăng nhập
                        </Link>
                        <span className="text-black"> hoặc </span>
                        <Link href="/register" className="text-[#D89F00] hover:underline">
                            Đăng ký ngay
                        </Link>
                        <span className="text-black"> để giao dịch</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    {/* Date Filters - Show for history and trade-history tabs */}
                    {(activeTab === "history" || activeTab === "trade-history") && (
                        <DateFilters onDateRangeChange={handleDateRangeChange} />
                    )}

                    {/* Table Header */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1400px]">
                            <thead>
                                <tr className="">
                                    {tableHeaders.map((header, index) => {
                                        const align = header.align || "left";
                                        const alignClass = align === "right" ? "text-right" : "text-left";
                                        const justifyClass = align === "right" ? "justify-end" : "justify-start";

                                        return (
                                            <th
                                                key={index}
                                                className={`px-[12px] py-[12px] ${alignClass} text-[12px] text-[#9c9c9c] font-normal whitespace-nowrap`}
                                            >
                                                {header.hasDropdown ? (
                                                    <button
                                                        onClick={() => handleSort(header.label)}
                                                        className={`flex items-center gap-[4px] ${justifyClass} hover:text-black  ${sortColumn === header.label ? "text-black" : ""
                                                            }`}
                                                    >
                                                        {header.label}
                                                        <span
                                                            className={`text-[10px] transition-opacity ${sortColumn === header.label ? "opacity-100" : "opacity-30"
                                                                }`}
                                                        >
                                                            {sortColumn === header.label && sortDirection === "asc" ? "▲" : "▼"}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <div className={`flex items-center gap-[4px] ${justifyClass}`}>
                                                        {header.label}
                                                    </div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Tab: Open Orders */}
                                {activeTab === "orders" && (
                                    <>
                                        {isLoadingOpenOrders ? (
                                            <tr>
                                                <td colSpan={ordersTableHeaders.length} className="px-[12px] py-[24px] text-center text-[14px] text-[#9c9c9c]">
                                                    Đang tải...
                                                </td>
                                            </tr>
                                        ) : filteredOpenOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={ordersTableHeaders.length} className="px-[12px] py-[24px] text-center text-[14px] text-[#9c9c9c]">
                                                    Bạn không có lệnh đang mở.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOpenOrders.map((order) => (
                                                <tr key={order.id} className="border-t border-[#F5F5F5] dark:border-[#373c43] hover:bg-gray-50 dark:text-[#eaecef] dark:hover:bg-gray-800">
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatTime(order.createdAt)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{order.market.symbol.replace('_', '/')}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{order.type.toUpperCase()}</td>
                                                    <td className={`px-[12px] py-[12px] text-[12px] ${getSideColor(order.side)}`}>{order.side.toUpperCase()}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{order.price ? formatNumber(Number(order.price), 2) : 'Market'}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.amount), 5)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.price || 0) * Number(order.amount), 2)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.filled), 5)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.amount), 5)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">--</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">--</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">--</td>
                                                    <td className="px-[12px] py-[12px]">
                                                        {order.type.toLocaleUpperCase() === "LIMIT" && (order.status.toLocaleUpperCase() === "OPEN" || order.status.toLocaleUpperCase() === "PARTIALLY_FILLED") && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm("Bạn có chắc chắn muốn hủy lệnh này?")) {
                                                                        try {
                                                                            await cancelOrderMutation.mutateAsync(order.id);
                                                                            toast.success("Đã hủy lệnh thành công");
                                                                        } catch (error) {
                                                                            const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
                                                                            toast.error(`Hủy lệnh thất bại: ${errorMessage}`);
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={cancelOrderMutation.isPending}
                                                                className="px-[12px] py-[6px] bg-[#F6465D] hover:bg-[#E5354A] text-white text-[12px] font-medium rounded-[4px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {cancelOrderMutation.isPending ? "Đang hủy..." : "Hủy lệnh"}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </>
                                )}

                                {/* Tab: Order History */}
                                {activeTab === "history" && (
                                    <>
                                        {isLoadingHistory ? (
                                            <tr>
                                                <td colSpan={historyTableHeaders.length} className="px-[12px] py-[24px] text-center text-[14px] text-[#9c9c9c]">
                                                    Đang tải...
                                                </td>
                                            </tr>
                                        ) : filteredOrderHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={historyTableHeaders.length} className="px-[12px] py-[24px] text-center text-[14px] text-[#9c9c9c]">
                                                    Bạn không có lịch sử đặt lệnh.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrderHistory.map((order) => {
                                                const avgPrice = Number(order.filled) > 0 ? Number(order.price || 0) : 0;
                                                return (
                                                    <tr key={order.id} className="border-t border-[#F5F5F5] dark:border-[#373c43] dark:text-[#eaecef] hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-[12px] py-[12px] text-[12px]">{formatDate(order.createdAt)}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{order.market.symbol.replace('_', '/')}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{order.type.toUpperCase()}</td>
                                                        <td className={`px-[12px] py-[12px] text-[12px] ${getSideColor(order.side)}`}>{order.side.toUpperCase()}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(avgPrice, 2)}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.price || 0), 2)}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.filled), 5)}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.amount), 5)}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.price || 0) * Number(order.filled), 2)}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(order.price || 0) * Number(order.filled) + fee, 2)}</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">--</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">--</td>
                                                        <td className="px-[12px] py-[12px] text-[12px]">--</td>
                                                        <td className={`px-[12px] py-[12px] text-[12px]  ${getOrderStatusColor(order.status)}`}>{order.status.toUpperCase()}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </>
                                )}

                                {/* Tab: Trade History */}
                                {activeTab === "trade-history" && (
                                    <>
                                        {isLoadingTradeHistory ? (
                                            <tr>
                                                <td colSpan={tradeHistoryTableHeaders.length} className="px-[12px] py-[24px] text-center text-[14px] text-[#9c9c9c]">
                                                    Đang tải...
                                                </td>
                                            </tr>
                                        ) : filteredTradeHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={tradeHistoryTableHeaders.length} className="px-[12px] py-[24px] text-center text-[14px] text-[#9c9c9c]">
                                                    Bạn không có giao dịch.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTradeHistory.map((trade, index) => (
                                                <tr key={trade.id} className="border-t border-[#F5F5F5] hover:bg-gray-50 dark:border-[#373c43] dark:text-[#eaecef] dark:hover:bg-gray-800">
                                                    <td className="px-[12px] py-[12px] text-[12px]">{filteredTradeHistory.length - index}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatTime(trade.timestamp)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{trade.market.replace('_', '/')}</td>
                                                    <td className={`px-[12px] py-[12px] text-[12px] ${getSideColor(trade.side)}`}>{trade.side.toUpperCase()}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(trade.price), 2)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(trade.amount), 5)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(trade.fee), 6)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{trade.counterparty.type === 'BUYER' ? 'Maker' : 'Taker'}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">--</td>
                                                    <td className="px-[12px] py-[12px] text-[12px]">{formatNumber(Number(trade.total), 2)}</td>
                                                    <td className="px-[12px] py-[12px] text-[12px] text-right">{formatNumber(Number(trade.total), 2)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}