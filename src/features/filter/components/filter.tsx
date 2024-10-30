"use client";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaDollarSign, FaFileInvoice, FaPercent, FaR } from "react-icons/fa6";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { PnlType, Unit } from "../types";
import { FormDescription } from "@/components/ui/form";
import { useFilterStore } from "../hooks/use-filters";
import { FilterDatePicker } from "@/features/filter/components/filter-date-picker";

const filterSchema = z.object({
    unit: z.string(),
    pnlType: z.string(),
    dateRange: z.date({
        required_error: "Date is required"
    })
});

const Filter = () => {
    const { pnlType, unit,dateRange,setUnit, setPnlType } = useFilterStore();

    const onSubmit = async () => {
        toast({
            title: "Filters",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify({
                        pnlType: PnlType[pnlType],
                        unitType: Unit[unit],
                        dateRange
                    }, null, 2)}</code>
                </pre>
            )
        });
    };

    return (
        <div className="flex gap-2 justify-center items-center">
            <Button onClick={() => onSubmit()} variant="outline" className="min-w-16" size={"sm"}>Test</Button>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-16" size={"sm"}>{PnlType[pnlType]}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>PnL Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={pnlType === PnlType.Gross}
                        onCheckedChange={() => setPnlType(PnlType.Gross)}
                    >
                        <div className="flex flex-col">
                <span className="inline-flex items-center gap-2 text-center">
                    <FaFileInvoice /> Gross
                </span>
                            <span className="text-xs text-foreground-f3 ml-[1.4rem]">Commissions excluded</span>
                        </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={pnlType === PnlType.Net}
                        onCheckedChange={() => setPnlType(PnlType.Net)}
                    >
                        <div className="flex flex-col">
                <span className="inline-flex items-center gap-2 text-center">
                    <FaFileInvoice /> Net
                </span>
                            <span className="text-xs text-foreground-f3 ml-[1.4rem]">Commissions Included</span>
                        </div>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"
                            size={"sm"}>{unit === Unit.Currency ? "$" : unit === Unit.Percent ? "%" : "R"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Unit</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={unit === Unit.Currency} onCheckedChange={() => setUnit(Unit.Currency)}>
                    <div className="flex flex-col">
                        <span className="inline-flex items-center gap-2 text-center">
                            <FaDollarSign /> Dollar
                        </span>
                    </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={unit === Unit.Percent}
                        onCheckedChange={() => setUnit(Unit.Percent)}
                    >
                        <div className="flex flex-col">
                <span className="inline-flex items-center gap-2 text-center">
                    <FaPercent /> Percentage
                </span>
                            <span
                                className="text-xs text-foreground-f3 ml-[1.4rem]">Percentage required</span>
                        </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={unit === Unit.RMultiple}
                                              onCheckedChange={() => setUnit(Unit.RMultiple)}>
                        <div className="flex flex-col">

                        <span className="inline-flex items-center gap-2 text-center">
                            <FaR /> R-Multiple
                        </span>
                            <span className="text-xs text-foreground-f3 ml-[1.4rem]">Risk required</span>
                        </div>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <FilterDatePicker/>


        </div>
    );
};


export default Filter;

