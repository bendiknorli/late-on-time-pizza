import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type Variant = "solid" | "soft" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
};

const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:opacity-40 disabled:pointer-events-none select-none active:scale-[0.99]";
const variants: Record<Variant, string> = {
    solid: "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/25",
    soft: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    ghost: "text-white hover:bg-white/10",
    danger: "bg-red-500/90 text-white hover:bg-red-400/90",
};
const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "soft", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);

export default Button;
