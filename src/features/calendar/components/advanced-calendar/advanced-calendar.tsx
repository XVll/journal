"use client";
import * as React from "react";
import { DayContentProps, DayPicker } from "react-day-picker";
import { TradeResult } from "@prisma/client";
import { isWeekend} from "date-fns";
import { WeeklyStats } from "./weekly-stats";
import { DayStats } from "./day-stats";
import { MonthlyStats } from "./monthly-stats";
import { AdvancedCalendarBase } from "./advanced-calendar-base";
import { FaSpinner } from "react-icons/fa";
import DatePicker from "@/components/custom/date-picker";

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

function AdvancedCalendar({
    dayStats,
    weekStats,
    monthStats,
    onMonthChange,
    isLoading
}: {
    dayStats: Record<string, CalendarDayStats>;
    weekStats: Record<number, CalendarWeekStats>;
    monthStats: CalendarMonthStats;
    onMonthChange?: (date: Date) => void;
    isLoading:boolean
}) {

  const handleMonthChange = (date: Date) => {
    onMonthChange?.(date);
  }
    return (
        <div className="relative m-2 flex p-1 pr-4">
            <AdvancedCalendarBase
                onMonthChange={handleMonthChange}
                modifiers={modifiers(dayStats)}
                modifiersClassNames={{
                    winningDay: "!bg-background-green !text-foreground-green hover:!bg-foreground-green/10",
                    losingDay: "!bg-background-red !text-foreground-red hover:!bg-foreground-red/10",
                    breakEvenDay: "!bg-background-b0 !text-foreground-f1 hover:!bg-foreground-f1/10",
                    weekend:
                        "bg-[repeating-linear-gradient(45deg,var(--tw-gradient-stops))] from-background-b2 from-[length:0_10px] to-background-b1 to-[length:0_20px]",
                }}
                components={{ 
                  DayContent: (props: DayContentProps) => <DayStats {...props} tradeDays={dayStats} calendarTargets={calendarTargets} />, 
                  CaptionLabel:( date ) => {
                    return (
                        <div>
                            {isLoading ? (
                                <div className="flex h-5 items-center justify-center">
                                    <FaSpinner className="animate-spin" size={"1rem"} />
                                </div>
                            ) : (
                                <>
                                    <div className="text-sm">{date.displayMonth.toLocaleString("default", { month: "long", year: "numeric" })}</div>
                                </>
                            )}
                        </div>
                    );
                }
                }}
            />
            <div className="flex flex-col gap-[2px]">
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