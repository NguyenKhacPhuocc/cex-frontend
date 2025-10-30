"use client"
import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface LenisScrollProps {
    children: ReactNode;
}

export default function LenisScroll({ children }: LenisScrollProps) {
    useEffect(() => {
        // Scroll to top immediately on mount
        window.scrollTo(0, 0);

        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Scroll to top using Lenis after initialization
        lenis.scrollTo(0, { immediate: true });

        // Animation frame loop
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Cleanup
        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}

