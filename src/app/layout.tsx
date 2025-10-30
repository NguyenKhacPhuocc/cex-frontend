/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/providers/QueryProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import ScrollToTop from "@/components/ScrollToTop";

const binancePlex = localFont({
    src: [
        {
            path: "../font/BinancePlex-Light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "../font/BinancePlex-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../font/BinancePlex-SemiBold.woff2",
            weight: "600",
            style: "normal",
        },
    ],
    variable: "--font-binance-plex",
});

const binanceNova = localFont({
    src: [
        {
            path: "../font/BinanceNova-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../font/BinanceNova-Medium.woff2",
            weight: "500",
            style: "normal",
        },
    ],
    variable: "--font-binance-nova",
});

export const metadata: Metadata = {
    title: "Sàn giao dịch tiền mã hóa",
    description: "centralized exchange",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${binanceNova.className} ${binanceNova.variable}`}>
                <QueryProvider>
                    <WebSocketProvider>
                        <ScrollToTop />
                        <div className="max-w-[1920px] mx-auto">
                            {children}
                        </div>
                    </WebSocketProvider>
                    <Toaster
                        position="bottom-right"
                        reverseOrder={false}
                        gutter={8}
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#1C1F26',
                                color: '#fff',
                                border: '1px solid #2E3340',
                                borderRadius: '8px',
                                padding: '12px 16px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#0ECB81',
                                    secondary: '#fff',
                                },
                                style: {
                                    border: '1px solid #0ECB81',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#F6465D',
                                    secondary: '#fff',
                                },
                                style: {
                                    border: '1px solid #F6465D',
                                },
                            },
                        }}
                    />
                </QueryProvider>
            </body>
        </html>
    );
}
