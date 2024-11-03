import { TradeResult, Trade } from "@prisma/client";
import { getWeeksInMonth, getWeekOfMonth, isSameMonth } from "date-fns";
import { CalendarWeekStats, DailyStats } from "@/features/calendar/types";

export const generateWeeklyCalendarStats = (dailyStats: Record<string, DailyStats>, date: Date) => {
    const weeklyStats: Record<number, CalendarWeekStats> = {};
    const year = date.getFullYear();
    const month = date.getMonth();
    const numberOfWeeks = getWeeksInMonth(new Date(year, month));

    Array.from({ length: numberOfWeeks }, (_, i) => i + 1).forEach((weekNumber) => {
        weeklyStats[weekNumber] = { weekNumber, pnl: 0, trades: 0, result: TradeResult.BreakEven };
    });

    Object.values(dailyStats).forEach((dailyStat) => {
        const weekNumber = getWeekOfMonth(dailyStat.date);
        if (isSameMonth(dailyStat.date, new Date(year, month))) {
            weeklyStats[weekNumber].pnl += dailyStat.pnl;
            weeklyStats[weekNumber].trades += dailyStat.tradeCount;
        }
    });

    return Object.values(weeklyStats).map((stats, index) => {
        stats.result = stats.pnl > 0 ? TradeResult.Win : stats.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
        return stats;
    });
};
export const generateDailyCalendarStats = (tradeData: DailyStats[] | undefined, date:Date) => {
    const filteredTradeData = tradeData?.filter((trade) => {
        return trade.date.getMonth() === date.getMonth() && trade.date.getFullYear() === date.getFullYear();
    });
    const dayStats: Record<string, DailyStats> = {};
    filteredTradeData?.forEach((trade) => {
        const dateKey = trade.date.toLocaleDateString();
        dayStats[dateKey] = trade;
    });
    return dayStats;

};
export const generateMonthlyCalendarStats = (dayStats: Record<string, DailyStats>, selectedCalendarDate: Date) => {
    return {
        month: selectedCalendarDate.getMonth(),
        pnl: Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0),
        trades: Object.values(dayStats).reduce((acc, day) => acc + day.tradeCount, 0),
        result:
            Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) > 0
                ? TradeResult.Win
                : Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) < 0
                  ? TradeResult.Loss
                  : TradeResult.BreakEven,
    };
};