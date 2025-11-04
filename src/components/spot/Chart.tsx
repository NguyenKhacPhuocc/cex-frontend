/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useSpot } from '@/contexts/SpotContext';
import { useCandles } from '@/hooks/useCandles';

interface CandleData {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface VolumeData {
    time: number; // Unix timestamp in seconds
    value: number;
    color: string;
}

interface ChartProps {
    chartData?: CandleData[];
}


export default function Chart({ chartData }: ChartProps) {
    const { symbol } = useSpot();

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
    const tradingViewContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<any>(null);
    const volumeSeriesRef = useRef<any>(null);
    const lastUpdateTimeRef = useRef<number>(0); // Track last updated candle time

    // Helper function to convert UTC time to UTC+7 (Vietnam timezone)
    // If data from backend is in UTC, this converts it to UTC+7
    // Note: lightweight-charts uses UTC internally, so we adjust the display timezone
    const convertToUTC7 = (utcTime: number): number => {
        // UTC+7 = UTC + 7 hours = UTC + 7 * 3600 seconds
        return utcTime + (7 * 3600);
    };

    const [activeMainTab, setActiveMainTab] = useState("chart");
    const [activeChartTab, setActiveChartTab] = useState("original");
    const [timeframe, setTimeframe] = useState("1m");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [candleHeight, setCandleHeight] = useState(70); // Percentage of total height
    const [isResizing, setIsResizing] = useState(false);

    // Apply cursor style when resizing
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

    // Fetch real-time candles from backend
    const { candles: realCandles } = useCandles(symbol, timeframe);

    // console.log('📈 Chart using symbol from Context:', { symbol, assetToken, baseToken });

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

    // Timeframes for TradingView tab (no 1s, but has 1m, 30m)
    const tradingViewTimeframes = [
        { label: "Thời gian", value: "time" },
        { label: "1m", value: "1m" },
        { label: "15m", value: "15m" },
        { label: "30m", value: "30m" },
        { label: "1h", value: "1h" },
        { label: "4h", value: "4h" },
        { label: "1ngày", value: "1d" },
        { label: "1Tuần", value: "1w" },
    ];

    // Timeframes for Original chart tab (has 1s)
    const originalTimeframes = [
        { label: "Thời gian", value: "time" },
        // { label: "1s", value: "1s" },
        { label: "1m", value: "1m" },
        { label: "15m", value: "15m" },
        { label: "30m", value: "30m" },
        { label: "1h", value: "1h" },
        { label: "4h", value: "4h" },
        { label: "1ngày", value: "1d" },
        { label: "1Tuần", value: "1w" },
    ];

    // Get timeframes based on active chart tab
    const getTimeframes = () => {
        return activeChartTab === "tradingview" ? tradingViewTimeframes : originalTimeframes;
    };

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setIsDarkMode(isDark);
        };

        // Check on mount
        checkDarkMode();

        // Watch for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // Init Chart gốc (lightweight-charts) - chỉ khi đang ở tab "original"
    useEffect(() => {
        // Always cleanup first if chart exists
        const cleanup = () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
        };

        if (activeChartTab !== "original" || !chartContainerRef.current) {
            // Cleanup if not on original tab
            cleanup();
            return;
        }

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
                        color: isDarkMode ? '#181A20' : '#FFFFFF' // TradingView style
                    },
                    fontSize: 12,
                },
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight || 450,
                grid: {
                    vertLines: {
                        color: isDarkMode ? '#2B2B43' : '#E0E3EB',
                        style: 2, // dashed
                        visible: true,
                    },
                    horzLines: {
                        color: isDarkMode ? '#2B2B43' : '#E0E3EB',
                        style: 2, // dashed
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
                        top: 0.1,
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
                    barSpacing: 2, // Có khoảng cách nhỏ giữa các bars để thấy rõ nến
                    minBarSpacing: 2, // Khoảng cách tối thiểu
                },
                watermark: {
                    visible: false, // Bỏ watermark/logo
                },
            };

            const chart = createChart(chartContainerRef.current, chartOptions);
            chartRef.current = chart;

            // Add candlestick series - TradingView style colors
            // Attach to right price scale (default)
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: isDarkMode ? '#26A69A' : '#089981', // Green for bullish
                downColor: isDarkMode ? '#EF5350' : '#F23645', // Red for bearish
                borderVisible: false,
                wickUpColor: isDarkMode ? '#26A69A' : '#089981',
                wickDownColor: isDarkMode ? '#EF5350' : '#F23645',
                priceScaleId: 'right', // Use right price scale for candles
            });

            candleSeriesRef.current = candlestickSeries;

            // Add volume series with separate price scale (left side)
            // Volume will use its own price scale but share time scale with candles
            const volumeSeries = chart.addSeries(HistogramSeries, {
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: 'left', // Use left price scale for volume
                baseLineVisible: true, // Show baseline at 0 - bars will grow upward from this line
                baseLineColor: isDarkMode ? '#666666' : '#CCCCCC', // Subtle baseline color to show 0 level
            });

            // Configure volume price scale (left side, separate from candles)
            // Volume will be displayed at the bottom portion of the chart
            // Ensure scale starts from 0 (no negative values) to prevent volume bars from being compressed
            const volumeTopMargin = candleHeight / 100; // Percentage from top for candles
            chart.priceScale('left').applyOptions({
                scaleMargins: {
                    top: volumeTopMargin, // Volume starts after candles
                    bottom: 0, // No margin at bottom - volume bars stick to the bottom
                },
                visible: true,
                entireTextOnly: false,
                autoScale: true,
            });

            // Configure right price scale for candles
            // Candles will be displayed at the top portion of the chart
            const candleBottomMargin = (100 - candleHeight) / 100; // Percentage from bottom for volume
            chart.priceScale('right').applyOptions({
                scaleMargins: {
                    top: 0,
                    bottom: candleBottomMargin, // Candles end before volume
                },
                autoScale: true,
            });

            // Also configure candlestick series margins
            candlestickSeries.applyOptions({
                priceScaleId: 'right',
            });

            // Configure volume series margins
            volumeSeries.applyOptions({
                priceScaleId: 'left',
            });

            volumeSeriesRef.current = volumeSeries;

            // Update scale margins when candleHeight changes
            const updateScaleMargins = () => {
                if (!chartRef.current) return;
                const volumeTopMargin = candleHeight / 100;
                const candleBottomMargin = (100 - candleHeight) / 100;

                chart.priceScale('left').applyOptions({
                    scaleMargins: {
                        top: volumeTopMargin,
                        bottom: 0,
                    },
                });

                chart.priceScale('right').applyOptions({
                    scaleMargins: {
                        top: 0,
                        bottom: candleBottomMargin,
                    },
                });
            };

            updateScaleMargins();

            // Fit content trước
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

            // Use ResizeObserver to watch container size changes
            const resizeObserver = new ResizeObserver(handleResize);

            // Watch both window resize and container resize
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
            // console.log('Please run: npm install lightweight-charts');
        }
    }, [activeChartTab, isDarkMode]);

    // Update scale margins when candleHeight changes
    useEffect(() => {
        if (!chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return;

        const volumeTopMargin = candleHeight / 100;
        const candleBottomMargin = (100 - candleHeight) / 100;

        chartRef.current.priceScale('left').applyOptions({
            scaleMargins: {
                top: volumeTopMargin,
                bottom: 0,
            },
        });

        chartRef.current.priceScale('right').applyOptions({
            scaleMargins: {
                top: 0,
                bottom: candleBottomMargin,
            },
        });
    }, [candleHeight]);

    // Set initial data ONLY when symbol/timeframe changes (not on realtime updates)
    useEffect(() => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

        // Only use real candles data (no mock data fallback)
        let dataToUse = realCandles.length > 0 ? realCandles : (chartData || []);

        // Don't set data if empty array
        if (dataToUse.length === 0) {
            // Reset lastUpdateTimeRef when data is cleared
            lastUpdateTimeRef.current = 0;
            return;
        }

        // Helper function to safely convert time to number (same as in update effect)
        const convertTimeToNumber = (time: any): number => {
            if (typeof time === 'number' && !isNaN(time)) {
                return time;
            }
            if (time instanceof Date) {
                return Math.floor(time.getTime() / 1000); // Convert to Unix timestamp in seconds
            }
            if (typeof time === 'string') {
                // Try parsing as number first
                const num = Number(time);
                if (!isNaN(num)) return num;
                // Try parsing as date
                const date = new Date(time);
                if (!isNaN(date.getTime())) {
                    return Math.floor(date.getTime() / 1000);
                }
            }
            console.error('Invalid time value:', time);
            return 0;
        };

        // Ensure data is sorted by time (ascending) and remove duplicates
        // lightweight-charts requires: ascending order, no duplicate times
        try {
            // Sort by time ascending
            dataToUse = [...dataToUse].sort((a, b) => {
                const timeA = convertTimeToNumber(a.time);
                const timeB = convertTimeToNumber(b.time);
                return timeA - timeB;
            });

            // Remove duplicates (keep the last one if same time)
            const uniqueData: CandleData[] = [];
            const seenTimes = new Set<number>();

            // Process in reverse to keep the last candle for each time
            for (let i = dataToUse.length - 1; i >= 0; i--) {
                const candle = dataToUse[i];
                const candleTime = convertTimeToNumber(candle.time);

                // Skip invalid times
                if (!candleTime || isNaN(candleTime) || candleTime <= 0) {
                    console.warn('Skipping candle with invalid time:', candle);
                    continue;
                }

                if (!seenTimes.has(candleTime)) {
                    seenTimes.add(candleTime);
                    uniqueData.unshift(candle); // Add to front to maintain ascending order
                }
            }

            dataToUse = uniqueData;

            // Convert time to UTC+7 for display (Vietnam timezone)
            // This adjusts the time so the chart displays in UTC+7
            const dataWithUTC7Time: CandleData[] = dataToUse.map((candle) => ({
                ...candle,
                time: convertToUTC7(convertTimeToNumber(candle.time)),
            }));

            candleSeriesRef.current.setData(dataWithUTC7Time);

            // autoScale will automatically adjust price scale to fit data
            // Since we're using autoScale: true, it won't show negative values
            // if the data doesn't contain negative prices

            // Convert candle data to volume data với màu sắc giống candlestick nhưng có opacity
            // Use converted UTC+7 time for volume data as well
            const volumeData: VolumeData[] = dataWithUTC7Time.map((item) => {
                // Volume dùng màu giống candlestick nhưng với opacity (60%)
                const baseColor = item.close >= item.open
                    ? (isDarkMode ? '#26A69A' : '#089981') // Màu xanh giống candlestick
                    : (isDarkMode ? '#EF5350' : '#F23645'); // Màu đỏ giống candlestick

                // Convert hex to rgba với opacity 60%
                const hexToRgba = (hex: string, opacity: number) => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                };

                // Ensure time is a valid number
                const itemTime = convertTimeToNumber(item.time);

                return {
                    time: itemTime,
                    value: Math.max(0, item.volume || 0), // Ensure no negative values
                    color: hexToRgba(baseColor, 0.5), // 60% opacity
                };
            });

            // Always add invisible zero-value points at the start and end
            // This forces the scale to always include 0, preventing it from going below 0
            if (volumeData.length > 0) {
                const firstTime = volumeData[0].time;
                const lastTime = volumeData[volumeData.length - 1].time;

                // Add invisible zero point at the start (slightly before first data point)
                volumeData.unshift({
                    time: firstTime - 1,
                    value: 0,
                    color: 'transparent', // Invisible - just to anchor scale at 0
                });

                // Add invisible zero point at the end (slightly after last data point)
                volumeData.push({
                    time: lastTime + 1,
                    value: 0,
                    color: 'transparent', // Invisible - just to anchor scale at 0
                });
            }

            volumeSeriesRef.current.setData(volumeData);

            // Force volume scale to start from 0 after data is set
            // Since volume data is always >= 0 and baseLineVisible is true,
            // bars will grow upward from the baseline at 0
            if (chartRef.current) {
                // Wait for chart to process the data
                setTimeout(() => {
                    if (chartRef.current && volumeData.length > 0) {
                        const volumeTopMargin = candleHeight / 100;

                        // Ensure no bottom margin so bars stick to bottom
                        // autoScale will automatically start from 0 since all data is >= 0
                        // baseLineVisible ensures bars grow upward from baseline
                        chartRef.current.priceScale('left').applyOptions({
                            scaleMargins: {
                                top: volumeTopMargin,
                                bottom: 0, // No margin - bars stick to bottom
                            },
                            autoScale: true,
                        });
                    }
                }, 100);
            }

            // Auto zoom to fit recent candles when symbol/timeframe changes (initial load)
            // Calculate optimal number of candles to show based on container width
            if (chartRef.current && dataWithUTC7Time.length > 0 && chartContainerRef.current) {
                const containerWidth = chartContainerRef.current.clientWidth;
                // Calculate optimal candles to show: ~1 candle per 10-15 pixels
                // This ensures candles are clearly visible without being too cramped
                const pixelsPerCandle = 12; // Adjust this to control zoom level
                const optimalCandles = Math.floor(containerWidth / pixelsPerCandle);

                // Show between 50-150 candles (or all if less than 50)
                const candlesToShow = Math.min(
                    Math.max(50, optimalCandles),
                    Math.min(150, dataWithUTC7Time.length)
                );

                const startIndex = Math.max(0, dataWithUTC7Time.length - candlesToShow);

                // Get time range for visible candles
                const startTime = dataWithUTC7Time[startIndex].time;
                const endTime = dataWithUTC7Time[dataWithUTC7Time.length - 1].time;

                // Set visible range to show recent candles with optimal zoom
                chartRef.current.timeScale().setVisibleRange({
                    from: startTime as any,
                    to: endTime as any,
                });

                // Scroll to the rightmost point (latest candle) after a short delay
                // This ensures the chart is fully rendered before scrolling
                setTimeout(() => {
                    if (chartRef.current) {
                        try {
                            // Try to scroll to real-time (if supported)
                            chartRef.current.timeScale().scrollToRealTime();
                        } catch {
                            // Fallback: scroll to the end time
                            chartRef.current.timeScale().scrollToPosition(endTime as any, true);
                        }
                    }
                }, 150);
            } else if (chartRef.current) {
                // Fallback to fitContent if no data
                chartRef.current.timeScale().fitContent();
            }

            // Set last update time to the last candle's time from initial data
            // Store UTC+7 time (same format as chart data) to ensure proper comparison
            // This ensures subsequent updates only happen for newer candles
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
        // Only trigger on symbol/timeframe changes, NOT on realCandles updates
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDarkMode, symbol, timeframe]);

    // Map timeframe value to TradingView interval format
    // Note: TradingView interval format:
    // - Numbers (1, 15, 30, 60) = minutes (1 = 1 minute, 15 = 15 minutes, 30 = 30 minutes, 60 = 1 hour)
    // - "1S" = 1 second (requires Premium account)
    // - "D" = day, "W" = week, "M" = month
    const getTradingViewInterval = (tf: string): string => {
        const intervalMap: { [key: string]: string } = {
            // "1s": "1S", // 1 second (may require Premium account, falls back to 1 minute if not available)
            "1m": "1", // 1 minute
            "15m": "15", // 15 minutes
            "30m": "30", // 30 minutes
            "1h": "60", // 60 minutes = 1 hour
            "4h": "240", // 240 minutes = 4 hours
            "1d": "D", // 1 day
            "1w": "W", // 1 week
            "time": "60", // default to 1 hour
        };
        return intervalMap[tf] || "60";
    };

    const handleTimeframeChange = (tf: string) => {
        if (tf === "time") return; // Skip "Thời gian" label button
        setTimeframe(tf);
        // console.log('Timeframe changed to:', tf);
    };

    // Update chart when real candles change (incremental updates)
    useEffect(() => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current || realCandles.length === 0) return;

        try {
            // Convert hex to rgba helper
            const hexToRgba = (hex: string, opacity: number) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            };

            // Helper function to safely convert time to number
            const convertTimeToNumber = (time: any): number => {
                if (typeof time === 'number' && !isNaN(time)) {
                    return time;
                }
                if (time instanceof Date) {
                    return Math.floor(time.getTime() / 1000); // Convert to Unix timestamp in seconds
                }
                if (typeof time === 'string') {
                    // Try parsing as number first
                    const num = Number(time);
                    if (!isNaN(num)) return num;
                    // Try parsing as date
                    const date = new Date(time);
                    if (!isNaN(date.getTime())) {
                        return Math.floor(date.getTime() / 1000);
                    }
                }
                console.error('Invalid time value:', time);
                return 0;
            };

            // Get the last candle to update (most recent)
            const lastCandle = realCandles[realCandles.length - 1];

            // Safely convert time to number
            const candleTime = convertTimeToNumber(lastCandle.time);

            // Validate time is valid
            if (!candleTime || isNaN(candleTime) || candleTime <= 0) {
                console.error('Invalid candle time:', lastCandle.time, 'converted to:', candleTime);
                return;
            }

            // Convert time to UTC+7 for display (same as initial data)
            const candleTimeUTC7 = convertToUTC7(candleTime);

            // Ensure all values are numbers
            const candleData = {
                time: candleTimeUTC7, // Use UTC+7 time for chart display
                open: Number(lastCandle.open),
                high: Number(lastCandle.high),
                low: Number(lastCandle.low),
                close: Number(lastCandle.close),
                volume: Number(lastCandle.volume || 0),
            };

            // Validate all values are valid numbers
            if (isNaN(candleData.open) || isNaN(candleData.high) || isNaN(candleData.low) || isNaN(candleData.close) || isNaN(candleData.volume)) {
                console.error('Invalid candle data values:', candleData);
                return;
            }

            // Get current data from series to check oldest/newest times
            // lightweight-charts doesn't expose this directly, so we track it ourselves
            // Only update if this is a new candle (time > last update time) OR same candle with updated data
            // Note: lastUpdateTimeRef stores UTC+7 time (same format as chart data)
            // This prevents updating with old data when switching symbols/timeframes, but allows updates for the current candle
            if (candleData.time >= lastUpdateTimeRef.current) {
                try {
                    // Update candle - lightweight-charts will handle update/create automatically
                    candleSeriesRef.current.update(candleData);

                    // Update volume
                    const baseColor = candleData.close >= candleData.open
                        ? (isDarkMode ? '#26A69A' : '#089981')
                        : (isDarkMode ? '#EF5350' : '#F23645');

                    volumeSeriesRef.current.update({
                        time: candleData.time,
                        value: candleData.volume,
                        color: hexToRgba(baseColor, 0.5),
                    });

                    // Update last update time
                    lastUpdateTimeRef.current = candleData.time;

                    // Log for debugging
                    console.log('📊 Updated chart with candle:', {
                        time: new Date(candleData.time * 1000).toISOString(),
                        open: candleData.open,
                        high: candleData.high,
                        low: candleData.low,
                        close: candleData.close,
                        volume: candleData.volume,
                    });
                } catch (updateError: any) {
                    // If update fails (e.g., trying to update oldest data), it means the series was reset
                    // In this case, we should set the data again instead of updating
                    if (updateError?.message?.includes('oldest data') || updateError?.message?.includes('Cannot update')) {
                        console.warn('⚠️ Update failed - series may have been reset. Re-setting data...', updateError.message);
                        // Reset lastUpdateTimeRef so next update will work
                        lastUpdateTimeRef.current = 0;
                        // Trigger re-render by setting data (this will be handled by the initial data useEffect)
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
    }, [realCandles, isDarkMode]); // Trigger when candles array changes (length or content)

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
        <div className="bg-white dark:bg-[#181A20] min-h-[525px] rounded-[8px] flex flex-col relative overflow-hidden">
            {/* Main Tabs */}
            <div className="h-[42px] border-b border-[#f0f0f0] dark:border-[#373c43] flex items-center px-[16px] gap-[24px]">
                {mainTabs.map((tab) => (
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
                                {chartTabs.map((tab) => (
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
                                {chartTabs.map((tab) => (
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
                                {chartTabs.map((tab) => (
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
                        <p className="text-[14px]">Nội dung tab &quot;{mainTabs.find(t => t.id === activeMainTab)?.label}&quot;</p>
                        <p className="text-[12px] mt-[8px]">Đang phát triển...</p>
                    </div>
                </div>
            )}
        </div>
    );
}