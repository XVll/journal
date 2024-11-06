/*
      * Trade Distribution by Day of Week / Month of Year
        * Bar chart with Day of Week on x-axis and Trade Count on y-axis
        * Required data: {DayOfWeek: String, TradeCount: Int}[]
*/

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


const chartData = [
    { day: "Monday", count: 10},
    { day: "Tuesday", count: 305 },
    { day: "Wednesday", count: 237 },
    { day: "Thursday", count: 73 },
    { day: "Friday", count: 209 },
    { day: "Saturday", count: 214 },
    { day: "Sunday", count: 214 }
];

const chartConfig = {
    count: {
        label: "count",
        color: "hsl(var(--chart-1))"
    },
    label: {
        color: "hsl(var(--background))"
    }
} satisfies ChartConfig;

export default function ReportsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bar Chart - Custom Label</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
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
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
