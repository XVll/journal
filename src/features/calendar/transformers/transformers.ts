import { TradeResult, Trade } from "@prisma/client";
import { getWeeksInMonth, getWeekOfMonth, isSameMonth } from "date-fns";
import { CalendarDayStats, CalendarWeekStats } from "../components/advanced-calendar/advanced-calendar";

export const generateWeeklyCalendarStats = (dailyStats: Record<string, CalendarDayStats>, date: Date) => {
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
            weeklyStats[weekNumber].trades += dailyStat.trades;
        }
    });
    console.log(year, month, numberOfWeeks);

    return Object.values(weeklyStats).map((stats, index) => {
        stats.result = stats.pnl > 0 ? TradeResult.Win : stats.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
        return stats;
    });
};
export const generateDailyCalendarStats = (tradeData: Trade[] | undefined, date:Date) => {
    const trades = tradeData?.filter((trade) => new Date(trade.startDate).getMonth() === date.getMonth());
    const tradeDays: Record<string, CalendarDayStats> = {};
    if (!trades) return tradeDays;

    trades.forEach((trade) => {
        if (!trade.result) return;
        const dailyStats = tradeDays[new Date(trade.startDate).toLocaleDateString()];
        if (dailyStats) {
            dailyStats.pnl += trade.pnl;
            dailyStats.trades += 1;
            dailyStats.result = dailyStats.pnl > 0 ? TradeResult.Win : dailyStats.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
        } else {
            tradeDays[new Date(trade.startDate).toLocaleDateString()] = {
                date: trade.startDate,
                result: trade.result,
                pnl: trade.pnl,
                trades: 1,
            };
        }
    });

    return tradeDays;
};
export const generateMonthlyCalendarStats = (dayStats: Record<string, CalendarDayStats>, selectedCalendarDate: Date) => {
    return {
        month: selectedCalendarDate.getMonth(),
        pnl: Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0),
        trades: Object.values(dayStats).reduce((acc, day) => acc + day.trades, 0),
        result:
            Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) > 0
                ? TradeResult.Win
                : Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) < 0
                  ? TradeResult.Loss
                  : TradeResult.BreakEven,
    };
};