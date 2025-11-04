"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type CoinType = 'BTC' | 'ETH' | 'BNB' | 'SOL' | 'TON' | 'DOGE' | 'PEPE' | 'LUMIA' | 'TAO';

// Danh sách các coin types có sẵn
const coinTypes: CoinType[] = ['BTC', 'ETH', 'BNB', 'SOL', 'TON', 'DOGE', 'PEPE', 'LUMIA', 'TAO'];

interface Coin {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    rotation: number;
    rotationSpeed: number;
    drift: number;
    opacity: number;
    type: CoinType;
}

interface AnimatedBackgroundProps {
    showGrid?: boolean;
    showCoins?: boolean;
    coinCount?: number;
    gridParallaxFactor?: number;
    gridSmoothness?: number;
}

export default function AnimatedBackground({
    showGrid = true,
    showCoins = true,
    coinCount = 15,
    gridParallaxFactor = 1,
    gridSmoothness = 0.1,
}: AnimatedBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [coins, setCoins] = useState<Coin[]>([]);
    const coinIdRef = useRef(0);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setIsDarkMode(isDark);
        };

        // Check on mount
        checkDarkMode();

        // Watch for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // Grid Animation Effect
    useEffect(() => {
        if (!showGrid) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationId: number;
        let gradient: CanvasGradient;
        const gridSize = 60;

        // Mouse tracking with parallax
        let mouseX = 0;
        let mouseY = 0;
        let currentOffsetX = 0;
        let currentOffsetY = 0;

        // Set canvas size and create gradient based on theme
        const createGradient = () => {
            if (isDarkMode) {
                // Dark mode colors
                gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, "#050008");
                gradient.addColorStop(0.5, "#0a0515");
                gradient.addColorStop(1, "#08040f");
            } else {
                // Light mode colors
                gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, "#f8f9fa");
                gradient.addColorStop(0.5, "#f5f6f7");
                gradient.addColorStop(1, "#fafbfc");
            }
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createGradient();
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse position (-1 to 1)
            const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
            const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;

            // Calculate target offset with parallax
            mouseX = normalizedX * gridSize * gridParallaxFactor;
            mouseY = normalizedY * gridSize * gridParallaxFactor;
        };
        window.addEventListener("mousemove", handleMouseMove);

        // Animation loop
        const animate = () => {
            // Recreate gradient if theme changed (check every frame but only update if needed)
            // Note: This is handled by useEffect dependency, but we recreate here for safety
            createGradient();

            // Smooth interpolation (lerp) to mouse position
            currentOffsetX += (mouseX - currentOffsetX) * gridSmoothness;
            currentOffsetY += (mouseY - currentOffsetY) * gridSmoothness;

            // Clear with gradient (will use latest gradient)
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Setup grid drawing - different colors for dark/light mode
            ctx.strokeStyle = isDarkMode
                ? "rgba(100, 60, 200, 0.08)" // Dark mode: purple grid
                : "rgba(200, 200, 220, 0.15)"; // Light mode: light gray grid
            ctx.lineWidth = 1;

            ctx.save();

            // Move to center for 3D perspective
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            ctx.translate(centerX, centerY);
            // Apply 3D perspective transform only
            ctx.transform(1, 0.3, -0.3, 1, 0, 0);

            // Calculate diagonal to cover entire screen
            const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
            const gridExtend = diagonal * 1.2;

            // Batch all lines into single path
            ctx.beginPath();

            // Draw vertical lines from center with parallax offset
            for (let x = -gridExtend; x <= gridExtend; x += gridSize) {
                const xPos = x + currentOffsetX;
                ctx.moveTo(xPos, -gridExtend);
                ctx.lineTo(xPos, gridExtend);
            }

            // Draw horizontal lines from center with parallax offset
            for (let y = -gridExtend; y <= gridExtend; y += gridSize) {
                const yPos = y + currentOffsetY;
                ctx.moveTo(-gridExtend, yPos);
                ctx.lineTo(gridExtend, yPos);
            }

            // Single stroke call for all lines
            ctx.stroke();

            ctx.restore();

            animationId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, [showGrid, gridParallaxFactor, gridSmoothness, isDarkMode]);

    // Spawn coins continuously
    useEffect(() => {
        if (!showCoins) return;

        const spawnCoin = () => {
            // Random chọn coin type
            const randomCoinType = coinTypes[Math.floor(Math.random() * coinTypes.length)];

            const newCoin: Coin = {
                id: coinIdRef.current++,
                x: Math.random() * 100, // 0-100%
                y: 105, // Start below screen
                size: 40 + Math.random() * 40, // 40-80px
                speed: 0.5 + Math.random() * 1, // 0.5-1.5
                rotation: Math.random() * 360,
                rotationSpeed: 1 + Math.random() * 2,
                drift: -20 + Math.random() * 40, // -20 to 20
                opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7
                type: randomCoinType,
            };
            setCoins((prev) => [...prev, newCoin]);
        };

        // Spawn initial coins
        for (let i = 0; i < Math.min(coinCount, 10); i++) {
            setTimeout(() => spawnCoin(), i * 500);
        }

        // Spawn new coins periodically
        const spawnInterval = setInterval(spawnCoin, 2000);

        return () => clearInterval(spawnInterval);
    }, [showCoins, coinCount]);

    // Update coins position
    useEffect(() => {
        if (!showCoins) return;

        const updateCoins = () => {
            setCoins((prevCoins) => {
                return prevCoins
                    .map((coin) => ({
                        ...coin,
                        y: coin.y - coin.speed,
                        rotation: coin.rotation + coin.rotationSpeed,
                        x: coin.x + coin.drift * 0.01,
                    }))
                    .filter((coin) => coin.y > -20); // Remove coins that went off screen
            });
        };

        const animationInterval = setInterval(updateCoins, 50);
        return () => clearInterval(animationInterval);
    }, [showCoins]);

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {/* Canvas Grid Background */}
            {showGrid && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ perspective: "1000px" }}
                />
            )}

            {/* Floating Coins Container */}
            {showCoins && (
                <div className="absolute inset-0 overflow-hidden">
                    {coins.map((coin) => (
                        <div
                            key={coin.id}
                            className="absolute transition-none"
                            style={{
                                left: `${coin.x}%`,
                                top: `${coin.y}%`,
                                width: `${coin.size}px`,
                                height: `${coin.size}px`,
                                transform: `rotateY(${coin.rotation}deg) rotateX(${Math.sin(coin.rotation * 0.05) * 15}deg)`,
                                opacity: coin.opacity,
                                willChange: "transform",
                            }}
                        >
                            <Image
                                src={`/${coin.type}.png`}
                                alt={coin.type}
                                width={coin.size}
                                height={coin.size}
                                className="w-full h-full"
                                style={{
                                    filter: "drop-shadow(0 0 15px rgba(247, 147, 26, 0.6))",
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Ambient Light Effects (Optional) */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
                    style={{
                        top: "25%",
                        left: "25%",
                        background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
                        animation: "pulse 8s ease-in-out infinite",
                    }}
                ></div>
                <div
                    className="absolute w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
                    style={{
                        bottom: "33%",
                        right: "25%",
                        background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
                        animation: "pulse 10s ease-in-out infinite 2s",
                    }}
                ></div>
                <div
                    className="absolute w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
                    style={{
                        top: "50%",
                        right: "33%",
                        background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
                        animation: "pulse 12s ease-in-out infinite 4s",
                    }}
                ></div>
            </div>
        </div>
    );
}

