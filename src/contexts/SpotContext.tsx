"use client";
import { createContext, useContext, ReactNode } from 'react';

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
    // Parse symbol: BTC_USDT → assetToken: BTC, baseToken: USDT
    const [assetToken, baseToken] = symbol.split('_');

    const value: SpotContextType = {
        symbol,
        assetToken,
        baseToken,
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

