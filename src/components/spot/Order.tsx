"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSpot } from "@/contexts/SpotContext";
import { useAllBalances, Balance } from "@/hooks/useBalances";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useWebSocketContext } from "@/providers/WebSocketProvider";
import { HiDotsVertical } from "react-icons/hi";
import { toast } from "react-hot-toast";

type MainTab = "spot" | "crossMargin" | "isolated" | "grid";
type OrderTab = "limit" | "market" | "stopLimit";

export default function Order() {
    const { isLogin } = useAuth();
    const { symbol, assetToken, baseToken } = useSpot();

    const [mainTab, setMainTab] = useState<MainTab>("spot");
    const [orderTab, setOrderTab] = useState<OrderTab>("limit");
    const [buyPrice, setBuyPrice] = useState<string>("100000");
    const [buyAmount, setBuyAmount] = useState<string>("0");
    const [sellPrice, setSellPrice] = useState<string>("100000");
    const [sellAmount, setSellAmount] = useState<string>("0");
    const [buyTpSl, setBuyTpSl] = useState(false);
    const [sellTpSl, setSellTpSl] = useState(false);
    const [buySlider, setBuySlider] = useState<number>(0);
    const [sellSlider, setSellSlider] = useState<number>(0);

    // console.log('📊 Trading Pair from Context:', { symbol, assetToken, baseToken });

    // 🔥 WebSocket connection status (shared across all components)
    const { isConnected } = useWebSocketContext();
    // console.log('🔌 WebSocket status:', isConnected ? 'Connected ✅' : 'Disconnected ❌');

    // Fetch balances using React Query
    const balances = useAllBalances(isLogin);
    const spotBalances = balances.spot.data || [];
    const futuresBalances = balances.futures.data || [];
    const fundingBalances = balances.funding.data || [];
    const isLoadingBalances = balances.isLoading;
    const isFetchingBalances = balances.spot.isFetching || balances.futures.isFetching || balances.funding.isFetching;

    // Debug: Log balances when they change
    console.log('💰 Current Balances in Order.tsx:', {
        spot: spotBalances,
        BTC: spotBalances.find(b => b.asset === 'BTC'),
        USDT: spotBalances.find(b => b.asset === 'USDT'),
        isLoading: isLoadingBalances,
        isFetching: isFetchingBalances
    });

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
    const buyTotal = buyPrice && buyAmount ? (parseFloat(buyPrice) * parseFloat(buyAmount)).toFixed(5) : '0.00000';
    const sellTotal = sellPrice && sellAmount ? (parseFloat(sellPrice) * parseFloat(sellAmount)).toFixed(5) : '0.00000';

    // Tính toán Mua tối đa = Số dư baseToken / Giá
    const getMaxBuyAmount = (): string => {
        if (!isLogin || !buyPrice) return '--';
        const price = parseFloat(buyPrice);
        if (price <= 0) return '--';
        const balance = getRawBalance(baseToken);
        const maxAmount = balance / price;
        return maxAmount.toFixed(5);
    };

    // Tính toán Bán tối đa (Total USDT) = Số dư assetToken × Giá
    const getMaxSellTotal = (): string => {
        if (!isLogin || !sellPrice) return '--';
        const price = parseFloat(sellPrice);
        if (price <= 0) return '--';
        const balance = getRawBalance(assetToken);
        const maxTotal = balance * price;
        return maxTotal.toFixed(2);
    };

    // Handler cho Buy Slider
    const handleBuySlider = (value: number) => {
        setBuySlider(value);

        if (!isLogin || !buyPrice) return;

        const price = parseFloat(buyPrice);
        if (price <= 0) return;

        const balance = getRawBalance(baseToken);
        const usdtToUse = (balance * value) / 100;
        const amount = usdtToUse / price;

        setBuyAmount(amount.toString());
    };

    // Handler cho Sell Slider
    const handleSellSlider = (value: number) => {
        setSellSlider(value);

        if (!isLogin) return;

        const balance = getRawBalance(assetToken);
        const amount = (balance * value) / 100;

        setSellAmount(amount.toString());
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

        // Check balance
        const balance = getRawBalance(baseToken);
        const total = orderTab === 'limit'
            ? parseFloat(buyPrice) * parseFloat(buyAmount)
            : parseFloat(buyAmount); // For market orders, amount is in USDT

        if (balance < total) {
            toast.error(`Số dư ${baseToken} không đủ`);
            return;
        }

        try {
            // console.log('🟢 Placing BUY order...', {
            //     marketSymbol: symbol,
            //     side: 'buy',
            //     type: orderTab,
            //     price: orderTab === 'limit' ? parseFloat(buyPrice) : undefined,
            //     amount: parseFloat(buyAmount),
            // });

            await placeOrderMutation.mutateAsync({
                marketSymbol: symbol,
                side: 'buy',
                type: orderTab as 'limit' | 'market',
                price: orderTab === 'limit' ? parseFloat(buyPrice) : undefined,
                amount: parseFloat(buyAmount),
            });

            // console.log('✅ BUY order placed successfully! Balances should refetch now...');
            toast.success(`✅ Đã đặt lệnh mua ${assetToken} thành công!`);
            // Reset form
            setBuyAmount('0');
            setBuySlider(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
            toast.error(`❌ Đặt lệnh thất bại: ${errorMessage}`);
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

        // Check balance
        const balance = getRawBalance(assetToken);
        const amount = parseFloat(sellAmount);

        if (balance < amount) {
            toast.error(`Số dư ${assetToken} không đủ`);
            return;
        }

        try {
            // console.log('🔴 Placing SELL order...', {
            //     marketSymbol: symbol,
            //     side: 'sell',
            //     type: orderTab,
            //     price: orderTab === 'limit' ? parseFloat(sellPrice) : undefined,
            //     amount: parseFloat(sellAmount),
            // });

            await placeOrderMutation.mutateAsync({
                marketSymbol: symbol,
                side: 'sell',
                type: orderTab as 'limit' | 'market',
                price: orderTab === 'limit' ? parseFloat(sellPrice) : undefined,
                amount: parseFloat(sellAmount),
            });

            // console.log('✅ SELL order placed successfully! Balances should refetch now...');
            toast.success(`✅ Đã đặt lệnh bán ${assetToken} thành công!`);

            // Reset form
            setSellAmount('0');
            setSellSlider(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
            toast.error(`❌ Đặt lệnh thất bại: ${errorMessage}`);
        }
    };

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
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Giá
                            </span>
                            <input
                                type={orderTab === 'market' ? 'text' : 'number'}
                                step="0.01"
                                value={orderTab === 'market' ? 'Giá thị trường' : buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                disabled={orderTab === 'market'}
                                className={`w-full px-[12px] py-[8px] pr-[50px] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none focus:border-gray-400 text-right ${orderTab === 'market' ? 'bg-gray-300 cursor-not-allowed text-gray-500' : ''}`}
                            />
                            <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                {baseToken}
                            </span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Số lượng
                            </span>
                            <input
                                type="number"
                                step="0.00001"
                                min={0}
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(e.target.value)}
                                className="w-full px-[12px] py-[8px] pr-[50px] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none focus:border-gray-400 text-right"
                            />
                            <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                {assetToken}
                            </span>
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
                            className="w-full h-[4px] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2EBD85] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2EBD85] [&::-moz-range-thumb]:shadow-md"
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
                                    value={buyTotal}
                                    readOnly
                                    className="w-full px-[12px] py-[8px] pr-[50px] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none bg-gray-50 text-right cursor-not-allowed"
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
                        <label htmlFor="buy-tpsl" className="text-[12px] text-gray-700">
                            {orderTab === 'market' ? 'Khả năng chống trượt giá' : 'TP/SL'}
                        </label>
                    </div>

                    <div className="">
                        {/* Available Balance */}
                        <div className="flex justify-between text-[12px]">
                            <span className="text-gray-500">Khả dụng</span>
                            <span className="text-gray-900">{getBalance(baseToken)} {baseToken}</span>
                        </div>

                        {/* Max Buy */}
                        <div>
                            <div className="flex justify-between text-[12px]">
                                <span className="text-gray-500">Mua tối đa</span>
                                <span className="text-gray-900">{getMaxBuyAmount()} {assetToken}</span>
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
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Giá
                            </span>
                            <input
                                type={orderTab === 'market' ? 'text' : 'number'}
                                step="0.01"
                                value={orderTab === 'market' ? 'Giá thị trường' : sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                disabled={orderTab === 'market'}
                                className={`w-full px-[12px] py-[8px] pr-[50px] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none focus:border-gray-400 text-right ${orderTab === 'market' ? 'bg-gray-300 cursor-not-allowed text-gray-500' : ''}`}
                            />
                            <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                {baseToken}
                            </span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <div className="relative">
                            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-400">
                                Số lượng
                            </span>
                            <input
                                type="number"
                                step="0.00001"
                                min={0}
                                value={sellAmount}
                                onChange={(e) => setSellAmount(e.target.value)}
                                className="w-full px-[12px] py-[8px] pr-[50px] text-[14px] border border-gray-300 rounded-[8px] focus:outline-none focus:border-gray-400 text-right"
                            />
                            <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-gray-500">
                                {assetToken}
                            </span>
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
                            className="w-full h-[4px] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#F6465D] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#F6465D] [&::-moz-range-thumb]:shadow-md "
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
                                    className="w-full px-[12px] py-[8px] pr-[50px] text-[14px] border border-gray-300 rounded-[8px]  focus:outline-none bg-gray-50 text-right cursor-not-allowed"
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
                        <label htmlFor="sell-tpsl" className="text-[12px] text-gray-700">
                            {orderTab === 'market' ? 'Khả năng chống trượt giá' : 'TP/SL'}
                        </label>
                    </div>

                    <div className="">
                        {/* Available Balance */}
                        <div className="flex justify-between text-[12px]">
                            <span className="text-gray-500">Khả dụng</span>
                            <span className="text-gray-900">{getBalance(assetToken)} {assetToken}</span>
                        </div>

                        {/* Max Sell Total */}
                        <div>
                            <div className="flex justify-between text-[12px]">
                                <span className="text-gray-500">Bán tối đa</span>
                                <span className="text-gray-900">{getMaxSellTotal()} {baseToken}</span>
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