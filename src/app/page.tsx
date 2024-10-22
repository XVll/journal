import { TradeParser } from "@/features/import/lib/Parsing/trade-parser";
import { DasSchema, DasTradeMapper } from "@/features/import/lib/Parsing/das-schema";
import CreateTrades from "@/features/import/lib/create-trade";
import { DataTable } from "./trades/data-table";
import { columns } from "./trades/columns";
import { TradeDetails } from "./trades/trade-detail";
import { BasicCalendar } from "@/features/calendar/components/basic-calendar";
import { TradeResult } from "@prisma/client";
import { AdvancedCalendar, CalendarDayStats, CalendarWeekStats } from "@/features/calendar/components/advanced-calendar/advanced-calendar";
import { testTradeData } from "@/features/import/lib/test-data";
import { getWeek, getWeekOfMonth, getWeeksInMonth, isSameMonth } from "date-fns";
import  ThemeSwitch  from "@/components/custom/theme-switch";
import db from "../lib/db/db";
import { TradeWithExecutions } from "@/features/import/types";
import { useGetTradesQuery } from "@/features/calendar/hooks/use-get-trades";
import { getTradesQuery } from "@/features/calendar/actions/get-trades-query";

const generateTradeWeeksForMonth = (dailyStats: Record<string, CalendarDayStats>, year:number, month:number) => {
  const weeklyStats: Record<number, CalendarWeekStats> = {};
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

  return Object.values(weeklyStats).map((stats, index) => {
    stats.result = stats.pnl > 0 ? TradeResult.Win : stats.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
    return stats;
  });
};
const generateTradeDaysForMonth = (trades: TradeWithExecutions[]) => {
  const tradeDays: Record<string, CalendarDayStats> = {};

  trades.forEach((trade) => {
    if (!trade.result) return;
    const dailyStats = tradeDays[(new Date(trade.startDate)).toLocaleDateString()];
    if (dailyStats) {
      dailyStats.pnl += trade.pnl;
      dailyStats.trades += 1;
      dailyStats.result = dailyStats.pnl > 0 ? TradeResult.Win : dailyStats.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
    } else {
      tradeDays[(new Date(trade.startDate)).toLocaleDateString()] = {
        date: trade.startDate,
        result: trade.result,
        pnl: trade.pnl,
        trades: 1,
      };
    }
  });

  return tradeDays;
};

export default async function Home() {
  const displayDate = new Date(2024,9);

const trades = await getTradesQuery();

  const dayStats: Record<string, CalendarDayStats> = generateTradeDaysForMonth(trades);
  const weekStats = generateTradeWeeksForMonth(dayStats, displayDate.getFullYear(), displayDate.getMonth());
  const monthStats = {
    month: displayDate.getMonth(),
    pnl: Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0),
    trades: Object.values(dayStats).reduce((acc, day) => acc + day.trades, 0),
    result:
      Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) > 0
        ? TradeResult.Win
        : Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) < 0
        ? TradeResult.Loss
        : TradeResult.BreakEven,
  };


  return (
      <div className="flex flex-col gap-4 p-4 text-xs">
          <div className="flex h-full w-full justify-center border align-middle">
              <AdvancedCalendar dayStats={dayStats} weekStats={weekStats} monthStats={monthStats}/>
          </div>
          <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => new Date(new Date().setMonth(new Date().getMonth() + i))).map((month, i) => (
                  <BasicCalendar
                      key={i}
                      month={month}
                      selected={[]}
                      modifiers={{
                          winningDay: trades
                              .filter((trade) => new Date(trade.startDate)?.getMonth() === month.getMonth() && trade.result === TradeResult.Win)
                              .map((trade) => new Date(trade.startDate)),
                          losingDay: trades
                              .filter((trade) => new Date(trade.startDate)?.getMonth() === month.getMonth() && trade.result === TradeResult.Loss)
                              .map((trade) => new Date(trade.startDate)),
                      }}
                      modifiersClassNames={{
                          winningDay: "bg-background-green text-foreground-green",
                          losingDay: "bg-background-red text-foreground-red",
                      }}
                  />
              ))}
          </div>
          <DataTable columns={columns} data={trades} />
          <TradeDetails trade={trades[0]} tradeId="" />
      </div>
  );
}
