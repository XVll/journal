"use client"

import {TrendingUp} from "lucide-react"
import {Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {FormatUnit} from "@/lib/helpers";
import {Unit} from "@/features/filter/types";

export const description = "A bar chart with negative values"


const chartConfig = {
    pnl: {
        label: "PnL",
    },
} satisfies ChartConfig

interface DailyPnlWidgetProps {
    chartData: { date: Date, pnl: number }[],
    unit: Unit
}

export function DailyPnlWidget({chartData, unit}: DailyPnlWidgetProps) {
    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle>Bar Chart - Negative</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false}/>
                        <XAxis tickLine={false} axisLine={false} dataKey="date"
                               tickFormatter={(value: Date) => value.toLocaleDateString()}/>
                        <YAxis dataKey="pnl" tickLine={false} axisLine={false}/>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(val) => FormatUnit(val.toString(), unit)}/>}/>
                        <Bar dataKey="pnl" strokeWidth={2} radius={2}>
                            {chartData.map((item) => (
                                <Cell key={item.date.toLocaleString()}
                                      fill={item.pnl > 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}/>
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
