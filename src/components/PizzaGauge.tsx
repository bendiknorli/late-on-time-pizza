import {
    motion,
    useMotionValue,
    useTransform,
    animate,
    useMotionTemplate,
} from "framer-motion";
import { useEffect } from "react";

type Props = {
    slices: number; // 0..6
    size?: number;
    thickness?: number;
};

// Placeholder pizza image (transparent PNG data URL)
// 1x1 transparent PNG (placeholder). Replace with real pizza PNG in Storage later.
const PIZZA_PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQAB6h9vZQAAAABJRU5ErkJggg==";

export default function PizzaGauge({
    slices,
    size = 80,
    thickness = 10,
}: Props) {
    const s = Math.max(0, Math.min(6, Math.round(slices)));
    const angleMv = useMotionValue(0);
    const fillAngle = useTransform(angleMv, (v) => v);

    useEffect(() => {
        const target = (s / 6) * 360;
        const controls = animate(angleMv, target, {
            duration: 0.35,
            ease: "easeInOut",
        });
        return () => controls.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [s]);

    const radius = size / 2;
    const inner = radius - thickness;

    // Amber accent fill
    const bgTemplate = useMotionTemplate`conic-gradient(from 0deg, rgba(245,158,11,0.95) ${fillAngle}deg, transparent ${fillAngle}deg)`;

    return (
        <div
            role="img"
            aria-label={`${s}/6 slices`}
            className="relative inline-grid place-items-center"
            style={{ width: size, height: size }}
        >
            <div className="absolute inset-0 rounded-full overflow-hidden">
                {/* Pizza image as background */}
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `url(${PIZZA_PNG})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
            </div>

            {/* Conic gradient ring fill (counter-clockwise from 0deg at right) */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    maskImage: `radial-gradient(circle at center, transparent ${inner}px, black ${inner}px)`,
                    WebkitMaskImage: `radial-gradient(circle at center, transparent ${inner}px, black ${inner}px)`,
                    backgroundImage: bgTemplate as unknown as string,
                    transform: "scaleX(-1)", // counter-clockwise illusion
                }}
            />

            {/* Outer subtle rim */}
            <div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.12)" }}
            />

            {/* Ticks */}
            <svg width={size} height={size} className="absolute inset-0">
                {[...Array(6)].map((_, i) => {
                    const angle = (i / 6) * 2 * Math.PI;
                    const x1 = radius + (radius - 2) * Math.cos(angle);
                    const y1 = radius + (radius - 2) * Math.sin(angle);
                    const x2 =
                        radius + (radius - thickness - 2) * Math.cos(angle);
                    const y2 =
                        radius + (radius - thickness - 2) * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(255,255,255,0.7)"
                            strokeWidth={1}
                        />
                    );
                })}
            </svg>

            <div className="relative z-10 text-xs font-semibold bg-black/55 px-1.5 py-0.5 rounded-md">
                {s}/6
            </div>
        </div>
    );
}
