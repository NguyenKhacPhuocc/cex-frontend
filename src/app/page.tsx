import Features from "@/components/home/Features";
import GetStarted from "@/components/home/GetStarted";
import Header from "@/components/Header";
import Hero from "@/components/home/Hero";
import HomeFooter from "@/components/home/HomeFooter";
import MarketTicker from "@/components/home/MarketTicker";
import Stats from "@/components/home/Stats";
import DownloadApp from "@/components/home/DownloadApp";
import Faq from "@/components/home/Faq";
import ScrollAnimationWrapper from "@/components/home/ScrollAnimationWrapper";
import LenisScroll from "@/components/LenisScroll";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Home() {
    return (
        <LenisScroll>
            <div className="relative bg-white">
                {/* Animated Background - Fixed position, behind all content */}
                <AnimatedBackground
                    showGrid={true}
                    showCoins={true}
                    coinCount={15}
                    gridParallaxFactor={1}
                    gridSmoothness={0.1}
                />

                {/* Content with relative positioning to appear above background */}
                <div className="relative z-10">
                    <Header />
                    <main>
                        <ScrollAnimationWrapper>
                            <Hero />
                        </ScrollAnimationWrapper>
                        <ScrollAnimationWrapper>
                            <MarketTicker />
                        </ScrollAnimationWrapper>
                        <ScrollAnimationWrapper>
                            <Stats />
                        </ScrollAnimationWrapper>
                        <ScrollAnimationWrapper>
                            <Features />
                        </ScrollAnimationWrapper>
                        <ScrollAnimationWrapper>
                            <GetStarted />
                        </ScrollAnimationWrapper>
                        <ScrollAnimationWrapper>
                            <DownloadApp />
                        </ScrollAnimationWrapper>
                        <ScrollAnimationWrapper>
                            <Faq />
                        </ScrollAnimationWrapper>
                    </main>
                    <HomeFooter />
                </div>
            </div>
        </LenisScroll>
    );
}