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

export default function Home() {
    return (
        <LenisScroll>
            <div className="bg-white">
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
        </LenisScroll>
    );
}