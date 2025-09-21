import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, Props>(
    ({ className, children, ...props }, ref) => (
        <select
            ref={ref}
            className={cn(
                "bg-black/40 border border-white/10 rounded-md px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-emerald-400/60",
                className
            )}
            {...props}
        >
            {children}
        </select>
    )
);

export default Select;
