import PizzaGauge from "./PizzaGauge";

type Props = {
    initials: string;
    name: string;
    pizzas: number;
    slices: number;
};

export default function MemberCard({ initials, name, pizzas, slices }: Props) {
    return (
        <div className="rounded-lg p-4 bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/10 grid place-items-center font-semibold">
                {initials}
            </div>
            <div className="flex-1">
                <div className="font-medium">{name}</div>
                <div className="text-xs text-white/70">
                    Pizzas: {pizzas} • Slices: {slices}
                </div>
            </div>
            <PizzaGauge slices={slices} size={54} thickness={8} />
        </div>
    );
}
