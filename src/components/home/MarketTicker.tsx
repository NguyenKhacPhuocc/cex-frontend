const coins = [
    { name: 'BTC/USDT', price: '68,123.45', change: '+1.25%', isUp: true },
    { name: 'ETH/USDT', price: '3,543.21', change: '-0.54%', isUp: false },
    { name: 'BNB/USDT', price: '589.76', change: '+2.78%', isUp: true },
    { name: 'SOL/USDT', price: '165.90', change: '-1.89%', isUp: false },
    { name: 'DOGE/USDT', price: '0.1589', change: '+5.67%', isUp: true },
    { name: 'SHIB/USDT', price: '0.00002589', change: '+3.12%', isUp: true },
    { name: 'XRP/USDT', price: '0.5234', change: '-0.11%', isUp: false },
    { name: 'ADA/USDT', price: '0.4512', change: '+0.89%', isUp: true },
    { name: 'AVAX/USDT', price: '36.78', change: '-2.34%', isUp: false },
    { name: 'DOT/USDT', price: '7.12', change: '+1.56%', isUp: true },
];

export default function MarketTicker() {
    return (
        <div className="bg-gray-100 dark:bg-transparent dark:text-[#eaecef] py-4 overflow-hidden dark:border-y dark:border-white/20">
            <div className="flex animate-scroll">
                {coins.concat(coins).map((coin, index) => (
                    <div key={index} className="flex-shrink-0 mx-4">
                        <div className="flex items-center">
                            <span className="font-[500] ">{coin.name}</span>
                            <span className={`ml-2 text-sm ${coin.isUp ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}>
                                {coin.price}
                            </span>
                            <span className={`ml-2 text-sm ${coin.isUp ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}>
                                {coin.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}