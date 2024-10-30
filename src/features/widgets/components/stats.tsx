"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";

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
    ChartContainer
} from "@/components/ui/chart";
import { Berkshire_Swash } from "next/font/google";
import { cn } from "@/lib/utils";


const chartConfig = {
    win: {
        label: "Win",
        color: "hsl(var(--green-bg))"
    },
    loss: {
        label: "Loss",
        color: "hsl(var(--red-bg))"
    },
    breakeven: {
        label: "Breakeven",
        color: "hsl(var(--blue-bg))"
    },
    label: {
        color: "hsl(var(--f2))"
    }
} satisfies ChartConfig;

interface StatsWidgetProps {
    left: number,
    mid?: number,
    right: number,
    formatter?: Function
}

export function StatsWidget({ left, mid, right, formatter }: StatsWidgetProps) {
    const chartData =
        {
            left: left,
            mid: mid,
            right: right,
            leftP: mid ? left / (left + mid + right) * 100 : left / (left + right) * 100,
            midP: mid ? mid / (left + mid + right) * 100 : 0,
            rightP: mid ? right / (left + mid + right) * 100 : right / (left + right) * 100
        };

    return (
        <div className="h-full w-full ">
            <ChartContainer config={chartConfig} className="w-full h-5">
                <BarChart layout="vertical" data={[chartData]} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <XAxis type="number" tickLine={false} axisLine={false} hide className="w-full" />
                    <YAxis type="category" hide />
                    {
                        chartData.left > 0 &&
                        <Bar dataKey="leftP" stackId="a" fill="var(--color-win)" radius={[4, 0, 0, 4]}
                             className="w-full">
                            {
                                <LabelList dataKey="left" position="inside" offset={8} className="fill-foreground-green" fontSize={12} formatter={formatter}/>
                            }
                        </Bar>

                    }
                    {
                        chartData.mid && chartData.mid > 0 &&
                        <Bar dataKey="midP" stackId="a" fill="var(--color-breakeven)" radius={[0, 0, 0, 0]}>
                            {
                                <LabelList dataKey="mid" position="inside" offset={8} className="fill-foreground-blue" fontSize={12} formatter={formatter}/>
                            }
                        </Bar>
                    }
                    {
                        chartData.right > 0 &&
                        <Bar dataKey="rightP" stackId="a" fill="var(--color-loss)" radius={[0, 4, 4, 0]}>
                            {
                                <LabelList dataKey="right" position="inside" offset={8} className="fill-foreground-red"
                                           fontSize={12} formatter={formatter}/>
                            }
                        </Bar>
                    }
                </BarChart>
            </ChartContainer>
        </div>
    );
}
