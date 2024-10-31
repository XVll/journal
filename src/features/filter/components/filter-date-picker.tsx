"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import {
    addDays,
    endOfDay,
    endOfMonth, endOfYear,
    format,
    startOfDay,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths, subYears
} from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { useFilterStore } from "@/features/filter/hooks/use-filters";
import { Separator } from "@/components/ui/separator";

export function FilterDatePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const { dateRange: dateRange, setDateRange } = useFilterStore();
    const [selectedOption, setSelectedOption] = React.useState<string | undefined>("thisMonth");
    const setDates = (from?: Date, to?: Date, option?: string) => {
        setDateRange({ from, to });
        setSelectedOption(option);
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size={"sm"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className={"flex"}>
                        <div className={"flex flex-col px-4 py-2 gap-1"}>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "today" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfDay(new Date()), endOfDay(new Date()), "today")}>
                                Today
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "yesterday" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfDay(subDays(new Date(), 1)), endOfDay(subDays(new Date(), 1)), "yesterday")}>
                                Yesterday
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "last7day" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfDay(subDays(new Date(), 6)), endOfDay(new Date()), "last7day")}>
                                Last 7 days
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "last30day" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfDay(subDays(new Date(), 29)), endOfDay(new Date()), "last30day")}>
                                Last 30 days
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "thisMonth" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfMonth(new Date()), endOfMonth(new Date()), "thisMonth")}>
                                This Month
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "lastMonth" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1)), "lastMonth")}>
                                Last Month
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "ytd" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfYear(new Date()), new Date(), "ytd")}>
                                YTD
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "lastYear" ? "bg-accent" : "")}
                                    onClick={() => setDates(startOfYear(subYears(new Date(), 1)), endOfYear(subYears(new Date(), 1)), "lastYear")}>
                                Last Year
                            </Button>
                            <Button size={"sm"} variant={"ghost"}
                                    className={cn(selectedOption === "custom" ? "bg-accent" : "")}
                                    onClick={() => setDates(undefined,undefined,"custom")}>
                                Custom
                            </Button>
                        </div>
                        <div className={""}>
                            <Separator orientation={"vertical"} className={""} />
                        </div>
                        <Calendar
                            onDayClick={(day) => {
                                setSelectedOption("custom");
                            }}
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />

                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
