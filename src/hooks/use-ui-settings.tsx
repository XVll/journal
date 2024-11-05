import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UIStore {
    dailyDrawerOpen: boolean;
    dailyDrawerDate: Date | undefined;
    setDailyDrawerOpen: (open: boolean, date?: Date) => void;

    tradeId : string | undefined;
    tradeDrawerOpen: boolean;
    setTradeDrawerOpen: (open: boolean) => void;
}

const useUIStore = create<UIStore>()(
    devtools((set) => ({
        dailyDrawerOpen: false,
        tradeDrawerOpen: false,
        dailyDrawerDate: undefined,
        setTradeDrawerOpen: (open: boolean, tradeId?:string) => {
            set({ tradeDrawerOpen: open, tradeId });
        },
        setDailyDrawerOpen: (open: boolean, date?: Date) => {
            set({ dailyDrawerOpen: open, dailyDrawerDate: date });
        }
    }))
);
export { useUIStore };
