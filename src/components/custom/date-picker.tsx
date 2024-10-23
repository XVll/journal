"use client"
import React from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    onDateChanged: (date: Date) => void;
}

const DatePicker = ({ onDateChanged }: DatePickerProps) => {
    const [date, setDate] = React.useState<Date>();

    const handleDateClicked = (date: Date) => {
        setDate(date);
        onDateChanged(date);
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" onDayClick={handleDateClicked} initialFocus />
            </PopoverContent>
        </Popover>
    );
};

export default DatePicker;
