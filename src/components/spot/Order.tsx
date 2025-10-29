"use client";
import { useState, useRef, useEffect } from "react";

type MainTab = "spot" | "crossMargin" | "isolated" | "grid";
type OrderTab = "limit" | "market" | "stopLimit";

export default function Order() {
    const [mainTab, setMainTab] = useState<MainTab>("spot");
    const [orderTab, setOrderTab] = useState<OrderTab>("limit");
    const [buyPrice, setBuyPrice] = useState<string>("114.458,41");
    const [buyAmount, setBuyAmount] = useState<string>("0,00001");
    const [sellPrice, setSellPrice] = useState<string>("114.458,41");
    const [sellAmount, setSellAmount] = useState<string>("0,00000");
    const [buyTpSl, setBuyTpSl] = useState(false);
    const [sellTpSl, setSellTpSl] = useState(false);

    // Refs để quản lý cursor position
    const buyPriceRef = useRef<HTMLInputElement>(null);
    const buyAmountRef = useRef<HTMLInputElement>(null);
    const sellPriceRef = useRef<HTMLInputElement>(null);
    const sellAmountRef = useRef<HTMLInputElement>(null);
    const cursorPositionRef = useRef<number>(0);

    // Parse từ format châu Âu về số
    const parseNumber = (str: string): number => {
        if (!str) return 0;
        const cleaned = str.replace(/\./g, "").replace(",", ".");
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };

    // Format input với việc quản lý cursor
    const formatInput = (
        value: string,
        decimals: number,
        inputRef: React.RefObject<HTMLInputElement | null>
    ): string => {
        // Lưu vị trí cursor hiện tại
        const cursorPos = inputRef.current?.selectionStart || 0;
        const oldValue = inputRef.current?.value || "";

        // Chỉ cho phép số, dấu chấm và dấu phẩy
        const cleaned = value.replace(/[^\d.,]/g, "");
        if (!cleaned) return "";

        // Parse số
        const num = parseNumber(cleaned);
        if (isNaN(num)) return "";

        // Format lại
        const [integerPart, decimalPart = ""] = num.toFixed(decimals).split(".");
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        const formatted = `${formattedInteger},${decimalPart}`;

        // Tính toán vị trí cursor mới
        const oldLength = oldValue.length;
        const newLength = formatted.length;
        const diff = newLength - oldLength;
        cursorPositionRef.current = Math.max(0, cursorPos + diff);

        return formatted;
    };

    // Restore cursor position sau khi format
    useEffect(() => {
        if (buyPriceRef.current && document.activeElement === buyPriceRef.current) {
            buyPriceRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        }
        if (buyAmountRef.current && document.activeElement === buyAmountRef.current) {
            buyAmountRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        }
        if (sellPriceRef.current && document.activeElement === sellPriceRef.current) {
            sellPriceRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        }
        if (sellAmountRef.current && document.activeElement === sellAmountRef.current) {
            sellAmountRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        }
    });

    // Xử lý thay đổi input - format ngay
    const handleInputChange = (
        value: string,
        setter: (val: string) => void,
        decimals: number,
        inputRef: React.RefObject<HTMLInputElement | null>
    ) => {
        const formatted = formatInput(value, decimals, inputRef);
        setter(formatted);
    };

    // Tăng/giảm giá trị
    const adjustValue = (
        currentValue: string,
        step: number,
        setter: (val: string) => void,
        decimals: number
    ) => {
        const num = parseNumber(currentValue);
        const newValue = Math.max(0, num + step);
        const [integerPart, decimalPart = ""] = newValue.toFixed(decimals).split(".");
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setter(`${formattedInteger},${decimalPart}`);
    };

    const mainTabs = [
        { id: "spot" as MainTab, label: "Spot" },
        { id: "crossMargin" as MainTab, label: "Cross Margin" },
        { id: "isolated" as MainTab, label: "Isolated" },
        { id: "grid" as MainTab, label: "Lưới" },
    ];

    const orderTabs = [
        { id: "limit" as OrderTab, label: "Giới hạn" },
        { id: "market" as OrderTab, label: "Thị trường" },
        { id: "stopLimit" as OrderTab, label: "Stop Limit" },
    ];

    return (
        <div className="bg-white min-h-[350px] rounded-[8px] flex flex-col">
            {/* Main Tabs */}
            <div className="px-[16px] border-b border-gray-200">
                <div className="flex gap-[24px]">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setMainTab(tab.id)}
                            className={`text-[14px] font-medium pb-[6px] pt-[12px] transition-colors ${mainTab === tab.id
                                ? "text-black border-b-2 border-[#FDDD5D]"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Type Tabs */}
            <div className="px-[16px] pt-[12px] border-b border-gray-100">
                <div className="flex gap-[16px]">
                    {orderTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setOrderTab(tab.id)}
                            className={`text-[14px] font-medium pb-[8px] transition-colors ${orderTab === tab.id
                                ? "text-black"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Buy/Sell Grid */}
            <div className="flex-1 grid grid-cols-2 gap-[8px] p-[16px]">
                {/* Buy Side */}
                <div className="flex flex-col gap-[12px]">
                    {/* Price Input */}
                    <div>
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Giá
                            </span>
                            <input
                                ref={buyPriceRef}
                                type="text"
                                value={buyPrice}
                                onChange={(e) => handleInputChange(e.target.value, setBuyPrice, 2, buyPriceRef)}
                                className="w-full px-[12px] py-[8px] pr-[80px] text-[14px] border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-right"
                            />
                            <span className="absolute right-[35px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                USDT
                            </span>
                            <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                    onClick={() => adjustValue(buyPrice, 0.01, setBuyPrice, 2)}
                                    className="w-[20px] h-[16px] border border-gray-300 rounded-t text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▲</button>
                                <button
                                    onClick={() => adjustValue(buyPrice, -0.01, setBuyPrice, 2)}
                                    className="w-[20px] h-[16px] border border-gray-300 border-t-0 rounded-b text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▼</button>
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Số lượng
                            </span>
                            <input
                                ref={buyAmountRef}
                                type="text"
                                value={buyAmount}
                                onChange={(e) => handleInputChange(e.target.value, setBuyAmount, 5, buyAmountRef)}
                                className="w-full px-[12px] py-[8px] pr-[70px] text-[14px] border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-right"
                            />
                            <span className="absolute right-[35px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                BTC
                            </span>
                            <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                    onClick={() => adjustValue(buyAmount, 0.00001, setBuyAmount, 5)}
                                    className="w-[20px] h-[16px] border border-gray-300 rounded-t text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▲</button>
                                <button
                                    onClick={() => adjustValue(buyAmount, -0.00001, setBuyAmount, 5)}
                                    className="w-[20px] h-[16px] border border-gray-300 border-t-0 rounded-b text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▼</button>
                            </div>
                        </div>
                    </div>

                    {/* Slider */}
                    <div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            className="w-full h-[4px] bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                        />
                    </div>

                    {/* TP/SL Checkbox */}
                    <div className="flex items-center gap-[8px]">
                        <input
                            type="checkbox"
                            id="buy-tpsl"
                            checked={buyTpSl}
                            onChange={(e) => setBuyTpSl(e.target.checked)}
                            className="w-[16px] h-[16px]"
                        />
                        <label htmlFor="buy-tpsl" className="text-[12px] text-gray-700">
                            TP/SL
                        </label>
                    </div>

                    <div className="">
                        {/* Available Balance */}
                        <div className="flex justify-between text-[12px]">
                            <span className="text-gray-500">Khả dụng</span>
                            <span className="text-gray-900">-- USDT</span>
                        </div>

                        {/* Max Link */}
                        <div>
                            {/* Available Balance */}
                            <div className="flex justify-between text-[12px]">
                                <span className="text-gray-500">Mua tối đa</span>
                                <span className="text-gray-900">-- BTC</span>
                            </div>
                        </div>
                    </div>

                    {/* Buy Button */}
                    <button className="w-full  h-[36px] bg-green-500 hover:bg-green-600 text-white font-medium rounded transition-colors text-[14px]">
                        Đăng nhập
                    </button>
                </div>

                {/* Sell Side */}
                <div className="flex flex-col gap-[12px]">
                    {/* Price Input */}
                    <div>
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Giá
                            </span>
                            <input
                                ref={sellPriceRef}
                                type="text"
                                value={sellPrice}
                                onChange={(e) => handleInputChange(e.target.value, setSellPrice, 2, sellPriceRef)}
                                className="w-full px-[12px] py-[8px] pr-[80px] text-[14px] border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-right"
                            />
                            <span className="absolute right-[35px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                USDT
                            </span>
                            <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                    onClick={() => adjustValue(sellPrice, 0.01, setSellPrice, 2)}
                                    className="w-[20px] h-[16px] border border-gray-300 rounded-t text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▲</button>
                                <button
                                    onClick={() => adjustValue(sellPrice, -0.01, setSellPrice, 2)}
                                    className="w-[20px] h-[16px] border border-gray-300 border-t-0 rounded-b text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▼</button>
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Số lượng
                            </span>
                            <input
                                ref={sellAmountRef}
                                type="text"
                                value={sellAmount}
                                onChange={(e) => handleInputChange(e.target.value, setSellAmount, 5, sellAmountRef)}
                                className="w-full px-[12px] py-[8px] pr-[70px] text-[14px] border border-gray-300 rounded focus:outline-none focus:border-gray-400 text-right"
                            />
                            <span className="absolute right-[35px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                BTC
                            </span>
                            <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                    onClick={() => adjustValue(sellAmount, 0.00001, setSellAmount, 5)}
                                    className="w-[20px] h-[16px] border border-gray-300 rounded-t text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▲</button>
                                <button
                                    onClick={() => adjustValue(sellAmount, -0.00001, setSellAmount, 5)}
                                    className="w-[20px] h-[16px] border border-gray-300 border-t-0 rounded-b text-gray-500 hover:bg-gray-50 flex items-center justify-center text-[10px]"
                                >▼</button>
                            </div>
                        </div>
                    </div>

                    {/* Slider */}
                    <div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            className="w-full h-[4px] bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                        />
                    </div>

                    {/* TP/SL Checkbox */}
                    <div className="flex items-center gap-[8px]">
                        <input
                            type="checkbox"
                            id="sell-tpsl"
                            checked={sellTpSl}
                            onChange={(e) => setSellTpSl(e.target.checked)}
                            className="w-[16px] h-[16px]"
                        />
                        <label htmlFor="sell-tpsl" className="text-[12px] text-gray-700">
                            TP/SL
                        </label>
                    </div>

                    <div className="">
                        {/* Available Balance */}
                        <div className="flex justify-between text-[12px]">
                            <span className="text-gray-500">Khả dụng</span>
                            <span className="text-gray-900">-- BTC</span>
                        </div>

                        {/* Max Link */}
                        <div>
                            {/* Available Balance */}
                            <div className="flex justify-between text-[12px]">
                                <span className="text-gray-500">Bán tối đa</span>
                                <span className="text-gray-900">-- USDT</span>
                            </div>
                        </div>
                    </div>

                    {/* Sell Button */}
                    <button className="w-full h-[36px] bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors text-[14px]">
                        Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
}