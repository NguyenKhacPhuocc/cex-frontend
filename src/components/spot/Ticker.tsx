"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CiStar } from "react-icons/ci";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { MdOutlineArrowOutward } from "react-icons/md";
import { useSpot } from "@/contexts/SpotContext";
import { useTicker } from "@/hooks/useTicker";

export default function Ticker() {
    const { symbol: pair, assetToken, baseToken } = useSpot();

    const { ticker, isLoading: isLoadingTicker } = useTicker(pair);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const symbol = useMemo(() => pair.replace("_", ""), [pair]);
    const baseAssetCode = useMemo(() => {
        return assetToken.toUpperCase();
    }, [assetToken]);

    // Format number với dấu chấm cho hàng nghìn, dấu phẩy cho thập phân (format Việt Nam)
    const formatNumber = (num: number | undefined, decimals: number): string => {
        if (typeof num !== 'number' || isNaN(num) || num === 0) return '0';
        const parts = num.toFixed(decimals).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimalPart = parts[1];
        return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
    };

    // Format price với số chữ số thập phân phù hợp
    const formatPrice = (price: number | undefined): string => {
        if (!price || price === 0) return '0';
        if (price >= 1000) return formatNumber(price, 2);
        if (price >= 1) return formatNumber(price, 2);
        if (price >= 0.01) return formatNumber(price, 4);
        return formatNumber(price, 6);
    };

    // Format large number (volume)
    const formatVolume = (num: number | undefined): string => {
        if (!num || num === 0) return '0';
        if (num >= 1000000) {
            return formatNumber(num / 1000000, 2) + 'M';
        }
        if (num >= 1000) {
            return formatNumber(num / 1000, 2) + 'K';
        }
        return formatNumber(num, 2);
    };

    // Get display values from ticker
    const currentPrice = ticker?.price || 0;
    const change24h = ticker?.change24h || 0;
    const absoluteChange = currentPrice > 0 ? (currentPrice * change24h) / 100 : 0;
    const high24h = ticker?.high24h || 0;
    const low24h = ticker?.low24h || 0;
    const volume24hUSDT = ticker?.volume24h || 0;
    const volume24hBTC = currentPrice > 0 ? volume24hUSDT / currentPrice : 0;
    const pairDisplay = ticker?.pair || `${assetToken}/${baseToken}`;

    // Color based on change
    const priceColor = change24h >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]';
    const changeColor = change24h >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]';

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const interval = setTimeout(() => {
            checkScroll();
        }, 300); // chờ DOM render xong

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener("scroll", checkScroll);
            window.addEventListener("resize", checkScroll);
        }
        return () => {
            clearTimeout(interval);
            container?.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 300;
        const current = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const next =
            direction === "left" ? current - scrollAmount : current + scrollAmount;

        // Cập nhật trước để mũi tên biến mất ngay lập tức
        if (direction === "left") {
            setCanScrollRight(true);
            setCanScrollLeft(next > 0);
        } else {
            setCanScrollLeft(true);
            setCanScrollRight(next < maxScroll);
        }

        // Cuộn thật
        container.scrollTo({
            left: next,
            behavior: "smooth",
        });

        // Kiểm tra lại sau khi scroll smooth xong để đồng bộ chính xác
        setTimeout(checkScroll, 400);
    };

    return (
        <>
            <div className="h-[56px] bg-white rounded-[8px] flex px-[16px]">
                <div className="w-[280px] flex gap-[8px] text-[#9c9c9c]">
                    <div className="flex justify-center items-center mr-[4px] ">
                        <CiStar className="text-[24px] border rounded-[8px] border-gray-200" />
                    </div>
                    <div className="flex justify-center items-center gap-[8px]">
                        <div className=" rounded-full overflow-hidden">
                            <Image src={`/${baseAssetCode}.png`} alt={symbol} width={24} height={24} />
                        </div>
                        <div className="pr-[8px]">
                            <div className="text-[20px] leading-[20px] text-black font-medium">{pairDisplay}</div>
                            <div className="text-[12px] text-[#9c9c9c] flex gap-[4px] items-center">
                                <Link href={`/price/${baseAssetCode}`} className="font-[400] text-[#9c9c9c]">
                                    Giá {baseAssetCode}
                                </Link>
                                <MdOutlineArrowOutward className="text-[6px]" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center items-center flex-col">
                        {isLoadingTicker ? (
                            <>
                                <div className="text-[20px] text-gray-400 font-medium leading-[20px]">--</div>
                                <div className="text-[12px] text-gray-400">--</div>
                            </>
                        ) : (
                            <>
                                <div className={`text-[20px] ${priceColor} font-medium leading-[20px]`}>
                                    {formatPrice(currentPrice)}
                                </div>
                                <div className="text-[12px] text-black">
                                    $ {formatPrice(currentPrice)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1 flex px-[16px] relative justify-center items-center">
                    <button
                        onClick={() => scroll("left")}
                        className={`absolute left-0 flex items-center justify-center w-6 h-8 rounded z-30 transition-opacity duration-200
    ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    >
                        <LuChevronLeft className="text-gray-400 hover:text-black" />
                    </button>
                    {/* Left Fade Gradient */}
                    <div
                        className={`absolute left-[10px] top-0 w-[40px] h-full bg-gradient-to-r dark:from-[#181A20] from-white to-transparent transition-opacity duration-200 pointer-events-none z-20
  ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
                    />

                    {/* Right Fade Gradient */}
                    <div
                        className={`absolute right-[15px] top-0 w-[40px] h-full bg-gradient-to-l dark:from-[#181A20] from-white to-transparent transition-opacity duration-200 pointer-events-none z-20
  ${canScrollRight ? "opacity-100" : "opacity-0"}`}
                    />
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-hidden flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <div className="flex gap-[16px] text-[12px]">
                            <div className="flex  flex-col justify-center">
                                <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">
                                    Biến động trong 24 giờ
                                </div>
                                {isLoadingTicker ? (
                                    <div className="text-gray-400">--</div>
                                ) : (
                                    <div className={changeColor}>
                                        {change24h >= 0 ? '+' : ''}{formatPrice(Math.abs(absoluteChange))} ({change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%)
                                    </div>
                                )}
                            </div>
                            <div className="flex  flex-col justify-center">
                                <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">Giá cao nhất 24h</div>
                                {isLoadingTicker ? (
                                    <div className="text-gray-400">--</div>
                                ) : (
                                    <div className="">{formatPrice(high24h)}</div>
                                )}
                            </div>
                            <div className="flex  flex-col justify-center">
                                <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">Giá thấp nhất 24h</div>
                                {isLoadingTicker ? (
                                    <div className="text-gray-400">--</div>
                                ) : (
                                    <div className="">{formatPrice(low24h)}</div>
                                )}
                            </div>
                            <div className="flex  flex-col justify-center">
                                <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">KL 24h({assetToken})</div>
                                {isLoadingTicker ? (
                                    <div className="text-gray-400">--</div>
                                ) : (
                                    <div className="">{formatVolume(volume24hBTC)}</div>
                                )}
                            </div>
                            <div className="flex  flex-col justify-center">
                                <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">KL 24h({baseToken})</div>
                                {isLoadingTicker ? (
                                    <div className="text-gray-400">--</div>
                                ) : (
                                    <div className="">{formatVolume(volume24hUSDT)}</div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">Mạng lưới</div>
                                <hr className="border border-t-0 border-dashed border-[#9c9c9c] " />
                                <div>BTC (5)</div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center text-[12px] w-[200px] shrink-0">
                            <div className="text-[#9c9c9c] whitespace-nowrap mb-[2px]">Thẻ token</div>
                            <div className="flex gap-[4px]">
                                <Link href={'#'} className="text-[#D89F00] whitespace-nowrap">POW</Link>
                                <div className="text-[#9c9c9c]"> | </div>
                                <Link href={'#'} className="text-[#D89F00] whitespace-nowrap">Payments</Link>
                                <div className="text-[#9c9c9c]"> | </div>
                                <Link href={'#'} className="text-[#D89F00] whitespace-nowrap">Khối lượng</Link>
                                <div className="text-[#9c9c9c]"> | </div>
                                <Link href={'#'} className="text-[#D89F00] whitespace-nowrap">Phổ Biến</Link>
                                <div className="text-[#9c9c9c]"> | </div>
                                <Link href={'#'} className="text-[#D89F00] whitespace-nowrap">Price protection</Link>
                            </div>
                        </div>
                    </div>
                    {/* Right Button */}
                    <button
                        onClick={() => scroll("right")}
                        className={`absolute right-0 flex items-center justify-center w-6 h-8 rounded z-30 transition-opacity duration-200
    ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    >
                        <LuChevronRight className="text-gray-400 hover:text-black" />
                    </button>
                </div>
            </div>
        </>
    );
}