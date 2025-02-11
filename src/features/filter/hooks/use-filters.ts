import { z } from "zod";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { PnLRange, PnlType, Unit } from "../types";
import { DateRange } from "react-day-picker";
import { endOfMonth, startOfMonth } from "date-fns";

const FilterSchema = z.object({
    dateRange: z
        .object({
            from: z
                .string()
                .optional()
                .transform((val) => (val ? new Date(val) : undefined)),
            to: z
                .string()
                .optional()
                .transform((val) => (val ? new Date(val) : undefined))
        })
        .optional(),
    // Convert from string number. Like 0 -> 0, 1 -> 1
    pnlType: z
        .string()
        .optional()
        .transform((val) => (val ? PnlType[val as keyof typeof PnlType] : undefined)),
    unit: z
        .string()
        .optional()
        .transform((val) => (val ? Unit[val as keyof typeof Unit] : undefined)),
    pnlRange: z
        .object({
            min: z
                .string()
                .optional()
                .transform((val) => (val ? parseFloat(val) : undefined)),
            max: z
                .string()
                .optional()
                .transform((val) => (val ? parseFloat(val) : undefined))
        })
        .optional()
}).optional();

export interface FilterState {
    unit: Unit;
    pnlType: PnlType;
    pnlRange: PnLRange;
    dateRange?: DateRange;
    setDateRange: (dateRange?: DateRange) => void;
    setPnlType: (pnlType: PnlType) => void;
    setUnit: (unit: Unit) => void;
    setPnlRange: (pnlRange: PnLRange) => void;
    resetFilters: () => void;
}

const useFilterStore = create<FilterState>()(
    devtools((set) => ({
        pnlType: PnlType.Net,
        unit: Unit.Currency,
        pnlRange: { min: undefined, max: undefined },
        dateRange: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
        setDateRange: (dateRange) => set((state) => ({ dateRange })),
        setPnlType: (pnlType) => set((state) => ({ pnlType })),
        setUnit: (unit) => set((state) => ({ unit })),
        setPnlRange: (pnlRange) => set((state) => ({ pnlRange })),
        resetFilters: () =>
            set((state) => ({
                pnlType: PnlType.Gross,
                unit: Unit.Currency,
                pnlRange: { min: undefined, max: undefined },
                dateRange: { from: undefined, to: undefined }
            }))
    }))
);
export { useFilterStore, FilterSchema };