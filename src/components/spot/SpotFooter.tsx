"use client";

import { IoMdSwitch } from "react-icons/io";
import { LuSignal } from "react-icons/lu";

const tickers = [
    { symbol: "BTC/USDT", change: "+0.31%", price: "111,305.84" },
    { symbol: "ETH/USDT", change: "+0.30%", price: "3,928.81" },
    { symbol: "ZEC/USDT", change: "+3.42%", price: "268.79" },
    { symbol: "XRP/USDT", change: "+5.89%", price: "2.5595" },
    { symbol: "ADA/USDT", change: "-1.23%", price: "0.9843" },
    { symbol: "SOL/USDT", change: "+2.15%", price: "189.45" },
    { symbol: "DOGE/USDT", change: "+0.87%", price: "0.3256" },
    { symbol: "LINK/USDT", change: "+1.45%", price: "18.92" },
];

export default function SpotFooter() {
    const connected = true;
    const connectionStatus = connected ? "Kết nối ổn định" : "Mất kết nối";

    return (
        <div className="fixed bottom-0 left-0 right-0 dark:bg-[#181A20] bg-white w-full overflow-hidden py-1 z-50 border-t-4 dark:border-[#0f1119] border-gray-100">
            <div className="flex gap-2 text-xs items-center justify-between dark:text-white text-black px-4">
                <div
                    className={`flex gap-2 items-center shrink-0 w-auto ${connected ? "text-green-500" : "text-gray-500"
                        }`}
                >
                    <LuSignal />
                    {connectionStatus}
                </div>
                <div className="w-[70%] flex items-center flex-row gap-1">
                    <IoMdSwitch className="text-[16px] text-muted-foreground hover:text-foreground text-gray-400" />
                    <div className="overflow-hidden flex-1">
                        <div className=" animate-scroll flex gap-6 whitespace-nowrap ">
                            {[...tickers, ...tickers].map((ticker, idx) => (
                                <div key={idx} className="flex items-center gap-1 shrink-0">
                                    <span className="font-[500]">{ticker.symbol}</span>
                                    <span
                                        className={
                                            ticker.change.startsWith("+")
                                                ? "text-green-500"
                                                : "text-red-500"
                                        }
                                    >
                                        {ticker.change}
                                    </span>
                                    <span className="dark:text-gray-300 text-gray-600">
                                        {ticker.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-gray-300">|</div>
                <div className="flex w-auto gap-4 justify-end ">
                    <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
                        Thông báo
                    </div>
                    <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
                        Tuỳ chọn Cookie
                    </div>
                    <div className="cursor-pointer hover:dark:text-gray-300 hover:text-gray-500">
                        Hỗ trợ trực tuyến
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
        </div>
    );
}