"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

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

export const description = "A bar chart with negative values"


const chartConfig = {
  pnl: {
    label: "pnl",
  },
} satisfies ChartConfig

interface DailyPnlWidgetProps {
chartData: { date: Date, pnl: number }[]
}
export function DailyPnlWidget({ chartData }: DailyPnlWidgetProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bar Chart - Negative</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis tickLine={false} axisLine={false} dataKey="date" tickFormatter={(value: Date) => value.toLocaleDateString()} />
                        <YAxis dataKey="pnl" tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
                        <Bar dataKey="pnl" strokeWidth={2} radius={2}>
                            {chartData.map((item) => (
                                <Cell key={item.date.toLocaleString()} fill={item.pnl > 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
