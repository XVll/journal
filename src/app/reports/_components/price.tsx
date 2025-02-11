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


interface PriceProps {
    chartData: { price: string, count: number }[];
}

export default function Price({ chartData }: PriceProps) {
    return (
        <Card className={"w-full h-full"}>
            <CardHeader>
                <CardTitle>Trade Distribution by price of Week</CardTitle>
            </CardHeader>
            <CardContent className={"pl-0"}>
                <ChartContainer config={{}} className={"aspect-square "}>
                    <BarChart

                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            right: 36,
                            left: 36
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="price"
                            type="category"
                            className={"font-mono"}
                            fontSize={11}
                            tickLine={false}
                            width={110}
                            tickMargin={36}
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
                                    <Cell  key={`cell-${index}`} className={cn(entry.count > 0 ? "fill-foreground-green":"fill-foreground-red ")}/>
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
