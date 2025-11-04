"use client"
import { useState } from "react";

interface DateFiltersProps {
    onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export default function DateFilters({ onDateRangeChange }: DateFiltersProps) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [dateFilter, setDateFilter] = useState("1 ngày");
    const [startDate, setStartDate] = useState(yesterday.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const handleDateFilterClick = (filter: string) => {
        setDateFilter(filter);

        const now = new Date();
        const start = new Date();

        switch (filter) {
            case "1 ngày":
                start.setDate(now.getDate() - 1);
                break;
            case "1 Tuần":
                start.setDate(now.getDate() - 7);
                break;
            case "1 Tháng":
                start.setMonth(now.getMonth() - 1);
                break;
            case "3 Tháng":
                start.setMonth(now.getMonth() - 3);
                break;
            case "Thời gian":
                // Không tự động log, đợi user chọn và click "Tìm"
                return;
        }

        const startStr = start.toISOString().split('T')[0];
        const endStr = now.toISOString().split('T')[0];

        setStartDate(startStr);
        setEndDate(endStr);

        if (onDateRangeChange) {
            onDateRangeChange(startStr, endStr);
        }
    };

    const handleSearch = () => {
        if (onDateRangeChange) {
            onDateRangeChange(startDate, endDate);
        }
    };

    const handleReset = () => {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const todayStr = now.toISOString().split('T')[0];

        setStartDate(yesterdayStr);
        setEndDate(todayStr);
        setDateFilter("1 ngày");

        if (onDateRangeChange) {
            onDateRangeChange(yesterdayStr, todayStr);
        }
    };

    return (
        <div className="flex items-center gap-[8px] px-[16px] py-[12px] border-b border-[#F5F5F5] dark:border-[#373c43] flex-wrap">
            {["1 ngày", "1 Tuần", "1 Tháng", "3 Tháng", "Thời gian"].map((filter) => (
                <button
                    key={filter}
                    onClick={() => handleDateFilterClick(filter)}
                    className={`px-[12px] py-[4px] text-[12px] rounded-[4px]  ${dateFilter === filter
                        ? "bg-[#FEF6E6] text-[#F0B90B]"
                        : "text-[#9c9c9c] hover:bg-gray-50"
                        }`}
                >
                    {filter}
                </button>
            ))}
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={dateFilter !== "Thời gian"}
                className={`px-[12px] py-[4px] text-[12px] rounded-[4px] border border-[#E5E5E5] ${dateFilter !== "Thời gian"
                    ? "text-[#9c9c9c] bg-gray-50 cursor-not-allowed"
                    : "text-black hover:border-[#F0B90B]"
                    }`}
            />
            <span className="text-[#9c9c9c]">→</span>
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={dateFilter !== "Thời gian"}
                className={`px-[12px] py-[4px] text-[12px] rounded-[4px] border border-[#E5E5E5] ${dateFilter !== "Thời gian"
                    ? "text-[#9c9c9c] bg-gray-50 cursor-not-allowed"
                    : "text-black hover:border-[#F0B90B]"
                    }`}
            />
            <button
                onClick={handleSearch}
                className="px-[12px] py-[4px] text-[12px] text-white bg-[#F0B90B] hover:bg-[#d9a60a] rounded-[4px]"
            >
                Tìm
            </button>
            <button
                onClick={handleReset}
                className="px-[12px] py-[4px] text-[12px] text-[#9c9c9c] hover:bg-gray-50 rounded-[4px]"
            >
                Đặt lại
            </button>
        </div>
    );
}

