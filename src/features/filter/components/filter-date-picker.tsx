"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
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
    const {dateRange: dateRange, setDateRange} = useFilterStore();

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
                            <Button onClick={(e) => setDateRange(e)} variant={"ghost"}>Today</Button>
                            <Button variant={"ghost"}>Yesterday</Button>
                            <Button variant={"ghost"}>Last 7 days</Button>
                            <Button variant={"ghost"}>Last 30 days</Button>
                        </div>
                        <div className={""}>
                            <Separator orientation={"vertical"} className={""} />
                        </div>
                        <Calendar
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
