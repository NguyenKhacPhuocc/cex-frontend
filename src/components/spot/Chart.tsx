/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

interface CandleData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface VolumeData {
    time: string;
    value: number;
    color: string;
}

interface ChartProps {
    symbol?: string;
    chartData?: CandleData[];
}

// Default mock data - hardcode để sau này dễ thay thế bằng data thật
const DEFAULT_MOCK_DATA: CandleData[] = [
    { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72, volume: 100000 },
    { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09, volume: 120000 },
    { time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29, volume: 95000 },
    { time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50, volume: 110000 },
    { time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04, volume: 180000 },
    { time: '2018-12-27', open: 91.04, high: 121.40, low: 82.70, close: 111.40, volume: 200000 },
    { time: '2018-12-28', open: 111.51, high: 142.83, low: 103.34, close: 131.25, volume: 250000 },
    { time: '2018-12-29', open: 131.33, high: 151.17, low: 77.68, close: 96.43, volume: 150000 },
    { time: '2018-12-30', open: 106.33, high: 110.20, low: 90.39, close: 98.10, volume: 130000 },
    { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26, volume: 140000 },
];

export default function Chart({ symbol = "BTC_USDT", chartData }: ChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const tradingViewContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<any>(null);

    const [activeMainTab, setActiveMainTab] = useState("chart");
    const [activeChartTab, setActiveChartTab] = useState("original");
    const [timeframe, setTimeframe] = useState("1h");

    const mainTabs = [
        { id: "chart", label: "Đồ thị" },
        { id: "info", label: "Thông tin" },
        { id: "data", label: "Dữ liệu Giao dịch" },
        { id: "square", label: "Square" },
    ];

    const chartTabs = [
        { id: "original", label: "Gốc" },
        { id: "tradingview", label: "Trading View" },
        { id: "detail", label: "Chi tiết" },
    ];

    const timeframes = [
        { label: "Thời gian", value: "time" },
        { label: "1s", value: "1s" },
        { label: "15Phút", value: "15m" },
        { label: "1h", value: "1h" },
        { label: "4h", value: "4h" },
        { label: "1ngày", value: "1d" },
        { label: "1Tuần", value: "1w" },
    ];

    // Init Chart gốc (lightweight-charts) - chỉ khi đang ở tab "original"
    useEffect(() => {
        if (activeChartTab !== "original" || !chartContainerRef.current) return;

        // Clear container trước khi tạo chart mới
        if (chartContainerRef.current) {
            chartContainerRef.current.innerHTML = '';
        }

        try {
            const chartOptions = {
                layout: {
                    textColor: 'black',
                    background: { type: ColorType.Solid, color: 'white' }
                },
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight || 450,
                grid: {
                    vertLines: { color: '#f0f0f0' },
                    horzLines: { color: '#f0f0f0' },
                },
                crosshair: {
                    mode: 1,
                },
                rightPriceScale: {
                    borderColor: '#e0e0e0',
                },
                timeScale: {
                    borderColor: '#e0e0e0',
                    timeVisible: true,
                    secondsVisible: false,
                },
                watermark: {
                    visible: false, // Bỏ watermark/logo
                },
            };

            const chart = createChart(chartContainerRef.current, chartOptions);
            chartRef.current = chart;

            // Add candlestick series với DATA CỨNG (API v5.x)
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
            });

            candleSeriesRef.current = candlestickSeries;

            // Sử dụng chartData từ props nếu có, nếu không dùng DEFAULT_MOCK_DATA
            // Đây là data cứng, sau này bạn sẽ truyền data từ websocket vào props
            const dataToUse = chartData || DEFAULT_MOCK_DATA;
            candlestickSeries.setData(dataToUse);

            // Add volume series
            const volumeSeries = chart.addSeries(HistogramSeries, {
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '', // Set to empty string to create overlay
            });

            // Convert candle data to volume data với màu sắc tương ứng
            const volumeData: VolumeData[] = dataToUse.map((item) => {
                // Xác định màu: nếu close > open thì xanh (tăng), ngược lại đỏ (giảm)
                const color = item.close >= item.open ? '#92D2CC' : '#F7A9A7';
                return {
                    time: item.time,
                    value: item.volume || 0,
                    color: color,
                };
            });

            volumeSeries.setData(volumeData);

            // Set price scale to show volume at bottom
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.8, // Volume chỉ chiếm 20% phía dưới
                    bottom: 0,
                },
            });

            chart.timeScale().fitContent();

            // Handle resize
            const handleResize = () => {
                if (chartContainerRef.current && chartRef.current) {
                    chart.applyOptions({
                        width: chartContainerRef.current.clientWidth,
                        height: chartContainerRef.current.clientHeight || 450
                    });
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }
                candleSeriesRef.current = null;
            };
        } catch (error) {
            console.error('Error initializing chart:', error);
            console.log('Please run: npm install lightweight-charts');
        }
    }, [activeChartTab, chartData]);

    const handleTimeframeChange = (tf: string) => {
        setTimeframe(tf);
        console.log('Timeframe changed to:', tf);
        // TODO: Fetch new data based on timeframe
    };

    // TradingView Widget
    useEffect(() => {
        if (activeChartTab === "tradingview" && tradingViewContainerRef.current) {
            // Clear previous widget
            tradingViewContainerRef.current.innerHTML = '';

            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = () => {
                if ((window as any).TradingView) {
                    new (window as any).TradingView.widget({
                        autosize: true,
                        symbol: `BINANCE:${symbol.replace("_", "")}`,
                        interval: "60",
                        timezone: "Etc/UTC",
                        theme: "light",
                        style: "1",
                        locale: "vi",
                        toolbar_bg: '#ffffff',
                        enable_publishing: false,
                        allow_symbol_change: true,
                        container_id: "tradingview_widget",
                        hide_side_toolbar: false,
                        hide_top_toolbar: true,
                        withdateranges: false,
                        hide_legend: false,
                        save_image: false,
                        studies: [
                            "MASimple@tv-basicstudies"
                        ],
                        disabled_features: [
                            "header_symbol_search",
                            "header_screenshot",
                            "header_compare",
                            "header_widget",
                            "timeframes_toolbar",
                            "header_chart_type",
                            "header_indicators",
                        ],
                        enabled_features: [],
                    });
                }
            };

            document.head.appendChild(script);

            return () => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
        }
    }, [activeChartTab, symbol]);

    return (
        <div className="bg-white min-h-[525px] rounded-[8px] flex flex-col relative overflow-hidden">
            {/* Main Tabs */}
            <div className="h-[42px] border-b border-[#f0f0f0] flex items-center px-[16px] gap-[24px]">
                {mainTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveMainTab(tab.id)}
                        className={`text-[14px] font-medium transition-colors relative py-[11px] ${activeMainTab === tab.id
                            ? "text-black"
                            : "text-[#9c9c9c] hover:text-black"
                            }`}
                    >
                        {tab.label}
                        {activeMainTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeMainTab === "chart" ? (
                <div className="flex-1 flex relative overflow-hidden">
                    {/* Original Chart */}
                    <div className={`flex-1 flex-col ${activeChartTab === "original" ? "flex" : "hidden"}`}>
                        {/* Timeframe Selector + Chart Sub-Tabs */}
                        <div className="h-[36px] w-full border-b border-[#f0f0f0] flex items-center justify-between px-[12px]">
                            {/* Timeframes */}
                            <div className="flex items-center gap-[4px]">
                                {timeframes.map((tf) => (
                                    <button
                                        key={tf.value}
                                        onClick={() => handleTimeframeChange(tf.value)}
                                        className={`px-[12px] py-[4px] text-[12px] rounded transition-colors ${timeframe === tf.value
                                            ? ' text-black'
                                            : 'text-[#666] hover:bg-gray-50'
                                            }`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </div>

                            {/* Chart Sub-Tabs */}
                            <div className="flex items-center gap-[4px]">
                                {chartTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChartTab(tab.id)}
                                        className={`text-[12px] px-[8px] py-[4px] rounded transition-colors ${activeChartTab === tab.id
                                            ? " text-black font-medium"
                                            : "text-[#9c9c9c] hover:bg-gray-50"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex-1 flex">
                            {/* Chart Canvas - Full Width (no left toolbar) */}
                            <div
                                ref={chartContainerRef}
                                className="flex-1 w-full"
                                style={{ minHeight: '447px' }}
                            />
                        </div>
                    </div>

                    {/* TradingView Chart */}
                    <div className={`flex-1 flex-col ${activeChartTab === "tradingview" ? "flex" : "hidden"}`}>
                        {/* Header for TradingView */}
                        <div className="h-[36px] border-b border-[#f0f0f0] flex items-center justify-between px-[12px]">
                            {/* Timeframes */}
                            <div className="flex items-center gap-[4px]">
                                {timeframes.map((tf) => (
                                    <button
                                        key={tf.value}
                                        onClick={() => handleTimeframeChange(tf.value)}
                                        className={`px-[12px] py-[4px] text-[12px] rounded transition-colors ${timeframe === tf.value
                                            ? ' text-black'
                                            : 'text-[#666] hover:bg-gray-50'
                                            }`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-[4px]">
                                {chartTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChartTab(tab.id)}
                                        className={`text-[12px] px-[8px] py-[4px] rounded transition-colors ${activeChartTab === tab.id
                                            ? "text-black font-medium"
                                            : "text-[#9c9c9c] hover:bg-gray-50"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1" id="tradingview_widget" ref={tradingViewContainerRef} />
                    </div>

                    {/* Detail Tab */}
                    <div className={`flex-1 flex-col ${activeChartTab === "detail" ? "flex" : "hidden"}`}>
                        {/* Header for Detail */}
                        <div className="h-[36px] border-b border-[#f0f0f0] flex items-center justify-between px-[12px]">
                            <span className="text-[12px] text-[#666]">Thông tin chi tiết</span>
                            <div className="flex items-center gap-[4px]">
                                {chartTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChartTab(tab.id)}
                                        className={`text-[12px] px-[8px] py-[4px] rounded transition-colors ${activeChartTab === tab.id
                                            ? "text-black font-medium"
                                            : "text-[#9c9c9c] hover:bg-gray-50"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-[#9c9c9c] p-[24px]">
                            <div className="text-center max-w-[600px]">
                                <h3 className="text-[16px] font-medium text-black mb-[12px]">Chi tiết {symbol}</h3>
                                <div className="text-left space-y-[8px]">
                                    <div className="flex justify-between py-[8px] border-b border-[#f0f0f0]">
                                        <span className="text-[#9c9c9c]">Tên đầy đủ:</span>
                                        <span className="text-black font-medium">Bitcoin / Tether</span>
                                    </div>
                                    <div className="flex justify-between py-[8px] border-b border-[#f0f0f0]">
                                        <span className="text-[#9c9c9c]">Symbol:</span>
                                        <span className="text-black font-medium">{symbol}</span>
                                    </div>
                                    <div className="flex justify-between py-[8px] border-b border-[#f0f0f0]">
                                        <span className="text-[#9c9c9c]">Sàn giao dịch:</span>
                                        <span className="text-black font-medium">Binance</span>
                                    </div>
                                    <div className="flex justify-between py-[8px] border-b border-[#f0f0f0]">
                                        <span className="text-[#9c9c9c]">Loại:</span>
                                        <span className="text-black font-medium">Spot Trading</span>
                                    </div>
                                    <div className="flex justify-between py-[8px]">
                                        <span className="text-[#9c9c9c]">Trạng thái:</span>
                                        <span className="text-[#26a69a] font-medium">● Trading</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-[#9c9c9c]">
                    <div className="text-center">
                        <p className="text-[14px]">Nội dung tab &quot;{mainTabs.find(t => t.id === activeMainTab)?.label}&quot;</p>
                        <p className="text-[12px] mt-[8px]">Đang phát triển...</p>
                    </div>
                </div>
            )}
        </div>
    );
}