"use client";

import Header from "@/components/Header";
import WalletSidebar from "@/components/wallet/WalletSidebar";
import EstimatedBalanceSection from "@/components/wallet/EstimatedBalanceSection";
import MyAssetsSection from "@/components/wallet/MyAssetsSection";
import RecentTransactionsSection from "@/components/wallet/RecentTransactionsSection";
import { useMergedBalances } from "@/hooks/useBalances";
import { useAllTickers } from "@/hooks/useAllTickers";
import { useWalletHistory } from "@/hooks/useWalletHistory";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

export default function OverviewWalletPage() {
    const { isLogin } = useAuth();

    // Fetch merged balances (all wallets combined)
    const { data: balances = [], isLoading: balancesLoading } = useMergedBalances(isLogin);

    // Fetch all tickers for price data
    const { tickers = [], isLoading: tickersLoading } = useAllTickers();

    // Fetch recent transactions (limited to 5)
    const { data: historyData } = useWalletHistory({ limit: 5 }, isLogin);

    // Calculate total balance in USDT
    const { totalBalance, totalBalanceUSD } = useMemo(() => {
        if (!balances.length || !tickers.length) {
            return { totalBalance: 0, totalBalanceUSD: 0 };
        }

        let totalUSDT = 0;

        balances.forEach(balance => {
            const available = parseFloat(balance.available) || 0;
            const locked = parseFloat(balance.locked) || 0;
            const total = available + locked;

            if (balance.asset === "USDT") {
                totalUSDT += total;
            } else {
                // Find ticker for this asset (look for USDT pair)
                const ticker = tickers.find(t => {
                    if (t.symbol === `${balance.asset}_USDT` || t.symbol === `USDT_${balance.asset}`) {
                        return true;
                    }
                    if (t.pair === `${balance.asset}/USDT` || t.pair === `USDT/${balance.asset}`) {
                        return true;
                    }
                    return false;
                });

                if (ticker) {
                    // Extract price from ticker
                    let price = 1;
                    if (ticker.pair.startsWith(`${balance.asset}/USDT`) || ticker.symbol.startsWith(`${balance.asset}_USDT`)) {
                        price = ticker.price;
                    } else if (ticker.pair.startsWith(`USDT/${balance.asset}`) || ticker.symbol.startsWith(`USDT_${balance.asset}`)) {
                        price = ticker.price > 0 ? 1 / ticker.price : 0;
                    }
                    totalUSDT += total * price;
                }
            }
        });

        return {
            totalBalance: totalUSDT,
            totalBalanceUSD: totalUSDT // Assuming USDT ≈ USD
        };
    }, [balances, tickers]);

    // Convert history entries to transaction format
    const transactions = useMemo(() => {
        if (!historyData?.data) return [];

        return historyData.data.slice(0, 5).map(entry => ({
            id: entry.id,
            type: entry.referenceType === "DEPOSIT" ? "Nạp tiền" :
                entry.referenceType === "WITHDRAW" ? "Rút tiền" :
                    entry.referenceType === "TRADE" ? "Giao dịch" :
                        entry.referenceType === "TRANSFER" ? "Chuyển khoản" :
                            entry.referenceType === "FEE" ? "Phí" : "Khác",
            amount: Math.abs(entry.changeAmount),
            currency: entry.currency,
            status: "completed" as const,
            createdAt: new Date(entry.createdAt)
        }));
    }, [historyData]);

    if (balancesLoading || tickersLoading) {
        return (
            <>
                <Header />
                <div className="flex min-h-screen bg-[#0B0E11]">
                    <WalletSidebar />
                    <div className="flex-1 p-6">
                        <div className="text-white">Đang tải...</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="dark:bg-[#181A20]">
                <Header />
            </div>
            <div className="flex min-h-screen dark:bg-[#181A20] bg-white">
                <WalletSidebar />
                <div className="flex-1 p-[64px]">
                    <EstimatedBalanceSection
                        totalBalance={totalBalance}
                        totalBalanceUSD={totalBalanceUSD}
                    />
                    <MyAssetsSection
                        balances={balances}
                        tickers={tickers}
                    />
                    <RecentTransactionsSection
                        transactions={transactions}
                    />
                </div>
            </div>
        </>
    );
}
