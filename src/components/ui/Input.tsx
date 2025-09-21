import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, Props>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                "bg-black/40 border border-white/10 rounded-md px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-emerald-400/60 placeholder:text-white/40",
                className
            )}
            {...props}
        />
    )
);

export default Input;
