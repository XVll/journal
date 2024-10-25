"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";


const chartConfig = {
    pnl: {
        label: "pnl",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;
interface DailyPnlAccumulatedWidgetProps {
chartData: { date: Date, pnl: number }[]
}

export function DailyPnlAccumulatedWidget({ chartData }: DailyPnlAccumulatedWidgetProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Area Chart - Gradient</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleDateString()} />
                        <YAxis dataKey="pnl" tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
