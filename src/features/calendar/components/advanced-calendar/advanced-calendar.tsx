"use client";
import * as React from "react";
import { DayContentProps, DayPicker } from "react-day-picker";
import { Trade, TradeResult } from "@prisma/client";
import { isWeekend} from "date-fns";
import { WeeklyStats } from "./weekly-stats";
import { DayStats } from "./day-stats";
import { MonthlyStats } from "./monthly-stats";
import { AdvancedCalendarBase } from "./advanced-calendar-base";
import { FaSpinner } from "react-icons/fa";
import DatePicker from "@/components/custom/date-picker";
import { AnimatePresence, m } from "framer-motion";
import { useGetCalendarDataQuery } from "../../hooks/use-get-calendar-data-query";
import { generateDailyCalendarStats, generateWeeklyCalendarStats, generateMonthlyCalendarStats } from "../../transformers/transformers";

export type CalendarDayStats = {
  date: Date;
  result: TradeResult;
  pnl: number;
  trades: number;
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
export type CalendarTarget = {
  dailyProfit: number;
  dailyMaxLoss: number;
  weekly: number;
  monthly: number;
};
const calendarTargets: CalendarTarget = {
  dailyProfit: 5000,
  dailyMaxLoss: -5000,
  weekly: 500,
  monthly: 2000,
};

const modifiers = (tradeDays: Record<string, CalendarDayStats>) => {
  return {
      winningDay: Object.keys(tradeDays) .filter((date) => tradeDays[date].result === TradeResult.Win) .map((date) => new Date(date)),
      losingDay: Object.keys(tradeDays) .filter((date) => tradeDays[date].result === TradeResult.Loss) .map((date) => new Date(date)),
      breakEvenDay: Object.keys(tradeDays) .filter((date) => tradeDays[date].result === TradeResult.BreakEven) .map((date) => new Date(date)),
      weekend: (date: Date) => isWeekend(date),
  };
};

function AdvancedCalendar() {
    const [selectedCalendarDate, setSelectedCalendarDate] = React.useState(new Date());
    const { data: trades, isLoading } = useGetCalendarDataQuery(selectedCalendarDate);

    const dayStats = generateDailyCalendarStats(trades, selectedCalendarDate);
    const weekStats = generateWeeklyCalendarStats(dayStats, selectedCalendarDate);
    const monthStats = generateMonthlyCalendarStats(dayStats, selectedCalendarDate);

    return (
        <div className="relative grid grid-cols-8">
            <AdvancedCalendarBase
            className="col-span-7"
                onMonthChange={setSelectedCalendarDate}
                modifiers={modifiers(dayStats)}
                modifiersClassNames={{
                    winningDay: "!bg-background-green !text-foreground-green hover:!bg-foreground-green/20",
                    losingDay: "!bg-background-red !text-foreground-red hover:!bg-foreground-red/20",
                    breakEvenDay: "!bg-background-b1 !text-foreground-f1 hover:!bg-foreground-f1/20",
                    weekend:
                        "bg-[repeating-linear-gradient(45deg,var(--tw-gradient-stops))] from-background-b2 from-[length:0_10px] to-background-b1 to-[length:0_20px]",
                }}
                components={{
                    DayContent: (props: DayContentProps) => <DayStats {...props} tradeDays={dayStats} calendarTargets={calendarTargets} />,
                    CaptionLabel: (date) => {
                        return (
                            <div>
                                <AnimatePresence>
                                    {isLoading ? (
                                        <m.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="flex h-5 items-center justify-center"
                                        >
                                            <FaSpinner className="animate-spin text-foreground-f2" size={"1rem"} />
                                        </m.div>
                                    ) : (
                                        <>
                                            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                                                <div className="text-sm">{date.displayMonth.toLocaleString("default", { month: "long", year: "numeric" })}</div>
                                            </m.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    },
                }}
            />
            <div className="flex flex-col gap-[2px] ml-2">
                <MonthlyStats monthlyStats={monthStats} />
                {Object.keys(weekStats).map((weekNumber) => (
                    <WeeklyStats key={weekNumber} weeklyStats={weekStats[Number(weekNumber)]} />
                ))}
            </div>
        </div>
    );
}

AdvancedCalendar.displayName = "AdvancedCalendar";

export { AdvancedCalendar };