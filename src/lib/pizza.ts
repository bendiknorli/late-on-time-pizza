export const SLICES_PER_PIZZA = 6;

// Pizza slice calculation parameters
export interface PizzaFormulaParams {
    curveShift: number; // Shift parameter for logarithmic curve
}

export const DEFAULT_FORMULA_PARAMS: PizzaFormulaParams = {
    curveShift: 0.3, // Default curve shift
};

// Function overloads for backward compatibility
export function slicesForMinutes(minutesLate: number, LOG_K: number): number;
export function slicesForMinutes(
    minutesLate: number,
    params?: PizzaFormulaParams
): number;
export function slicesForMinutes(
    minutesLate: number,
    paramsOrLogK: PizzaFormulaParams | number = DEFAULT_FORMULA_PARAMS
): number {
    if (typeof paramsOrLogK === "number") {
        // Legacy mode - convert LOG_K to old formula
        const m = Math.max(0, Math.floor(minutesLate));
        if (m < 2) return 0;
        if (m < 4) return 1;
        if (m < 6) return 2;
        const extra = Math.ceil(paramsOrLogK * Math.log(m - 6 + 1));
        return 4 + extra;
    }

    // New formula mode - normalized logarithm with curve shift
    const minutes = Math.max(0, minutesLate);

    if (minutes <= 0) return 0;

    // Normalized logarithmic formula with curve shift
    const curveShift = paramsOrLogK.curveShift;
    const scaleFactor = 1.0 / Math.log(2 + curveShift);
    const rawValue = scaleFactor * Math.log(minutes + curveShift);
    return Math.ceil(rawValue);
}

export function addSlices(
    totalPizzas: number,
    totalSlices: number,
    add: number
) {
    const sum = totalSlices + add;
    const pizzasEarned = Math.floor(sum / SLICES_PER_PIZZA);
    const remainder = sum % SLICES_PER_PIZZA;
    return {
        totalPizzas: totalPizzas + pizzasEarned,
        totalSlices: remainder,
    };
}

export function adjustSlices(
    totalPizzas: number,
    totalSlices: number,
    delta: number
) {
    let sum = totalPizzas * SLICES_PER_PIZZA + totalSlices + delta;
    if (sum < 0) sum = 0;
    const pizzas = Math.floor(sum / SLICES_PER_PIZZA);
    const rem = sum % SLICES_PER_PIZZA;
    return { totalPizzas: pizzas, totalSlices: rem };
}
