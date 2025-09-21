import pizzaImage from "../assets/pizza.png";

interface PizzaSliceDisplayProps {
    slices: number; // 0-6 slices to show
    size?: number; // Size in pixels
}

export default function PizzaSliceDisplay({
    slices,
    size = 60,
}: PizzaSliceDisplayProps) {
    // Ensure slices is between 0 and 6
    const clampedSlices = Math.max(0, Math.min(6, slices));

    // Create individual slice clip paths (60 degrees each, counter-clockwise from top)
    const createSliceClipPath = (sliceIndex: number) => {
        const anglePerSlice = 60; // 360 / 6 = 60 degrees per slice
        const startAngle = sliceIndex * anglePerSlice - 90; // Start from top (-90 degrees)
        const endAngle = startAngle + anglePerSlice;

        // Convert to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Calculate points for the slice (from center to edge)
        const centerX = 50;
        const centerY = 50;
        const radius = 50; // Half of 100% to reach the edge

        const startX = centerX + radius * Math.cos(startRad);
        const startY = centerY + radius * Math.sin(startRad);
        const endX = centerX + radius * Math.cos(endRad);
        const endY = centerY + radius * Math.sin(endRad);

        // Create a polygon that represents the slice
        return `polygon(${centerX}% ${centerY}%, ${startX}% ${startY}%, ${endX}% ${endY}%)`;
    };

    return (
        <div
            className="pizza-slice-display"
            style={{
                width: size,
                height: size,
                position: "relative",
                display: "inline-block",
            }}
        >
            {/* Background pizza (faded to show missing slices) */}
            <img
                src={pizzaImage}
                alt="Pizza"
                style={{
                    width: "100%",
                    height: "100%",
                    opacity: 0.2,
                    position: "absolute",
                    top: 0,
                    left: 0,
                }}
            />

            {/* Individual slices */}
            {Array.from({ length: clampedSlices }, (_, index) => (
                <div
                    key={index}
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        clipPath: createSliceClipPath(index),
                    }}
                >
                    <img
                        src={pizzaImage}
                        alt={`Pizza slice ${index + 1}`}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </div>
            ))}

            {/* Slice count overlay */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    fontSize: "10px",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                }}
            >
                {clampedSlices}/6
            </div>
        </div>
    );
}
