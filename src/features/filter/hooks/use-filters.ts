import { z } from 'zod';
import {create } from 'zustand';
import {devtools} from 'zustand/middleware';

enum PnlType {
    Gross, Net
}
interface PnLRange{
    min : number | undefined;
    max : number | undefined;
}
interface DateRange{
    start : Date | undefined;
    end : Date | undefined;
}
const FilterSchema = z.object({
    dateRange: z
        .object({
            start: z
                .string()
                .optional()
                .transform((val) => (val ? new Date(val) : undefined)),
            end: z
                .string()
                .optional()
                .transform((val) => (val ? new Date(val) : undefined)),
        })
        .optional(),
    // Convert from string number. Like 0 -> 0, 1 -> 1
    pnlType: z
        .string()
        .optional()
        .transform((val) => (val ? PnlType[val as keyof typeof PnlType] : undefined)),
    pnlRange: z
        .object({
            min: z
                .string()
                .optional()
                .transform((val) => (val ? parseFloat(val) : undefined)),
            max: z
                .string()
                .optional()
                .transform((val) => (val ? parseFloat(val) : undefined)),
        })
        .optional(),
     selectedCalendarDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
}).optional();
export interface FilterState {
    pnlType: PnlType;
    pnlRange: PnLRange;
    dateRange: DateRange;
    setDateRange: (dateRange: DateRange) => void;
    setPnlType: (pnlType: PnlType) => void;
    setPnlRange: (pnlRange: PnLRange) => void;
    resetFilters: () => void;
}
const useFilterStore = create<FilterState>()(
    devtools((set) => ({
        pnlType: PnlType.Gross,
        pnlRange: { min: undefined, max: undefined },
        dateRange: { start: new Date(), end: new Date() },
        setDateRange: (dateRange) => set((state) => ({ dateRange })),
        setPnlType: (pnlType) => set((state) => ({ pnlType })),
        setPnlRange: (pnlRange) => set((state) => ({ pnlRange })),
        resetFilters: () =>
            set((state) => ({ pnlType: PnlType.Gross, pnlRange: { min: undefined, max: undefined }, dateRange: { start: undefined, end: undefined } })),
    })),
);
export { useFilterStore , FilterSchema};