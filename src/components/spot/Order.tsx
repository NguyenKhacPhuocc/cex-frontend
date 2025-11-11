"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSpot } from "@/contexts/SpotContext";
import { useAllBalances, Balance } from "@/hooks/useBalances";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useTicker } from "@/hooks/useTicker";
import { HiDotsVertical } from "react-icons/hi";
import { toast } from "react-hot-toast";

type MainTab = "spot" | "crossMargin" | "isolated" | "grid";
type OrderTab = "limit" | "market" | "stopLimit";

export default function Order() {
    const { isLogin } = useAuth();
    const { symbol, assetToken, baseToken } = useSpot();

    const [mainTab, setMainTab] = useState<MainTab>("spot");
    const [orderTab, setOrderTab] = useState<OrderTab>("limit");
    const [buyPrice, setBuyPrice] = useState<string>("");
    const [buyAmount, setBuyAmount] = useState<string>("");
    const [sellPrice, setSellPrice] = useState<string>("");
    const [sellAmount, setSellAmount] = useState<string>("");
    const [buyTpSl, setBuyTpSl] = useState(false);
    const [sellTpSl, setSellTpSl] = useState(false);
    const [buySlider, setBuySlider] = useState<number>(0);
    const [sellSlider, setSellSlider] = useState<number>(0);

    // Input asset type: 'base' (BTC) or 'quote' (USDT)
    const [buyInputAsset, setBuyInputAsset] = useState<'base' | 'quote'>('base');
    const [sellInputAsset, setSellInputAsset] = useState<'base' | 'quote'>('quote');

    // Dropdown state
    const [buyAssetDropdownOpen, setBuyAssetDropdownOpen] = useState(false);
    const [sellAssetDropdownOpen, setSellAssetDropdownOpen] = useState(false);

    // Refs for dropdown click outside detection
    const buyDropdownRef = useRef<HTMLDivElement>(null);
    const sellDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buyDropdownRef.current && !buyDropdownRef.current.contains(event.target as Node)) {
                setBuyAssetDropdownOpen(false);
            }
            if (sellDropdownRef.current && !sellDropdownRef.current.contains(event.target as Node)) {
                setSellAssetDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reset input asset type to 'base' when switching to limit orders
    useEffect(() => {
        if (orderTab === 'limit') {
            setBuyInputAsset('base');
            setSellInputAsset('base');
            setBuyAssetDropdownOpen(false);
            setSellAssetDropdownOpen(false);
        }
    }, [orderTab]);

    // Get current ticker price for market orders

    // Fetch balances using React Query
    const balances = useAllBalances(isLogin);
    const spotBalances = balances.spot.data || [];
    const futuresBalances = balances.futures.data || [];
    const fundingBalances = balances.funding.data || [];
    const isLoadingBalances = balances.isLoading;

    // Get current ticker price for market orders
    const { ticker } = useTicker(symbol);

    // Place order mutation
    const placeOrderMutation = usePlaceOrder();

    const mainTabs = [
        { id: "spot" as MainTab, label: "Spot" },
        { id: "crossMargin" as MainTab, label: "Cross Margin" },
        { id: "isolated" as MainTab, label: "Isolated" },
        { id: "grid" as MainTab, label: "Lưới" },
    ];

    const orderTabs = [
        { id: "limit" as OrderTab, label: "Giới hạn" },
        { id: "market" as OrderTab, label: "Thị trường" },
        // { id: "stopLimit" as OrderTab, label: "Stop Limit" },
    ];

    // Helper function to get balance by asset with proper decimal formatting
    const getBalance = (asset: string, decimals?: number): string => {
        if (!isLogin || isLoadingBalances) return '--';

        let balances: Balance[] = [];

        // Chọn balances theo mainTab
        if (mainTab === 'spot') balances = spotBalances;
        else if (mainTab === 'crossMargin' || mainTab === 'isolated') balances = futuresBalances;
        else if (mainTab === 'grid') balances = fundingBalances;

        const balance = balances.find(b => b.asset === asset);
        if (!balance) {
            // Auto-detect decimals based on asset type
            const defaultDecimals = decimals ?? (asset === assetToken ? 5 : 2);
            return '0.' + '0'.repeat(defaultDecimals);
        }

        // Parse and format with specified decimals
        const value = parseFloat(balance.available);
        const formatDecimals = decimals ?? (asset === assetToken ? 5 : 2);

        return value.toFixed(formatDecimals);
    };

    // Get raw balance as number
    const getRawBalance = (asset: string): number => {
        if (!isLogin || isLoadingBalances) return 0;

        let balances: Balance[] = [];
        if (mainTab === 'spot') balances = spotBalances;
        else if (mainTab === 'crossMargin' || mainTab === 'isolated') balances = futuresBalances;
        else if (mainTab === 'grid') balances = fundingBalances;

        const balance = balances.find(b => b.asset === asset);
        return balance ? parseFloat(balance.available) : 0;
    };

    // Tính toán Tổng (Total) = Giá × Số lượng
    // For BUY: Total depends on input asset type
    const buyTotal = (() => {
        if (!buyPrice || !buyAmount) return '0.00000';
        if (buyInputAsset === 'quote') {
            // Input is USDT, amount is in USDT
            return parseFloat(buyAmount).toFixed(5);
        } else {
            // Input is BTC, total = price * amount
            return (parseFloat(buyPrice) * parseFloat(buyAmount)).toFixed(5);
        }
    })();

    // For SELL: Total depends on input asset type
    const sellTotal = (() => {
        if (!sellPrice || !sellAmount) return '0.00000';
        if (sellInputAsset === 'base') {
            // Input is BTC, total = price * amount
            return (parseFloat(sellPrice) * parseFloat(sellAmount)).toFixed(5);
        } else {
            // Input is USDT, amount is in USDT
            return parseFloat(sellAmount).toFixed(5);
        }
    })();

    // Tính toán Mua tối đa - luôn trả về số lượng BTC có thể mua
    const getMaxBuyAmount = (): string => {
        if (!isLogin) return '--';

        // Always calculate max BTC that can be bought
        if (orderTab === 'market') {
            if (!ticker?.price) return '--';
            const price = ticker.price;
            const balance = getRawBalance(baseToken);
            const maxAmount = balance / price;
            return maxAmount.toFixed(5);
        } else {
            if (!buyPrice) return '--';
            const price = parseFloat(buyPrice);
            if (price <= 0) return '--';
            const balance = getRawBalance(baseToken);
            const maxAmount = balance / price;
            return maxAmount.toFixed(5);
        }
    };

    // Tính toán Bán tối đa
    const getMaxSellTotal = (): string => {
        if (!isLogin) return '--';

        if (orderTab === 'limit') {
            // Limit orders: Always return USDT (price * available BTC)
            if (!sellPrice) return '--';
            const price = parseFloat(sellPrice);
            if (price <= 0) return '--';
            const balance = getRawBalance(assetToken);
            const maxTotal = balance * price;
            return maxTotal.toFixed(2);
        } else {
            // Market orders: depends on input asset type
            if (sellInputAsset === 'base') {
                // Input is BTC - max is available BTC
                const balance = getRawBalance(assetToken);
                return balance.toFixed(5);
            } else {
                // Input is USDT - max is available BTC * price
                if (!ticker?.price) return '--';
                const price = ticker.price;
                const balance = getRawBalance(assetToken);
                const maxTotal = balance * price;
                return maxTotal.toFixed(2);
            }
        }
    };

    // Handler cho Buy Slider
    const handleBuySlider = (value: number) => {
        setBuySlider(value);

        if (!isLogin) return;

        if (buyInputAsset === 'quote') {
            // Input is USDT - slider represents % of USDT to use
            const balance = getRawBalance(baseToken);
            const usdtToUse = (balance * value) / 100;
            setBuyAmount(usdtToUse.toString());
        } else {
            // Input is BTC - slider represents % of max BTC we can buy with all USDT
            if (orderTab === 'market' && !ticker?.price) return;
            const price = orderTab === 'market' ? (ticker?.price || 0) : parseFloat(buyPrice);
            if (price <= 0) return;

            const balance = getRawBalance(baseToken);
            const maxBTC = balance / price;
            const amount = (maxBTC * value) / 100;
            setBuyAmount(amount.toString());
        }
    };

    // Handler cho Sell Slider
    const handleSellSlider = (value: number) => {
        setSellSlider(value);

        if (!isLogin) return;

        if (sellInputAsset === 'base') {
            // Input is BTC - slider represents % of BTC to sell
            const balance = getRawBalance(assetToken);
            const amount = (balance * value) / 100;
            setSellAmount(amount.toString());
        } else {
            // Input is USDT - slider represents % of max USDT we can receive (all BTC)
            if (orderTab === 'market' && !ticker?.price) return;
            const price = orderTab === 'market' ? (ticker?.price || 0) : parseFloat(sellPrice);
            if (price <= 0) return;

            const balance = getRawBalance(assetToken);
            const maxUSDT = balance * price; // Total USDT value of all BTC
            const usdtToReceive = (maxUSDT * value) / 100;
            setSellAmount(usdtToReceive.toString());
        }
    };

    // Handler cho Buy Order
    const handleBuyOrder = async () => {
        if (!isLogin) {
            window.location.href = '/login';
            return;
        }

        // Validation
        if (!buyAmount || parseFloat(buyAmount) <= 0) {
            toast.error('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        if (orderTab === 'limit' && (!buyPrice || parseFloat(buyPrice) <= 0)) {
            toast.error('Vui lòng nhập giá hợp lệ');
            return;
        }

        // Check balance based on input asset type
        if (buyInputAsset === 'quote') {
            // Input is USDT - check USDT balance
            const balance = getRawBalance(baseToken);
            const usdtAmount = parseFloat(buyAmount);

            if (balance < usdtAmount) {
                toast.error(`Số dư ${baseToken} không đủ`);
                return;
            }
        } else {
            // Input is BTC - check USDT balance
            if (orderTab === 'market') {
                // Market order: will lock all USDT, just check if we have any
                const balance = getRawBalance(baseToken);
                if (balance <= 0) {
                    toast.error(`Số dư ${baseToken} không đủ`);
                    return;
                }
            } else {
                // Limit order: check if we have enough USDT for the order
                const balance = getRawBalance(baseToken);
                const total = parseFloat(buyPrice) * parseFloat(buyAmount);
                if (balance < total) {
                    toast.error(`Số dư ${baseToken} không đủ`);
                    return;
                }
            }
        }

        try {
            // Calculate actual amount to send to backend
            // Backend always expects amount in base asset (BTC)
            let amountToSend = parseFloat(buyAmount);
            let originalQuoteAmount: number | undefined = undefined;

            if (buyInputAsset === 'quote') {
                // Input is USDT, need to convert to BTC
                const usdtAmount = parseFloat(buyAmount);

                if (orderTab === 'market') {
                    // Market order: use current ticker price
                    if (!ticker?.price) {
                        toast.error('Không thể lấy giá thị trường hiện tại');
                        return;
                    }
                    amountToSend = usdtAmount / ticker.price;
                    // Store original USDT amount for backend to lock exactly this amount
                    originalQuoteAmount = usdtAmount;
                } else {
                    // Limit order: use specified price
                    amountToSend = usdtAmount / parseFloat(buyPrice);
                    // For limit orders, backend can calculate USDT from price * amount
                    // But still send for clarity
                    originalQuoteAmount = usdtAmount;
                }
            }
            // If input is base (BTC), amount is already correct

            // For market orders, include current price at the time of order placement
            const marketPrice = orderTab === 'market' && ticker?.price ? ticker.price : undefined;

            await placeOrderMutation.mutateAsync({
                marketSymbol: symbol,
                side: 'buy',
                type: orderTab as 'limit' | 'market',
                price: orderTab === 'limit' ? parseFloat(buyPrice) : marketPrice,
                amount: amountToSend,
                inputAssetType: buyInputAsset, // Send input asset type
                originalQuoteAmount: originalQuoteAmount, // Send original USDT amount if input is USDT
            });

            toast.success(`Đã đặt lệnh mua ${assetToken} thành công!`);
            // Reset form
            setBuyAmount('');
            setBuySlider(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
            toast.error(`Đặt lệnh thất bại: ${errorMessage}`);
        }
    };

    // Handler cho Sell Order
    const handleSellOrder = async () => {
        if (!isLogin) {
            window.location.href = '/login';
            return;
        }

        // Validation
        if (!sellAmount || parseFloat(sellAmount) <= 0) {
            toast.error('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        if (orderTab === 'limit' && (!sellPrice || parseFloat(sellPrice) <= 0)) {
            toast.error('Vui lòng nhập giá hợp lệ');
            return;
        }

        // Check balance based on input asset type
        if (sellInputAsset === 'base') {
            // Input is BTC - check BTC balance
            const balance = getRawBalance(assetToken);
            const btcAmount = parseFloat(sellAmount);

            if (balance < btcAmount) {
                toast.error(`Số dư ${assetToken} không đủ`);
                return;
            }
        } else {
            // Input is USDT - for market orders, will lock all BTC
            if (orderTab === 'market') {
                // Market order: will lock all BTC, just check if we have any
                const balance = getRawBalance(assetToken);
                if (balance <= 0) {
                    toast.error(`Số dư ${assetToken} không đủ`);
                    return;
                }
            } else {
                // Limit order: calculate BTC needed from USDT amount
                const price = parseFloat(sellPrice);
                const usdtAmount = parseFloat(sellAmount);
                const btcNeeded = usdtAmount / price;
                const balance = getRawBalance(assetToken);

                if (balance < btcNeeded) {
                    toast.error(`Số dư ${assetToken} không đủ`);
                    return;
                }
            }
        }

        try {
            // Calculate actual amount to send to backend
            // Backend always expects amount in base asset (BTC)
            let amountToSend = parseFloat(sellAmount);

            if (sellInputAsset === 'quote') {
                // Input is USDT, need to convert to BTC
                if (orderTab === 'market') {
                    // Market order: use current ticker price
                    if (!ticker?.price) {
                        toast.error('Không thể lấy giá thị trường hiện tại');
                        return;
                    }
                    amountToSend = parseFloat(sellAmount) / ticker.price;
                } else {
                    // Limit order: use specified price
                    amountToSend = parseFloat(sellAmount) / parseFloat(sellPrice);
                }
            }
            // If input is base (BTC), amount is already correct

            // For market orders, include current price at the time of order placement
            const marketPrice = orderTab === 'market' && ticker?.price ? ticker.price : undefined;

            await placeOrderMutation.mutateAsync({
                marketSymbol: symbol,
                side: 'sell',
                type: orderTab as 'limit' | 'market',
                price: orderTab === 'limit' ? parseFloat(sellPrice) : marketPrice,
                amount: amountToSend,
                inputAssetType: sellInputAsset, // Send input asset type
                originalQuoteAmount: sellInputAsset === 'quote' ? parseFloat(sellAmount) : undefined, // Send original USDT amount if input is USDT
            });

            toast.success(`Đã đặt lệnh bán ${assetToken} thành công!`);

            // Reset form
            setSellAmount('');
            setSellSlider(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
            toast.error(`Đặt lệnh thất bại: ${errorMessage}`);
        }
    };

    return (
        <div id="order" className="bg-white min-h-[440px] dark:bg-[#181A20]  rounded-[8px] flex flex-col">
            {/* Main Tabs */}
            <div className="px-[16px] border-b border-gray-200 dark:border-[#373c43]">
                <div className="flex gap-[24px]">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setMainTab(tab.id)}
                            className={`text-[14px] font-[500] pb-[6px] pt-[12px] transition-colors ${mainTab === tab.id
                                ? "text-black border-b-2 border-[#FDDD5D] dark:text-[#eaecef]"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Type Tabs */}
            <div className="px-[16px] pt-[12px] border-b border-gray-100 dark:border-[#373c43]">
                <div className="flex gap-[16px]">
                    {orderTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setOrderTab(tab.id)}
                            className={`text-[14px] font-medium pb-[8px] transition-colors ${orderTab === tab.id
                                ? "text-black border-b-2 dark:text-[#eaecef] border-[#FDDD5D]"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                        <HiDotsVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Buy/Sell Grid */}
            <div className="flex-1 grid grid-cols-2 gap-[16px] p-[16px]">
                {/* Buy Side */}
                <div className="flex flex-col gap-[12px]">
                    {/* Price Input */}
                    <div>
                        <div className="relative font-[500]">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Giá
                            </span>
                            <input
                                type={orderTab === 'market' ? 'text' : 'number'}
                                step="0.01"
                                value={orderTab === 'market' ? 'Giá thị trường' : buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                disabled={orderTab === 'market'}
                                className={`w-full px-[12px] py-[8px] pr-[60px] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none focus:border-gray-400 dark:border-[#373c43] dark:text-[#eaecef] text-right ${orderTab === 'market' ? 'bg-gray-300 dark:bg-gray-800 cursor-not-allowed text-gray-500' : ''}`}
                            />
                            <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                {baseToken}
                            </span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <div className="relative font-[500]">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Số lượng
                            </span>
                            <input
                                type="number"
                                step="0.00001"
                                min={0}
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(e.target.value)}
                                placeholder=""
                                className={`w-full px-[12px] py-[8px] ${orderTab === 'market' ? 'pr-[90px]' : 'pr-[50px]'} dark:border-[#373c43] dark:text-[#eaecef] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none focus:border-gray-400 text-right`}
                            />
                            {/* Asset Selector Dropdown - Only show for market orders */}
                            {orderTab === 'market' ? (
                                <div ref={buyDropdownRef} className="absolute right-[4px] top-1/2 -translate-y-1/2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setBuyAssetDropdownOpen(!buyAssetDropdownOpen);
                                            setSellAssetDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                    >
                                        <span>{buyInputAsset === 'base' ? assetToken : baseToken}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {buyAssetDropdownOpen && (
                                        <div className="absolute right-0 mt-1 w-[100px] bg-white dark:bg-[#1E2026] border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBuyInputAsset('base');
                                                    setBuyAssetDropdownOpen(false);
                                                    setBuyAmount('');
                                                    setBuySlider(0);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-[14px] hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${buyInputAsset === 'base' ? 'text-[#2EBD85] font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                            >
                                                <span>{assetToken}</span>
                                                {buyInputAsset === 'base' && <span>✓</span>}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBuyInputAsset('quote');
                                                    setBuyAssetDropdownOpen(false);
                                                    setBuyAmount('');
                                                    setBuySlider(0);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-[14px] hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${buyInputAsset === 'quote' ? 'text-[#2EBD85] font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                            >
                                                <span>{baseToken}</span>
                                                {buyInputAsset === 'quote' && <span>✓</span>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                    {assetToken}
                                </span>
                            )}
                        </div>
                        <div className={`h-[20px]  mt-[4px] ${orderTab === 'market' ? 'block' : 'hidden'}`}>
                            {/* Helper text for market orders */}
                            {orderTab === 'market' && buyInputAsset === 'base' && (
                                <p className="text-[12px] text-gray-500">
                                    Toàn bộ {baseToken} sẽ bị khóa để đảm bảo đủ số dư
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Slider */}
                    <div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={buySlider}
                            onChange={(e) => handleBuySlider(Number(e.target.value))}
                            style={{
                                background: `linear-gradient(to right, #2EBD85 0%, #2EBD85 ${buySlider}%, #e5e7eb ${buySlider}%, #e5e7eb 100%)`
                            }}
                            className="w-full h-[4px] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:bg-[#2EBD85] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2EBD85] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:rotate-45 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:bg-[#2EBD85] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2EBD85] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:rotate-45"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Total Input - Hidden for Market orders */}
                    {orderTab !== 'market' && (
                        <div>
                            <div className="relative font-[500]">
                                <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                    Tổng
                                </span>
                                <input
                                    type="text"
                                    value={buyTotal}
                                    readOnly
                                    className="w-full px-[12px] py-[8px] pr-[50px] dark:border-[#373c43] dark:text-[#eaecef] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none bg-gray-50 text-right cursor-not-allowed dark:bg-transparent"
                                />
                                <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                    {baseToken}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* TP/SL or Slippage Checkbox */}
                    <div className="flex items-center gap-[8px]">
                        <input
                            type="checkbox"
                            id="buy-tpsl"
                            checked={buyTpSl}
                            onChange={(e) => setBuyTpSl(e.target.checked)}
                            className="w-[16px] h-[16px]"
                        />
                        <label htmlFor="buy-tpsl" className="text-[12px] text-gray-700 dark:text-[#eaecef]">
                            {orderTab === 'market' ? 'Khả năng chống trượt giá' : 'TP/SL'}
                        </label>
                    </div>

                    <div className="">
                        {/* Available Balance */}
                        <div className="flex justify-between text-[12px]">
                            <span className="text-gray-500">Khả dụng</span>
                            <span className="text-gray-900 dark:text-[#eaecef]">{getBalance(baseToken)} {baseToken}</span>
                        </div>

                        {/* Max Buy - Always show max BTC */}
                        <div>
                            <div className="flex justify-between text-[12px]">
                                <span className="text-gray-500">Mua tối đa</span>
                                <span className="text-gray-900 dark:text-[#eaecef]">
                                    {getMaxBuyAmount()} {assetToken}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Buy Button */}
                    <button
                        onClick={handleBuyOrder}
                        disabled={placeOrderMutation.isPending}
                        className="w-full h-[36px] bg-[#2EBD85] hover:bg-[#00A63E] text-white font-medium rounded-[6px] transition-colors text-[14px] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {placeOrderMutation.isPending
                            ? 'Đang xử lý...'
                            : isLogin ? `Mua ${assetToken}` : 'Đăng nhập'
                        }
                    </button>
                </div>

                {/* Sell Side */}
                <div className="flex flex-col gap-[12px]">
                    {/* Price Input */}
                    <div>
                        <div className="relative font-[500]">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Giá
                            </span>
                            <input
                                type={orderTab === 'market' ? 'text' : 'number'}
                                step="0.01"
                                value={orderTab === 'market' ? 'Giá thị trường' : sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                disabled={orderTab === 'market'}
                                className={`w-full px-[12px] py-[8px] pr-[60px] dark:border-[#373c43] dark:text-[#eaecef] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none focus:border-gray-400 text-right ${orderTab === 'market' ? 'bg-gray-300 dark:bg-gray-800 cursor-not-allowed text-gray-500' : ''}`}
                            />
                            <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                {baseToken}
                            </span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <div className="relative font-[500]">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Số lượng
                            </span>
                            <input
                                type="number"
                                step="0.00001"
                                min={0}
                                value={sellAmount}
                                onChange={(e) => setSellAmount(e.target.value)}
                                placeholder=""
                                className={`w-full px-[12px] py-[8px] dark:border-[#373c43] dark:text-[#eaecef] ${orderTab === 'market' ? 'pr-[90px]' : 'pr-[50px]'} text-[14px] border border-gray-300 rounded-[8px] focus:outline-none focus:border-gray-400 text-right`}
                            />
                            {/* Asset Selector Dropdown - Only show for market orders */}
                            {orderTab === 'market' ? (
                                <div ref={sellDropdownRef} className="absolute right-[4px] top-1/2 -translate-y-1/2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSellAssetDropdownOpen(!sellAssetDropdownOpen);
                                            setBuyAssetDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-1 px-2 py-1 text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                    >
                                        <span>{sellInputAsset === 'base' ? assetToken : baseToken}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {sellAssetDropdownOpen && (
                                        <div className="absolute right-0 mt-1 w-[100px] bg-white dark:bg-[#1E2026] border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSellInputAsset('base');
                                                    setSellAssetDropdownOpen(false);
                                                    setSellAmount('');
                                                    setSellSlider(0);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-[14px] hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${sellInputAsset === 'base' ? 'text-[#F6465D] font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                            >
                                                <span>{assetToken}</span>
                                                {sellInputAsset === 'base' && <span>✓</span>}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSellInputAsset('quote');
                                                    setSellAssetDropdownOpen(false);
                                                    setSellAmount('');
                                                    setSellSlider(0);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-[14px] hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${sellInputAsset === 'quote' ? 'text-[#F6465D] font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                            >
                                                <span>{baseToken}</span>
                                                {sellInputAsset === 'quote' && <span>✓</span>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                    {assetToken}
                                </span>
                            )}
                        </div>
                        <div className={`h-[20px]  mt-[4px] ${orderTab === 'market' ? 'block' : 'hidden'}`}>
                            {/* Helper text for market orders */}
                            {orderTab === 'market' && sellInputAsset === 'quote' && (
                                <p className="text-[12px] text-gray-500">
                                    Toàn bộ {assetToken} sẽ bị khóa để đảm bảo đủ số dư
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Slider */}
                    <div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sellSlider}
                            onChange={(e) => handleSellSlider(Number(e.target.value))}
                            style={{
                                background: `linear-gradient(to right, #F6465D 0%, #F6465D ${sellSlider}%, #e5e7eb ${sellSlider}%, #e5e7eb 100%)`
                            }}
                            className="w-full h-[4px] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:bg-[#F6465D] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F6465D] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:rotate-45 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:bg-[#F6465D] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#F6465D] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:rotate-45"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Total Input - Hidden for Market orders */}
                    {orderTab !== 'market' && (
                        <div>
                            <div className="relative">
                                <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                    Tổng
                                </span>
                                <input
                                    type="text"
                                    value={sellTotal}
                                    readOnly
                                    className="w-full px-[12px] py-[8px] pr-[50px] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none bg-gray-50 text-right cursor-not-allowed dark:bg-transparent dark:border-[#373c43] dark:text-[#eaecef] "
                                />
                                <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                    {baseToken}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* TP/SL or Slippage Checkbox */}
                    <div className="flex items-center gap-[8px]">
                        <input
                            type="checkbox"
                            id="sell-tpsl"
                            checked={sellTpSl}
                            onChange={(e) => setSellTpSl(e.target.checked)}
                            className="w-[16px] h-[16px]"
                        />
                        <label htmlFor="sell-tpsl" className="text-[12px] text-gray-700 dark:text-[#eaecef]">
                            {orderTab === 'market' ? 'Khả năng chống trượt giá' : 'TP/SL'}
                        </label>
                    </div>

                    <div className="">
                        {/* Available Balance */}
                        <div className="flex justify-between text-[12px]">
                            <span className="text-gray-500">Khả dụng</span>
                            <span className="text-gray-900 dark:text-[#eaecef]">{getBalance(assetToken)} {assetToken}</span>
                        </div>

                        {/* Max Sell - Show USDT for limit orders, depends on input for market orders */}
                        <div>
                            <div className="flex justify-between text-[12px]">
                                <span className="text-gray-500">Bán tối đa</span>
                                <span className="text-gray-900 dark:text-[#eaecef]">
                                    {getMaxSellTotal()} {orderTab === 'limit' ? baseToken : (sellInputAsset === 'base' ? assetToken : baseToken)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sell Button */}
                    <button
                        onClick={handleSellOrder}
                        disabled={placeOrderMutation.isPending}
                        className="w-full h-[36px] bg-[#F6465D] hover:bg-[#E7000B] text-white font-medium rounded-[6px] transition-colors text-[14px] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {placeOrderMutation.isPending
                            ? 'Đang xử lý...'
                            : isLogin ? `Bán ${assetToken}` : 'Đăng nhập'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}