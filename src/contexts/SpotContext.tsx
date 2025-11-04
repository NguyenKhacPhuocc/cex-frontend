"use client";
import { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface SpotContextType {
    symbol: string;
    assetToken: string;
    baseToken: string;
}

const SpotContext = createContext<SpotContextType | undefined>(undefined);

interface SpotProviderProps {
    children: ReactNode;
    symbol: string;
}

export function SpotProvider({ children, symbol }: SpotProviderProps) {
    const router = useRouter();

    // Parse symbol: BTC_USDT → assetToken: BTC, baseToken: USDT
    // Also support BTCUSDT format (no underscore) by splitting at last 4 chars (USDT, BTC, etc.)
    const { assetToken, baseToken } = useMemo(() => {
        let parsedAssetToken = '';
        let parsedBaseToken = '';

        if (symbol.includes('_')) {
            // Format: BTC_USDT
            const parts = symbol.split('_');
            parsedAssetToken = parts[0] || '';
            parsedBaseToken = parts[1] || '';
        } else {
            // Format: BTCUSDT - try to split at common base tokens
            const commonBases = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'FDUSD'];
            let found = false;
            for (const base of commonBases) {
                if (symbol.endsWith(base)) {
                    parsedAssetToken = symbol.slice(0, -base.length);
                    parsedBaseToken = base;
                    found = true;
                    break;
                }
            }
            if (!found) {
                // Fallback: split at last 4 characters
                parsedAssetToken = symbol.slice(0, -4);
                parsedBaseToken = symbol.slice(-4);
            }
        }

        return {
            assetToken: parsedAssetToken,
            baseToken: parsedBaseToken,
        };
    }, [symbol]);

    // Validate symbol format - only redirect if invalid AND not already at default
    useEffect(() => {
        if (!assetToken || !baseToken || assetToken.length === 0 || baseToken.length === 0) {
            console.error('Invalid symbol format:', symbol);
            // Only redirect if not already at default pair to avoid infinite loop
            if (symbol !== 'BTC_USDT') {
                router.replace('/spot/BTC_USDT');
            }
        }
    }, [symbol, assetToken, baseToken, router]);

    const value: SpotContextType = {
        symbol,
        assetToken: assetToken || '',
        baseToken: baseToken || '',
    };

    return <SpotContext.Provider value={value}>{children}</SpotContext.Provider>;
}

// Custom hook để dùng context
export function useSpot() {
    const context = useContext(SpotContext);
    if (context === undefined) {
        throw new Error('useSpot must be used within a SpotProvider');
    }
    return context;
}

