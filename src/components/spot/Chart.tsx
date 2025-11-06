/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useSpot } from '@/contexts/SpotContext';
import { useCandles } from '@/hooks/useCandles';

// ==================== Types ====================
interface CandleData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface VolumeData {
    time: number;
    value: number;
    color: string;
}

interface ChartProps {
    chartData?: CandleData[];
}

// ==================== Constants ====================
const MAIN_TABS = [
    { id: "chart", label: "Đồ thị" },
    { id: "info", label: "Thông tin" },
    { id: "data", label: "Dữ liệu Giao dịch" },
    { id: "square", label: "Square" },
] as const;

const CHART_TABS = [
    { id: "original", label: "Gốc" },
    { id: "tradingview", label: "Trading View" },
    { id: "detail", label: "Chi tiết" },
] as const;

const TRADING_VIEW_TIMEFRAMES = [
    { label: "Thời gian", value: "time" },
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "30m", value: "30m" },
    { label: "1h", value: "1h" },
    { label: "4h", value: "4h" },
    { label: "1ngày", value: "1d" },
    { label: "1Tuần", value: "1w" },
] as const;

const ORIGINAL_TIMEFRAMES = [
    { label: "Thời gian", value: "time" },
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "30m", value: "30m" },
    { label: "1h", value: "1h" },
    { label: "4h", value: "4h" },
    { label: "1ngày", value: "1d" },
    { label: "1Tuần", value: "1w" },
] as const;

// ==================== Helper Functions ====================
const convertToUTC7 = (utcTime: number): number => {
    return utcTime + (7 * 3600);
};

const convertTimeToNumber = (time: any): number => {
    if (typeof time === 'number' && !isNaN(time)) return time;
    if (time instanceof Date) return Math.floor(time.getTime() / 1000);
    if (typeof time === 'string') {
        const num = Number(time);
        if (!isNaN(num)) return num;
        const date = new Date(time);
        if (!isNaN(date.getTime())) return Math.floor(date.getTime() / 1000);
    }
    return 0;
};

const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getTradingViewInterval = (tf: string): string => {
    const intervalMap: { [key: string]: string } = {
        "1m": "1",
        "5m": "5",
        "15m": "15",
        "30m": "30",
        "1h": "60",
        "4h": "240",
        "1d": "D",
        "1w": "W",
        "time": "60",
    };
    return intervalMap[tf] || "60";
};

const getVolumeColor = (item: CandleData, isDarkMode: boolean): string => {
    const baseColor = item.close >= item.open
        ? (isDarkMode ? '#26A69A' : '#089981')
        : (isDarkMode ? '#EF5350' : '#F23645');
    return hexToRgba(baseColor, 0.5);
};

const getCandleColors = (isDarkMode: boolean) => ({
    upColor: isDarkMode ? '#26A69A' : '#089981',
    downColor: isDarkMode ? '#EF5350' : '#F23645',
});

// ==================== Component ====================
export default function Chart({ chartData }: ChartProps) {
    const { symbol, timeframe, setTimeframe } = useSpot();
    const { candles: realCandles, isLoading: candlesLoading } = useCandles(symbol, timeframe);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
    const tradingViewContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<any>(null);
    const volumeSeriesRef = useRef<any>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const lastDataHashRef = useRef<string>('');
    const lastTimeframeRef = useRef<string>('');

    const [activeMainTab, setActiveMainTab] = useState("chart");
    const [activeChartTab, setActiveChartTab] = useState("original");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [candleHeight, setCandleHeight] = useState(80);
    const [isResizing, setIsResizing] = useState(false);
    const [isChartReady, setIsChartReady] = useState(false);

    useEffect(() => {
        if (isResizing) {
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    const getTimeframes = () => {
        return activeChartTab === "tradingview" ? TRADING_VIEW_TIMEFRAMES : ORIGINAL_TIMEFRAMES;
    };

    const handleTimeframeChange = (tf: string) => {
        if (tf === "time") return;
        setTimeframe(tf);
    };

    // Detect và theo dõi dark mode changes
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setIsDarkMode(isDark);
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // Update chart colors khi dark mode thay đổi (không recreate chart để giữ data)
    useEffect(() => {
        if (!chartRef.current || activeChartTab !== "original") return;

        // Update chart layout options
        chartRef.current.applyOptions({
            layout: {
                textColor: isDarkMode ? "#D1D4DC" : "#1E1E1E",
                background: {
                    type: ColorType.Solid,
                    color: isDarkMode ? '#181A20' : '#FFFFFF'
                },
                fontSize: 12,
            },
            grid: {
                vertLines: {
                    color: isDarkMode ? '#2B2B43' : '#E0E3EB',
                    style: 2,
                    visible: true,
                },
                horzLines: {
                    color: isDarkMode ? '#2B2B43' : '#E0E3EB',
                    style: 2,
                    visible: true,
                },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: isDarkMode ? '#758696' : '#758696',
                    style: 0,
                    labelBackgroundColor: isDarkMode ? '#131722' : '#FFFFFF',
                },
                horzLine: {
                    color: isDarkMode ? '#758696' : '#758696',
                    style: 0,
                    labelBackgroundColor: isDarkMode ? '#131722' : '#FFFFFF',
                },
            },
            rightPriceScale: {
                borderColor: isDarkMode ? "#2B2B43" : "#E0E3EB",
            },
            leftPriceScale: {
                borderColor: isDarkMode ? "#2B2B43" : "#E0E3EB",
            },
            timeScale: {
                borderColor: isDarkMode ? "#2B2B43" : "#E0E3EB",
            },
        });

        // Update candlestick series colors
        if (candleSeriesRef.current) {
            const colors = getCandleColors(isDarkMode);
            candleSeriesRef.current.applyOptions({
                ...colors,
                wickUpColor: colors.upColor,
                wickDownColor: colors.downColor,
            });
        }

        // Update volume series baseline color
        if (volumeSeriesRef.current) {
            volumeSeriesRef.current.applyOptions({
                baseLineColor: isDarkMode ? '#666666' : '#CCCCCC',
            });

            if (realCandles.length > 0) {
                const dataWithUTC7Time = realCandles.map((candle) => ({
                    ...candle,
                    time: convertToUTC7(convertTimeToNumber(candle.time)),
                }));

                const volumeData: VolumeData[] = dataWithUTC7Time.map((item) => ({
                    time: convertTimeToNumber(item.time),
                    value: Math.max(0, item.volume || 0),
                    color: getVolumeColor(item, isDarkMode),
                }));

                if (volumeData.length > 0) {
                    const firstTime = volumeData[0].time;
                    const lastTime = volumeData[volumeData.length - 1].time;
                    volumeData.unshift({
                        time: firstTime - 1,
                        value: 0,
                        color: 'transparent',
                    });
                    volumeData.push({
                        time: lastTime + 1,
                        value: 0,
                        color: 'transparent',
                    });
                }

                volumeSeriesRef.current.setData(volumeData);
            }
        }
    }, [isDarkMode, activeChartTab, realCandles]);

    // Khởi tạo chart (lightweight-charts) - chỉ tạo 1 lần, không recreate khi dark mode thay đổi
    useEffect(() => {
        const cleanup = () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
        };

        if (activeChartTab !== "original" || !chartContainerRef.current) {
            cleanup();
            return;
        }

        if (chartRef.current) return;

        // Clear container trước khi tạo chart mới
        if (chartContainerRef.current) {
            chartContainerRef.current.innerHTML = '';
        }

        try {
            const chartOptions = {
                layout: {
                    textColor: isDarkMode ? "#D1D4DC" : "#1E1E1E",
                    background: {
                        type: ColorType.Solid,
                        color: isDarkMode ? '#181A20' : '#FFFFFF'
                    },
                    fontSize: 12,
                },
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight || 450,
                grid: {
                    vertLines: {
                        color: isDarkMode ? '#2B2B43' : '#E0E3EB',
                        style: 2,
                        visible: true,
                    },
                    horzLines: {
                        color: isDarkMode ? '#2B2B43' : '#E0E3EB',
                        style: 2,
                        visible: true,
                    },
                },
                crosshair: {
                    mode: 1,
                    vertLine: {
                        color: isDarkMode ? '#758696' : '#758696',
                        style: 0,
                        labelBackgroundColor: isDarkMode ? '#131722' : '#FFFFFF',
                    },
                    horzLine: {
                        color: isDarkMode ? '#758696' : '#758696',
                        style: 0,
                        labelBackgroundColor: isDarkMode ? '#131722' : '#FFFFFF',
                    },
                },
                rightPriceScale: {
                    borderColor: isDarkMode ? "#2B2B43" : "#E0E3EB",
                    visible: true, // Show price scale for candles
                    autoScale: true, // Auto-scale to fit data
                    scaleMargins: {
                        top: 0.08, // 5% margin at top for candles
                        bottom: 0.1,
                    },
                },
                leftPriceScale: {
                    visible: true, // Show price scale for volume
                    borderColor: isDarkMode ? "#2B2B43" : "#E0E3EB",
                    autoScale: true, // Auto-scale to fit data
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.1,
                    },
                },
                timeScale: {
                    borderColor: isDarkMode ? "#2B2B43" : "#E0E3EB",
                    timeVisible: true,
                    secondsVisible: false,
                    rightOffset: 10,
                    barSpacing: 2,
                    minBarSpacing: 2,
                    rightBarStaysOnScroll: false,
                },
                watermark: {
                    visible: false,
                },
            };

            const chart = createChart(chartContainerRef.current, chartOptions);
            chartRef.current = chart;
            const colors = getCandleColors(isDarkMode);
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                ...colors,
                borderVisible: false,
                wickUpColor: colors.upColor,
                wickDownColor: colors.downColor,
                priceScaleId: 'right',
            });

            candleSeriesRef.current = candlestickSeries;
            const volumeSeries = chart.addSeries(HistogramSeries, {
                priceFormat: { type: 'volume' },
                priceScaleId: 'left',
                baseLineVisible: true,
                baseLineColor: isDarkMode ? '#666666' : '#CCCCCC',
            });

            const gapBetweenCandlesAndVolume = 0.08; // 5% gap between candles and volume for better separation
            const volumeTopMargin = Math.min(candleHeight / 100 + gapBetweenCandlesAndVolume, 0.95); // Percentage from top for candles + gap, max 95%
            chart.priceScale('left').applyOptions({
                scaleMargins: {
                    top: volumeTopMargin,
                    bottom: 0,
                },
                visible: true,
                entireTextOnly: false,
                autoScale: true,
            });

            const candleTopMargin = 0.1; // 5% margin at top for better visibility
            const candleBottomMargin = Math.min((100 - candleHeight) / 100 + gapBetweenCandlesAndVolume, 0.95); // Percentage from bottom for volume + gap, max 95%
            chart.priceScale('right').applyOptions({
                scaleMargins: {
                    top: candleTopMargin,
                    bottom: candleBottomMargin,
                },
                autoScale: true,
            });

            candlestickSeries.applyOptions({ priceScaleId: 'right' });
            volumeSeries.applyOptions({ priceScaleId: 'left' });

            volumeSeriesRef.current = volumeSeries;

            const updateScaleMargins = () => {
                if (!chartRef.current) return;
                const gapBetweenCandlesAndVolume = 0.5; // 5% gap between candles and volume
                const candleTopMargin = 0.1; // 5% margin at top for candles
                const volumeTopMargin = Math.min(candleHeight / 100 + gapBetweenCandlesAndVolume, 0.95);
                const candleBottomMargin = Math.min((100 - candleHeight) / 100 + gapBetweenCandlesAndVolume, 0.95);

                chart.priceScale('left').applyOptions({
                    scaleMargins: { top: volumeTopMargin, bottom: 0 },
                });

                chart.priceScale('right').applyOptions({
                    scaleMargins: { top: candleTopMargin, bottom: candleBottomMargin },
                });
            };

            updateScaleMargins();

            const handleResize = () => {
                if (chartContainerRef.current && chartRef.current) {
                    chart.applyOptions({
                        width: chartContainerRef.current.clientWidth,
                        height: chartContainerRef.current.clientHeight || 450
                    });
                }
            };

            const resizeObserver = new ResizeObserver(handleResize);
            window.addEventListener('resize', handleResize);
            if (chartContainerRef.current) {
                resizeObserver.observe(chartContainerRef.current);
            }

            return () => {
                window.removeEventListener('resize', handleResize);
                resizeObserver.disconnect();
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }
                candleSeriesRef.current = null;
                volumeSeriesRef.current = null;
            };
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }, [activeChartTab]); // Không include candleHeight để tránh recreate chart khi resize

    // Update scale margins khi candleHeight thay đổi
    useEffect(() => {
        if (!chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return;

        const gapBetweenCandlesAndVolume = 0.05;
        const candleTopMargin = 0.1;
        const volumeTopMargin = Math.min(candleHeight / 100 + gapBetweenCandlesAndVolume, 0.95);
        const candleBottomMargin = Math.min((100 - candleHeight) / 100 + gapBetweenCandlesAndVolume, 0.95);

        chartRef.current.priceScale('left').applyOptions({
            scaleMargins: { top: volumeTopMargin, bottom: 0 },
        });

        chartRef.current.priceScale('right').applyOptions({
            scaleMargins: { top: candleTopMargin, bottom: candleBottomMargin },
        });
    }, [candleHeight]);

    // Set initial data khi symbol/timeframe thay đổi hoặc khi có data mới
    useEffect(() => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current) {
            setIsChartReady(false);
            return;
        }

        let dataToUse = realCandles.length > 0 ? realCandles : (chartData || []);

        // Reset hash when timeframe or symbol changes
        const isTimeframeChanged = lastTimeframeRef.current !== timeframe;
        if (isTimeframeChanged || lastTimeframeRef.current === '') {
            lastDataHashRef.current = '';
            lastUpdateTimeRef.current = 0;
            lastTimeframeRef.current = timeframe;
            setIsChartReady(false); // Reset ready state khi timeframe/symbol thay đổi
        }

        // If no data or still loading, skip update (wait for data to load)
        if (dataToUse.length === 0 || candlesLoading) {
            // Reset lastUpdateTimeRef when data is cleared
            lastUpdateTimeRef.current = 0;
            setIsChartReady(false);
            return;
        }

        // Hash để detect significant changes (timeframe/symbol change) vs incremental update
        const firstCandleTime = dataToUse[0]?.time || 0;
        const lastCandleTime = dataToUse[dataToUse.length - 1]?.time || 0;
        const dataHash = `${firstCandleTime}-${lastCandleTime}-${dataToUse.length}`;
        const isSignificantChange = lastDataHashRef.current === '' || lastDataHashRef.current !== dataHash;

        // Skip nếu chỉ là incremental update (sẽ được xử lý bởi update effect)
        if (!isSignificantChange && lastDataHashRef.current !== '') {
            return;
        }

        lastDataHashRef.current = dataHash;

        try {
            // Sort và remove duplicates (lightweight-charts yêu cầu ascending order, no duplicates)
            dataToUse = [...dataToUse].sort((a, b) => {
                const timeA = convertTimeToNumber(a.time);
                const timeB = convertTimeToNumber(b.time);
                return timeA - timeB;
            });

            const uniqueData: CandleData[] = [];
            const seenTimes = new Set<number>();

            for (let i = dataToUse.length - 1; i >= 0; i--) {
                const candle = dataToUse[i];
                const candleTime = convertTimeToNumber(candle.time);

                if (!candleTime || isNaN(candleTime) || candleTime <= 0) {
                    console.warn('Skipping candle with invalid time:', candle);
                    continue;
                }

                if (!seenTimes.has(candleTime)) {
                    seenTimes.add(candleTime);
                    uniqueData.unshift(candle);
                }
            }

            dataToUse = uniqueData;

            // Convert time sang UTC+7 (Vietnam timezone) để hiển thị
            const dataWithUTC7Time: CandleData[] = dataToUse.map((candle) => ({
                ...candle,
                time: convertToUTC7(convertTimeToNumber(candle.time)),
            }));

            candleSeriesRef.current.setData(dataWithUTC7Time);

            // Tạo volume data với màu matching candlestick
            const volumeData: VolumeData[] = dataWithUTC7Time.map((item) => ({
                time: convertTimeToNumber(item.time),
                value: Math.max(0, item.volume || 0),
                color: getVolumeColor(item, isDarkMode),
            }));

            // Thêm invisible zero points để force scale bắt đầu từ 0
            if (volumeData.length > 0) {
                const firstTime = volumeData[0].time;
                const lastTime = volumeData[volumeData.length - 1].time;
                volumeData.unshift({ time: firstTime - 1, value: 0, color: 'transparent' });
                volumeData.push({ time: lastTime + 1, value: 0, color: 'transparent' });
            }

            volumeSeriesRef.current.setData(volumeData);

            // Auto-fit content khi load data lần đầu
            if (chartRef.current) {
                setTimeout(() => {
                    if (chartRef.current && volumeData.length > 0) {
                        const gapBetweenCandlesAndVolume = 0.08;
                        const volumeTopMargin = Math.min(candleHeight / 100 + gapBetweenCandlesAndVolume, 0.95);
                        chartRef.current.priceScale('left').applyOptions({
                            scaleMargins: { top: volumeTopMargin, bottom: 0 },
                            autoScale: true,
                        });
                        setIsChartReady(true);
                    }
                }, 100);
            } else {
                setIsChartReady(true);
            }

            // Auto-fit time scale và price scale khi load data lần đầu
            if (chartRef.current && dataWithUTC7Time.length > 0) {
                setTimeout(() => {
                    if (chartRef.current) {
                        try {
                            const visibleRange = chartRef.current.timeScale().getVisibleRange();
                            if (!visibleRange || !visibleRange.from || !visibleRange.to) {
                                chartRef.current.timeScale().fitContent();
                                const prices = dataWithUTC7Time.flatMap(candle => [
                                    candle.high, candle.low, candle.open, candle.close
                                ]).filter(price => price && !isNaN(price) && price > 0);

                                if (prices.length > 0) {
                                    chartRef.current.priceScale('right').applyOptions({
                                        autoScale: true,
                                        scaleMargins: { top: 0.1, bottom: 0.1 },
                                    });
                                    chartRef.current.timeScale().fitContent();
                                }
                            }
                        } catch {
                            chartRef.current.timeScale().fitContent();
                        }
                    }
                }, 150);
            }

            // Track last update time để chỉ update candles mới hơn
            // Store UTC+7 time (same format as chart data) to ensure proper comparison
            if (dataWithUTC7Time.length > 0) {
                const lastCandleTimeUTC7 = dataWithUTC7Time[dataWithUTC7Time.length - 1].time;
                if (lastCandleTimeUTC7 && !isNaN(lastCandleTimeUTC7) && lastCandleTimeUTC7 > 0) {
                    lastUpdateTimeRef.current = lastCandleTimeUTC7;
                    console.log('📊 Set lastUpdateTimeRef to:', lastCandleTimeUTC7, '(UTC+7:', new Date(lastCandleTimeUTC7 * 1000).toISOString(), ')');
                } else {
                    console.error('Failed to set lastUpdateTimeRef - invalid time:', dataWithUTC7Time[dataWithUTC7Time.length - 1].time);
                    lastUpdateTimeRef.current = 0;
                }
            }
        } catch (error) {
            console.error('Error setting initial data:', error);
        }
    }, [symbol, timeframe, realCandles, candlesLoading, chartData, candleHeight]);

    // Update chart khi có candle mới từ WebSocket (incremental updates)
    useEffect(() => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current || realCandles.length === 0) return;

        try {
            const lastCandle = realCandles[realCandles.length - 1];
            const candleTime = convertTimeToNumber(lastCandle.time);

            if (!candleTime || isNaN(candleTime) || candleTime <= 0) {
                console.error('Invalid candle time:', lastCandle.time, 'converted to:', candleTime);
                return;
            }

            const candleTimeUTC7 = convertToUTC7(candleTime);
            const candleData = {
                time: candleTimeUTC7,
                open: Number(lastCandle.open),
                high: Number(lastCandle.high),
                low: Number(lastCandle.low),
                close: Number(lastCandle.close),
                volume: Number(lastCandle.volume || 0),
            };

            if (isNaN(candleData.open) || isNaN(candleData.high) || isNaN(candleData.low) || isNaN(candleData.close) || isNaN(candleData.volume)) {
                console.error('Invalid candle data values:', candleData);
                return;
            }

            // Chỉ update nếu candle mới hơn hoặc bằng last update time
            if (candleData.time >= lastUpdateTimeRef.current) {
                try {
                    candleSeriesRef.current.update(candleData);

                    // Update volume
                    const volumeColor = getVolumeColor(candleData, isDarkMode);
                    volumeSeriesRef.current.update({
                        time: candleData.time,
                        value: candleData.volume,
                        color: volumeColor,
                    });

                    // Update last update time
                    lastUpdateTimeRef.current = candleData.time;
                    console.log('📊 Updated chart with candle:', {
                        time: new Date(candleData.time * 1000).toISOString(),
                        open: candleData.open,
                        high: candleData.high,
                        low: candleData.low,
                        close: candleData.close,
                        volume: candleData.volume,
                    });
                } catch (updateError: any) {
                    if (updateError?.message?.includes('oldest data') || updateError?.message?.includes('Cannot update')) {
                        console.warn('Update failed - series may have been reset. Re-setting data...', updateError.message);
                        lastUpdateTimeRef.current = 0;
                        return;
                    }
                    throw updateError;
                }
            } else {
                console.log('⏭️ Skipping update - candle time is older than last update:', {
                    candleTime: new Date(candleData.time * 1000).toISOString(),
                    lastUpdateTime: new Date(lastUpdateTimeRef.current * 1000).toISOString(),
                });
            }
        } catch (error) {
            console.error('Error updating candle:', error);
        }
    }, [realCandles, isDarkMode]);

    // TradingView Widget chart
    useEffect(() => {
        if (activeChartTab === "tradingview" && tradingViewContainerRef.current) {
            // Clear previous widget
            tradingViewContainerRef.current.innerHTML = '';

            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = () => {
                if ((window as any).TradingView) {
                    const interval = getTradingViewInterval(timeframe);
                    new (window as any).TradingView.widget({
                        autosize: true,
                        symbol: `BINANCE:${symbol.replace("_", "")}`,
                        interval: interval,
                        timezone: "Etc/UTC",
                        theme: isDarkMode ? "dark" : "light",
                        style: "1",
                        locale: "vi",
                        enable_publishing: false,
                        allow_symbol_change: false,
                        container_id: "tradingview_widget",
                        hide_side_toolbar: true,
                        hide_top_toolbar: false,
                        withdateranges: false,
                        hide_legend: false,
                        save_image: true,
                        backgroundColor: isDarkMode ? "rgba(24, 26, 32, 1)" : "rgba(255, 255, 255, 1)",
                        gridColor: "rgba(242, 242, 242, 0.06)",
                        studies: [
                            "MASimple@tv-basicstudies"
                        ],
                        disabled_features: [],
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
    }, [activeChartTab, symbol, timeframe, isDarkMode]);

    return (
        <div id="chart" className="bg-white dark:bg-[#181A20] min-h-[525px] rounded-[8px] flex flex-col relative overflow-hidden">
            {/* Main Tabs */}
            <div className="h-[42px] border-b border-[#f0f0f0] dark:border-[#373c43] flex items-center px-[16px] gap-[24px]">
                {MAIN_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveMainTab(tab.id)}
                        className={`text-[14px] font-medium transition-colors relative py-[11px] ${activeMainTab === tab.id
                            ? "text-black dark:text-[#eaecef]"
                            : "text-[#9c9c9c] hover:text-black dark:hover:dark:text-[#eaecef]"
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
                        <div className="h-[36px] w-full border-b border-[#f0f0f0] dark:border-[#373c43] flex items-center justify-between px-[12px]">
                            {/* Timeframes */}
                            <div className="flex items-center gap-[4px]">
                                {getTimeframes().map((tf) => (
                                    <button
                                        key={tf.value}
                                        onClick={() => handleTimeframeChange(tf.value)}
                                        className={`px-[12px] py-[4px] text-[12px] rounded transition-colors ${timeframe === tf.value
                                            ? 'bg-[#FDDD5D] text-black'
                                            : 'text-[#666] dark:text-[#9c9c9c] hover:bg-gray-50 '
                                            }`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </div>

                            {/* Chart Sub-Tabs */}
                            <div className="flex items-center gap-[4px]">
                                {CHART_TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChartTab(tab.id)}
                                        className={`text-[12px] px-[8px] py-[4px] rounded transition-colors ${activeChartTab === tab.id
                                            ? " text-black font-medium bg-[#FDDD5D]"
                                            : "text-[#9c9c9c] hover:bg-gray-50 "
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Area with Resizable Split */}
                        <div
                            className="flex-1 flex flex-col relative"
                            style={{
                                minHeight: '447px',
                                cursor: isResizing ? 'row-resize' : 'default'
                            }}
                        >
                            {/* Single Chart Container - Candles and Volume are rendered here using scale margins */}
                            <div
                                ref={chartContainerRef}
                                className="w-full h-full relative"
                            />

                            {/* Loading Overlay - Hiển thị khi đang load candles */}
                            {(candlesLoading || !isChartReady) && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-[#181A20]/80 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-12 h-12">
                                            <div className="loader"></div>
                                        </div>
                                        <p className="text-[14px] text-gray-600 dark:text-gray-400">
                                            Đang tải dữ liệu nến...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Resize Handle - Overlay on chart */}
                            <div
                                ref={resizeHandleRef}
                                className="absolute left-0 right-0 cursor-row-resize hover:bg-[#758696]/20 dark:hover:bg-[#758696]/20 transition-colors z-10 flex items-center justify-center group"
                                style={{
                                    top: `${candleHeight}%`,
                                    height: '8px',
                                    marginTop: '-4px',
                                    userSelect: 'none'
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsResizing(true);

                                    const startY = e.clientY;
                                    const startHeight = candleHeight;
                                    const container = chartContainerRef.current;
                                    if (!container) return;

                                    const containerHeight = container.clientHeight;

                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                        const deltaY = moveEvent.clientY - startY;
                                        const deltaPercent = (deltaY / containerHeight) * 100;
                                        const newHeight = Math.max(30, Math.min(90, startHeight + deltaPercent));
                                        setCandleHeight(newHeight);
                                    };

                                    const handleMouseUp = () => {
                                        setIsResizing(false);
                                        document.removeEventListener('mousemove', handleMouseMove);
                                        document.removeEventListener('mouseup', handleMouseUp);
                                    };

                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                }}
                            >
                                <div className="w-12 h-0.5 bg-[#758696] dark:bg-[#758696] rounded opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* TradingView Chart */}
                    <div className={`flex-1 flex-col ${activeChartTab === "tradingview" ? "flex" : "hidden"}`}>
                        {/* Header for TradingView */}
                        <div className="h-[36px] border-b border-[#f0f0f0] dark:border-[#373c43] flex items-center justify-between px-[12px]">
                            {/* Timeframes */}
                            <div className="flex items-center gap-[4px]">
                                {getTimeframes().map((tf) => (
                                    <button
                                        key={tf.value}
                                        onClick={() => handleTimeframeChange(tf.value)}
                                        className={`px-[12px] py-[4px] text-[12px] rounded transition-colors ${timeframe === tf.value
                                            ? 'bg-[#FDDD5D] text-black'
                                            : 'text-[#666] dark:text-[#9c9c9c] hover:bg-gray-50'
                                            }`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-[4px]">
                                {CHART_TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChartTab(tab.id)}
                                        className={`text-[12px] px-[8px] py-[4px] rounded transition-colors ${activeChartTab === tab.id
                                            ? "text-black font-medium bg-[#FDDD5D]"
                                            : "text-[#9c9c9c] hover:bg-gray-50"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={`flex-1 ${isDarkMode ? 'bg-[#181A20]' : 'bg-white'}`} id="tradingview_widget" ref={tradingViewContainerRef} />
                    </div>

                    {/* Detail Tab */}
                    <div className={`flex-1 flex-col ${activeChartTab === "detail" ? "flex" : "hidden"}`}>
                        {/* Header for Detail */}
                        <div className="h-[36px] border-b border-[#f0f0f0] flex items-center justify-between px-[12px]">
                            <span className="text-[12px] text-[#666]">Thông tin chi tiết</span>
                            <div className="flex items-center gap-[4px]">
                                {CHART_TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChartTab(tab.id)}
                                        className={`text-[12px] px-[8px] py-[4px] rounded transition-colors ${activeChartTab === tab.id
                                            ? "text-black font-medium bg-[#FDDD5D]"
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
                        <p className="text-[14px]">Nội dung tab &quot;{MAIN_TABS.find(t => t.id === activeMainTab)?.label}&quot;</p>
                        <p className="text-[12px] mt-[8px]">Đang phát triển...</p>
                    </div>
                </div>
            )}
        </div>
    );
}