"use client";
import AnimatedBackground from "@/components/AnimatedBackground";
import Link from "next/link";

export default function AnimationBackgroundPage() {
    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Animated Background */}
            <AnimatedBackground
                showGrid={true}
                showCoins={true}
                coinCount={15}
                gridParallaxFactor={1}
                gridSmoothness={0.1}
            />

            {/* Demo Content */}
            <div className="relative z-20 min-h-screen flex flex-col items-center justify-center text-white p-8">
                <h1 className="text-5xl font-bold mb-4 text-center drop-shadow-lg">
                    Welcome to the Future of Finance
                </h1>
                <p className="text-xl text-center max-w-2xl mb-8 drop-shadow-md">
                    Experience seamless trading with advanced tools and real-time market data.
                </p>
                <Link href={'/'} className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-300 transition-colors shadow-lg">
                    Get Started
                </Link>

                {/* Props Demo Section */}
                <div className="mt-16 p-6 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">Component Props:</h2>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                        {`<AnimatedBackground
    showGrid={true}
    showCoins={true}
    coinCount={15}
    gridParallaxFactor={1}
    gridSmoothness={0.1}
/>`}
                    </pre>
                    <p className="mt-4 text-sm text-gray-400">
                        Di chuyển chuột để thấy hiệu ứng parallax!
                    </p>
                </div>
            </div>
        </div>
    );
}
