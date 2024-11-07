"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

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
import { cn } from "@/lib/utils";


const chartData = [
    { day: "Monday", count: 10 },
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
        color: "hsl(var(--green-bg))"
    }
} satisfies ChartConfig;

interface D_dayOfWeekProps {
    chartData: typeof chartData;
}

export default function DayOfWeek({ chartData }: D_dayOfWeekProps) {
    return (
        <Card className={"w-full h-full"}>
            <CardHeader>
                <CardTitle>Trade Distribution by Day of Week</CardTitle>
            </CardHeader>
            <CardContent className={"pl-0"}>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            right: 36,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="day"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            interval={0}
                            axisLine={false}
                        />
                        <XAxis dataKey="count" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="count"
                            layout="vertical"
                            className={cn("fill-foreground")}
                            radius={4}
                        >
                            {
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} className={cn(entry.count > 0 ? "fill-foreground-green":"fill-foreground-red")}/>
                                ))
                            }
                            <LabelList
                                dataKey="count"
                                position="right"
                                className="fill-foreground"
                                offset={8}
                                fontSize={12}
                                formatter={(value: number) => !!value ? value.toFixed(2) : ""}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
