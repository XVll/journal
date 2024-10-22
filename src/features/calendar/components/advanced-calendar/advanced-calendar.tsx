"use client";
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DayContentProps, DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TradeResult } from "@prisma/client";
import { isWeekend, startOfToday } from "date-fns";
import { WeeklyStats } from "./weekly-stats";
import { DayStats } from "./day-stats";
import { MonthlyStats } from "./monthly-stats";

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
// Define a interface for daily/weekly/ monthly targets
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
      winningDay: Object.keys(tradeDays)
          .filter((date) => tradeDays[date].result === TradeResult.Win)
          .map((date) => new Date(date)),
      losingDay: Object.keys(tradeDays)
          .filter((date) => tradeDays[date].result === TradeResult.Loss)
          .map((date) => new Date(date)),
      breakEvenDay: Object.keys(tradeDays)
          .filter((date) => tradeDays[date].result === TradeResult.BreakEven)
          .map((date) => new Date(date)),
      weekend: (date: Date) => isWeekend(date),
  };
};

export type AdvancedCalendarProps = React.ComponentProps<typeof DayPicker>;
function AdvancedCalendar({
  dayStats,
  weekStats,
  monthStats,
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: AdvancedCalendarProps & {
  dayStats: Record<string, CalendarDayStats>;
  weekStats: Record<number, CalendarWeekStats>;
  monthStats: CalendarMonthStats;
}) {

  return (
      <div className="m-2 flex p-1 pr-4">
          <DayPicker
              modifiers={modifiers(dayStats)}
              modifiersClassNames={{
                  winningDay: "!bg-background-green !text-foreground-green hover:!bg-foreground-green/10",
                  losingDay: "!bg-background-red !text-foreground-red hover:!bg-foreground-red/10",
                  breakEvenDay: "!bg-background-b0 !text-foreground-f1 hover:!bg-foreground-f1/10",
                  weekend:
                      "bg-[repeating-linear-gradient(45deg,var(--tw-gradient-stops))] from-background-b2 from-[length:0_10px] to-background-b1 to-[length:0_20px]",
              }}
              showOutsideDays={showOutsideDays}
              className={cn("w-full p-3", className)}
              classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "",
                  head_cell: "text-muted-foreground rounded-md w-[8.20rem] font-normal text-[0.8rem]",
                  row: "w-full mt-0 ",
                  cell: cn(
                      "relative text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                      "!hover:bg-background-bt3 focus:bg-accent/10",
                      props.mode === "range"
                          ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                          : "[&:has([aria-selected])]:rounded-md",
                  ),
                  day: cn(buttonVariants({ variant: "ghost" }), "h-20 w-full text-xs  rounded-sm font-normal aria-selected:opacity-100 bg-background-bt1"),
                  day_range_start: "day-range-start",
                  day_range_end: "day-range-end",
                  day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside:
                      "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  ...classNames,
              }}
              components={{
                  IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4 pointer-events-none" />,
                  IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4 pointer-events-none" />,
                  DayContent: (props: DayContentProps) => <DayStats {...props} tradeDays={dayStats} calendarTargets={calendarTargets} />,
              }}
              {...props}
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