"use client"
import Header from "@/components/Header";
import Ticker from "@/components/spot/Ticker";
import OrderBook from "@/components/spot/OrderBook";
import Chart from "@/components/spot/Chart";
import Order from "@/components/spot/Order";
import TradingPairs from "@/components/spot/TradingPairs";
import MarketTrades from "@/components/spot/MarketTrades";
import TopMovers from "@/components/spot/TopMovers";
import OpenOrders from "@/components/spot/OpenOrders";
import SpotFooter from "@/components/spot/SpotFooter";
import { useParams } from "next/navigation";

export default function SpotPage() {
    const { symbol } = useParams() as { symbol: string };

    return (
        <>
            <Header />
            <div className=" flex gap-[4px] bg-[#F5F5F5] flex-col pb-[30px] p-[4px] ">
                <div className=" min-h-screen  flex gap-[4px]">
                    <div className=" flex-1 flex flex-col gap-[4px]">
                        <Ticker pair={symbol} />
                        <div className="flex-1 flex gap-[4px]">
                            <OrderBook />
                            <div className="  flex-1 flex flex-col gap-[4px]">
                                <Chart symbol={symbol} />
                                <Order />
                            </div>
                        </div>
                    </div>
                    <div className="w-[23%] flex flex-col gap-[4px]">
                        <TradingPairs />
                        <MarketTrades />
                    </div>
                </div>
                <OpenOrders />
            </div>
            <SpotFooter />
        </>
    );
}