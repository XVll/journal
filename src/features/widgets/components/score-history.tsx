"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Dot, Legend, Line, LineChart, XAxis } from "recharts";

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
        label: "ProfitFactor",
        color: "hsl(var(--chart-1))"
    },
    winRate: {
        label: "WinRate",
        color: "hsl(var(--chart-2))"
    },
    avgWinLoss: {
        label: "AvgWinLoss",
        color: "hsl(var(--chart-3))"
    },
    consistency: {
        label: "Consistency",
        color: "hsl(var(--chart-4))"
    },
    riskManagement: {
        label: "RiskManagement",
        color: "hsl(var(--chart-5))"
    },
    overall: {
        label: "Overall",
        color: "hsl(var(--chart-6))"
    }
} satisfies ChartConfig;

interface ScoreHistoryWidgetProps {
    chartData: { date: Date; profitFactor: number; winRate: number }[];
}

export function ScoreHistoryWidget({ chartData }: ScoreHistoryWidgetProps) {
    return (
        <Card className={"w-full"}>
            <CardHeader>
                <CardTitle>Scores Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.toLocaleDateString()}
                        />
                        <Legend verticalAlign="top" height={40} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} labelFormatter={(value) => "Score Factors"} />
                        <Line dataKey="profitFactor" type="monotone" stroke="var(--color-profitFactor)" strokeWidth={.5} r={.5} className={"opacity-50"}/>
                        <Line dataKey="winRate" type="monotone" stroke="var(--color-winRate)" strokeWidth={.5} r={.5} className={"opacity-50"}/>
                        <Line dataKey="avgWinLoss" type="monotone" stroke="var(--color-avgWinLoss)" strokeWidth={.5} r={.5} className={"opacity-50"}/>
                        <Line dataKey="consistency" type="monotone" stroke="var(--color-consistency)" strokeWidth={.5} r={.5} className={"opacity-50"}/>
                        <Line dataKey="riskManagement" type="monotone" stroke="var(--color-riskManagement)" strokeWidth={.5} r={.5} className={"opacity-50"}/>
                        <Line dataKey="overall" type="monotone" stroke="var(--color-overall)" strokeWidth={1} r={2} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}