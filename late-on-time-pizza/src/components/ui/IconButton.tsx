import { cn } from "../../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: "sm" | "md";
};

export default function IconButton({
    className,
    size = "md",
    ...props
}: Props) {
    const sizing = size === "sm" ? "h-9 w-9" : "h-10 w-10";
    return (
        <button
            className={cn(
                "inline-grid place-items-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
                sizing,
                className
            )}
            {...props}
        />
    );
}
