"use client"
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CiSearch } from "react-icons/ci";
import { IoChevronDown } from "react-icons/io5";
import DateFilters from "@/components/DateFilters";

interface TableHeader {
    label: string;
    hasDropdown: boolean;
    align?: "left" | "right";
}

export default function OpenOrders() {
    const [activeTab, setActiveTab] = useState("orders");
    const [hideOtherPairs, setHideOtherPairs] = useState(false);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
    const [sortByTime] = useState("Sắp xếp theo thời gian đặt lệnh"); // TODO: Implement dropdown later
    const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    // Thay đổi thành true để test giao diện đã đăng nhập
    const isLoggedIn = true;

    const tabs = [
        { id: "orders", label: "Giao dịch đang chờ khớp lệnh", count: 0 },
        { id: "history", label: "Lịch sử lệnh", count: null },
        { id: "trade-history", label: "Lịch sử giao dịch", count: null },
        { id: "funds", label: "Vốn", count: null },
        { id: "bot", label: "Bot", count: null },
    ];

    const ordersTableHeaders: TableHeader[] = [
        { label: "Ngày giờ", hasDropdown: false },
        { label: "Cặp", hasDropdown: false },
        { label: "Loại", hasDropdown: true },
        { label: "Bên", hasDropdown: true },
        { label: "Giá", hasDropdown: true },
        { label: "Số lượng", hasDropdown: false },
        { label: "Số tiền trên môi Lệnh tăng bằng", hasDropdown: false },
        { label: "Đã khớp", hasDropdown: false },
        { label: "Tổng", hasDropdown: false },
        { label: "Điều kiện kích hoạt", hasDropdown: false },
        { label: "SOR", hasDropdown: false },
        { label: "TP/SL", hasDropdown: false },
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
        { label: "Số tiền trên môi Lệnh tăng bằng", hasDropdown: false },
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
        // TODO: Fetch data with new date range
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
        <div className="min-h-[560px] bg-white rounded-[8px] flex flex-col">
            {/* Tabs */}
            <div className="flex items-center justify-between px-[16px] border-b border-[#F5F5F5]">
                <div className="flex items-center gap-[24px] h-[42px] relative">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            ref={(el) => {
                                tabsRef.current[tab.id] = el;
                            }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-[12px] text-[14px] font-medium transition-colors ${activeTab === tab.id
                                ? "text-[#F0B90B]"
                                : "text-[#9c9c9c] hover:text-black"
                                }`}
                        >
                            {tab.label}
                            {tab.count !== null && `(${tab.count})`}
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

                {isLoggedIn && activeTab === "orders" && (
                    <label className="flex items-center gap-[8px] text-[12px] font-medium cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hideOtherPairs}
                            onChange={(e) => setHideOtherPairs(e.target.checked)}
                            className="w-[16px] h-[16px] cursor-pointer"
                        />
                        Ẩn các cặp tỉ giá khác
                    </label>
                )}
                {isLoggedIn && (activeTab === "history" || activeTab === "trade-history") && (
                    <div className="flex items-center gap-[12px]">
                        <button className="flex items-center gap-[4px] text-[12px] text-[#9c9c9c] hover:text-black">
                            {sortByTime}
                            <IoChevronDown className="text-[14px]" />
                        </button>
                        <label className="flex items-center gap-[8px] text-[12px] font-medium cursor-pointer">
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
            {!isLoggedIn ? (
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
                                                        className={`flex items-center gap-[4px] ${justifyClass} hover:text-black transition-colors ${sortColumn === header.label ? "text-black" : ""
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
                        </table>
                    </div>

                    {/* Empty State */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-[16px]">
                        <CiSearch className="text-[100px] bg-[#F5F5F5] p-[20px] rounded-[8px] font-bold text-[#9c9c9c]" />
                        <p className="text-[14px] text-[#9c9c9c]">
                            {activeTab === "history"
                                ? "Bạn không có lịch sử đặt lệnh."
                                : activeTab === "trade-history"
                                    ? "Bạn không có giao dịch."
                                    : "Bạn không có lệnh đang mở."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}