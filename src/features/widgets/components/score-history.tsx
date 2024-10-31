"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Dot, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";


const chartConfig = {
    profitFactor: {
        label: "Profit Factor",
        color: "hsl(var(--chart-1))"
    },
    winRate: {
        label: "Win %",
        color: "hsl(var(--chart-2))"
    },
    avgWinLoss: {
        label: "Win/Loss Ratio",
        color: "hsl(var(--chart-3))"
    },
    consistency: {
        label: "Consistency",
        color: "hsl(var(--chart-4))"
    },
    riskManagement: {
        label: "Risk",
        color: "hsl(var(--chart-5))"
    },
    overall: {
        label: "Total",
        color: "hsl(var(--chart-6))"
    }
} satisfies ChartConfig;

interface ScoreHistoryWidgetProps {
    chartData: { date: Date; profitFactor: number; winRate: number }[];
}

export function ScoreHistoryWidget({ chartData }: ScoreHistoryWidgetProps) {
    return (
        <Card className={"w-full h-full"}>
            <CardHeader>
                <CardTitle>Scores Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.toLocaleDateString()}
                        />
                        <YAxis tickLine={false} axisLine={false} width={16}/>
                        <Legend verticalAlign="top" height={32}  layout={"horizontal"} iconSize={12}
                                formatter={(value) => {
                                    return chartConfig[value as keyof typeof chartConfig].label;
                                }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent className={"w-64"} />} labelFormatter={(value,x) => new Date(x[0]?.payload.date).toLocaleDateString()} />
                        <Line dataKey="profitFactor" type="monotone" stroke="var(--color-profitFactor)" strokeWidth={1} r={1} className={"opacity-50"} />
                        <Line dataKey="winRate" type="monotone" stroke="var(--color-winRate)" strokeWidth={1} r={1} className={"opacity-50"} />
                        <Line dataKey="avgWinLoss" type="monotone" stroke="var(--color-avgWinLoss)" strokeWidth={1} r={1} className={"opacity-50"} />
                        <Line dataKey="consistency" type="monotone" stroke="var(--color-consistency)" strokeWidth={1} r={1} className={"opacity-50"} />
                        <Line dataKey="riskManagement" type="monotone" stroke="var(--color-riskManagement)" strokeWidth={1} r={1} className={"opacity-50"} />
                        <Line dataKey="overall" type="monotone" stroke="var(--color-overall)" strokeWidth={1} r={2} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}