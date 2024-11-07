
"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

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
    count: {
        label: "count",
        color: "hsl(var(--chart-1))"
    },
    label: {
        color: "hsl(var(--background))"
    }
} satisfies ChartConfig;

interface HourOfDayProps {
    chartData: { hour: string, count: number }[];
}

export default function HourOfDay({ chartData }: HourOfDayProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Trade Distribution by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={"h-20 w-full"}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            right: 16
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="day"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            hide
                        />
                        <XAxis dataKey="count" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="count"
                            layout="vertical"
                            fill="var(--color-count)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="day"
                                position="insideLeft"
                                offset={8}
                                className="fill-[--color-label]"
                                fontSize={12}
                            />
                            <LabelList
                                dataKey="count"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value:number) => value.toFixed(2)}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
