import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UIStore {
    dailyDrawerOpen: boolean;
    dailyDrawerDate: Date | undefined;
    setDailyDrawerOpen: (open: boolean, date?: Date) => void;
}

const useUIStore = create<UIStore>()(
    devtools((set) => ({
        dailyDrawerOpen: false,
        dailyDrawerDate: undefined,
        setDailyDrawerOpen: (open: boolean, date?: Date) => {
            set({ dailyDrawerOpen: open, dailyDrawerDate: date });
        }
    }))
);
export { useUIStore };
