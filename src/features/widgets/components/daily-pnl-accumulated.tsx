"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {Unit} from "@/features/filter/types";
import {FormatUnit} from "@/lib/helpers";


const chartConfig = {
    pnl: {
        label: "PnL",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;
interface DailyPnlAccumulatedWidgetProps {
chartData: { date: Date, pnl: number }[],
    unit:Unit
}

export function DailyPnlAccumulatedWidget({ chartData ,unit}: DailyPnlAccumulatedWidgetProps) {
    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle>Area Chart - Gradient</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleDateString()} />
                        <YAxis dataKey="pnl" tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent  formatter={(val) => FormatUnit(val.toString(), unit)}/>} />
                        <defs>
                            <linearGradient id="fillpnl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-pnl)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-pnl)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area dataKey="pnl" type="natural" fill="url(#fillpnl)" fillOpacity={0.4} stroke="var(--color-pnl)" stackId="a" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
