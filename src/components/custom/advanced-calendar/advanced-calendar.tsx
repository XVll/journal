"use client";
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DayContentProps, DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TradeResult } from "@prisma/client";
import { startOfToday } from "date-fns";
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
  };
};

export type AdvancedCalendarProps = React.ComponentProps<typeof DayPicker>;
function AdvancedCalendar({
  dayStats,
  weekStats,
  monthStats,
  displayDate,
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: AdvancedCalendarProps & {
  dayStats: Record<string, CalendarDayStats>;
  weekStats: Record<number, CalendarWeekStats>;
  monthStats: CalendarMonthStats;
  displayDate?: Date;
}) {
  const [selected, setSelected] = React.useState<Date | undefined>(displayDate || startOfToday());

  return (
    <div className="flex">
      <DayPicker
        mode="single"
        month={selected || startOfToday()}
        onSelect={setSelected}
        modifiers={modifiers(dayStats)}
        selected={selected}
        modifiersClassNames={{
          winningDay: "!bg-background-green !text-foreground-green",
          losingDay: "!bg-background-red !text-foreground-red",
          breakEvenDay: "!bg-bakckground-b0 !text-foreground-f1",
        }}
        showOutsideDays={showOutsideDays}
        className={cn("p-3 w-full", className)}
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
            "relative p-[.1rem] text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md"
          ),
          day: cn(buttonVariants({ variant: "ghost" }), "h-20 w-full text-xs  rounded-sm font-normal aria-selected:opacity-100 bg-accent"),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
          DayContent: (props: DayContentProps) => <DayStats {...props} tradeDays={dayStats} />,
        }}
        {...props}
      />

      <div className="mt-[0.6rem] flex flex-col gap-[.2rem]">
        <MonthlyStats monthlyStats={monthStats} />
        {Object.keys(weekStats).map((weekNumber) => (
          <WeeklyStats key={weekNumber} weeklyStats={weekStats[weekNumber]} />
        ))}
      </div>
    </div>
  );
}

AdvancedCalendar.displayName = "AdvancedCalendar";

export { AdvancedCalendar };
