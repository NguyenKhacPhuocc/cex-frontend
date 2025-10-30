"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

        // Set canvas size and create gradient
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Cache gradient - only recreate on resize
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#050008");
            gradient.addColorStop(0.5, "#0a0515");
            gradient.addColorStop(1, "#08040f");
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
            // Smooth interpolation (lerp) to mouse position
            currentOffsetX += (mouseX - currentOffsetX) * gridSmoothness;
            currentOffsetY += (mouseY - currentOffsetY) * gridSmoothness;

            // Clear with cached gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Setup grid drawing
            ctx.strokeStyle = "rgba(100, 60, 200, 0.08)";
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
    }, [showGrid, gridParallaxFactor, gridSmoothness]);

    // Spawn coins continuously
    useEffect(() => {
        if (!showCoins) return;

        const spawnCoin = () => {
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
                                src="/asset-BTC.png"
                                alt="BTC"
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

