import { TradeResult } from "@prisma/client";

export type DailyStats = {
    date: Date;
    result: TradeResult;
    pnl: number;
    trades: number;
    scores: {
        overall: number;
        avgWinLoss: number;
        winRate: number;
        profitFactor: number;
        consistency: number;
        riskManagement: number;
    }
};
export type CalendarWeekStats = {
    weekNumber: number;
    result: TradeResult;
    pnl: number;
    trades: number;
};
export type CalendarMonthStats = {
    month: number;
    result: TradeResult;
    pnl: number;
    trades: number;
};
export type ProfitTarget = {
    dailyProfit: number;
    dailyMaxLoss: number;
    weekly: number;
    monthly: number;
};
