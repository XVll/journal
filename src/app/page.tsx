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
import { getWeek } from "date-fns";
import  ThemeSwitch  from "@/components/custom/theme-switch";
import db from "../lib/db/db";
import { TradeWithExecutions } from "@/features/import/types";

const generateTradeWeeksForMonth = (dailyStats: Record<string, CalendarDayStats>) => {
  const weeklyStats: Record<number, CalendarWeekStats> = {};

  Object.values(dailyStats).forEach((dailyStat) => {
    const weekNumber = getWeek(dailyStat.date);

    if (!weeklyStats[weekNumber]) {
      weeklyStats[weekNumber] = { weekNumber, pnl: 0, trades: 0, result: TradeResult.BreakEven };
    }

    weeklyStats[weekNumber].pnl += dailyStat.pnl;
    weeklyStats[weekNumber].trades += dailyStat.trades;
  });

  const weeksInOrder = Object.keys(weeklyStats).sort((a, b) => Number(a) - Number(b));

  return weeksInOrder.map((weekNumber, index) => {
    const week = weeklyStats[Number(weekNumber)];
    week.result = week.pnl > 0 ? TradeResult.Win : week.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
    week.weekNumber = index + 1;
    return week;
  });
};
const generateTradeDaysForMonth = (trades: TradeWithExecutions[]) => {
  const tradeDays: Record<string, CalendarDayStats> = {};

  trades.forEach((trade) => {
    if (!trade.result) return;
    const dailyStats = tradeDays[trade.startDate.toLocaleDateString()];
    if (dailyStats) {
      dailyStats.pnl += trade.pnl;
      dailyStats.trades += 1;
      dailyStats.result = dailyStats.pnl > 0 ? TradeResult.Win : dailyStats.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
    } else {
      tradeDays[trade.startDate.toLocaleDateString()] = {
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
  const trades = await db.trade.findMany({
      include: {
          executions: true,
      },
  });

  const dayStats: Record<string, CalendarDayStats> = generateTradeDaysForMonth(trades);
  const weekStats = generateTradeWeeksForMonth(dayStats);
  const monthStats = {
    month: 9,
    pnl: Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0),
    trades: Object.values(dayStats).reduce((acc, day) => acc + day.trades, 0),
    result:
      Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) > 0
        ? TradeResult.Win
        : Object.values(dayStats).reduce((acc, day) => acc + day.pnl, 0) < 0
        ? TradeResult.Loss
        : TradeResult.BreakEven,
  };

  // All Executions

  return (
    <div className="text-xs flex flex-col gap-4 p-4">
      <ThemeSwitch/>
      <div className="flex justify-center align-middle border h-full w-full">
        <AdvancedCalendar dayStats={dayStats} weekStats={weekStats} monthStats={monthStats} displayDate={new Date(2024, 9, 1)} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => new Date(new Date().setMonth(new Date().getMonth() + i))).map((month, i) => (
          <BasicCalendar
            key={i}
            month={month}
            selected={[]}
            modifiers={{
              winningDay: trades
                .filter((trade) => trade.startDate?.getMonth() === month.getMonth() && trade.result === TradeResult.Win)
                .map((trade) => trade.startDate),
              losingDay: trades
                .filter((trade) => trade.startDate?.getMonth() === month.getMonth() && trade.result === TradeResult.Loss)
                .map((trade) => trade.startDate),
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
