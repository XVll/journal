"use client";
import * as React from "react";
import { DayContentProps, DayPicker } from "react-day-picker";
import { Trade, TradeResult } from "@prisma/client";
import { isWeekend } from "date-fns";
import { WeeklyStats } from "./weekly-stats";
import { DayStats } from "./day-stats";
import { MonthlyStats } from "./monthly-stats";
import { AdvancedCalendarBase } from "./advanced-calendar-base";
import { FaSpinner } from "react-icons/fa";
import DatePicker from "@/components/custom/date-picker";
import { AnimatePresence, m } from "framer-motion";
import { useGetCalendarDataQuery } from "../../hooks/use-get-calendar-data-query";
import {
    generateDailyCalendarStats,
    generateWeeklyCalendarStats,
    generateMonthlyCalendarStats
} from "../../transformers/transformers";
import { useEffect } from "react";
import { Unit } from "@/features/filter/types";
import { DailyStats, ProfitTarget } from "@/features/calendar/types";
import { useUIStore } from "@/hooks/use-ui-settings";


const modifiers = (dailyStats: Record<string, DailyStats>) => {
    return {
        winningDay: Object.keys(dailyStats).filter((date) => dailyStats[date].result === TradeResult.Win).map((date) => new Date(date)),
        losingDay: Object.keys(dailyStats).filter((date) => dailyStats[date].result === TradeResult.Loss).map((date) => new Date(date)),
        breakEvenDay: Object.keys(dailyStats).filter((date) => dailyStats[date].result === TradeResult.BreakEven).map((date) => new Date(date)),
        weekend: (date: Date) => isWeekend(date)
    };
};

interface AdvancedCalendarProps {
    dailyStats: DailyStats[],
    unit: Unit,
    isLoading: boolean,
    profitTarget: ProfitTarget
}

function AdvancedCalendar({ dailyStats, unit, isLoading, profitTarget }: AdvancedCalendarProps) {
    const [selectedCalendarDate, setSelectedCalendarDate] = React.useState(new Date());
    const { setDailyDrawerOpen } = useUIStore();

    let dayStats = generateDailyCalendarStats(dailyStats, selectedCalendarDate);
    const weekStats = generateWeeklyCalendarStats(dayStats, selectedCalendarDate);
    const monthStats = generateMonthlyCalendarStats(dayStats, selectedCalendarDate);

    useEffect(() => {
        dayStats = generateDailyCalendarStats(dailyStats, selectedCalendarDate);
    }, [dailyStats, selectedCalendarDate]);

    return (
        <div className="relative grid grid-cols-8 border p-2 rounded-xl">
            <AdvancedCalendarBase
                className="col-span-7"
                onDayClick={(date) => {
                    setDailyDrawerOpen(true,date);
                }}
                onMonthChange={setSelectedCalendarDate}
                modifiers={modifiers(dayStats)}
                modifiersClassNames={{
                    winningDay: "!bg-background-green !text-foreground-green hover:!bg-foreground-green/20",
                    losingDay: "!bg-background-red !text-foreground-red hover:!bg-foreground-red/20",
                    breakEvenDay: "!bg-background-b1 !text-foreground-f1 hover:!bg-foreground-f1/20",
                    weekend:
                        "bg-[repeating-linear-gradient(45deg,var(--tw-gradient-stops))] from-background-b2 from-[length:0_10px] to-background-b1 to-[length:0_20px]"
                }}
                components={{
                    DayContent: (props: DayContentProps) => <DayStats {...props} tradeDays={dayStats}
                                                                      calendarTargets={profitTarget} unit={unit} />,
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
                                            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                   exit={{ opacity: 0 }}
                                                   transition={{ duration: 0.5 }}>
                                                <div className="text-sm">{date.displayMonth.toLocaleString("default", {
                                                    month: "long",
                                                    year: "numeric"
                                                })}</div>
                                            </m.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }
                }}
            />
            <div className="flex flex-col gap-[2px] ml-2">
                <MonthlyStats monthlyStats={monthStats} unit={unit} />
                {Object.keys(weekStats).map((weekNumber) => (
                    <WeeklyStats key={weekNumber} weeklyStats={weekStats[Number(weekNumber)]} unit={unit} />
                ))}
            </div>
        </div>
    );
}

AdvancedCalendar.displayName = "AdvancedCalendar";

export { AdvancedCalendar };