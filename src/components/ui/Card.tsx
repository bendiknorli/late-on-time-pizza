import { cn } from "../../lib/cn";

export function Card({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return <div className={cn("glass rounded-xl", className)}>{children}</div>;
}

export function CardBody({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return <div className={cn("p-5", className)}>{children}</div>;
}
