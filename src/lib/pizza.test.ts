import { describe, it, expect } from "vitest";
import { slicesForMinutes, addSlices, SLICES_PER_PIZZA } from "./pizza";

describe("slicesForMinutes", () => {
    it("thresholds 0/1 -> 0, 2..3 -> 1, 4..5 -> 2", () => {
        expect(slicesForMinutes(0)).toBe(0);
        expect(slicesForMinutes(1)).toBe(0);
        expect(slicesForMinutes(2)).toBe(1);
        expect(slicesForMinutes(3)).toBe(1);
        expect(slicesForMinutes(4)).toBe(2);
        expect(slicesForMinutes(5)).toBe(2);
    });
    it(">=6 uses log rule (monotonic, ints)", () => {
        const a = slicesForMinutes(6);
        const b = slicesForMinutes(10);
        const c = slicesForMinutes(20);
        expect(a).toBeGreaterThanOrEqual(4);
        expect(Number.isInteger(a)).toBe(true);
        expect(b).toBeGreaterThanOrEqual(a);
        expect(c).toBeGreaterThanOrEqual(b);
    });
});

describe("addSlices", () => {
    it("converts to whole pizzas and remainder", () => {
        const res = addSlices(0, 5, 3);
        expect(res.totalPizzas).toBe(Math.floor((5 + 3) / SLICES_PER_PIZZA));
        expect(res.totalSlices).toBe((5 + 3) % SLICES_PER_PIZZA);
    });
});
