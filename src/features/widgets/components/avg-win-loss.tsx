"use client"

import {TrendingUp} from "lucide-react"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList} from "recharts"

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
} from "@/components/ui/chart"
import {Berkshire_Swash} from "next/font/google"
import {cn} from "@/lib/utils"
import {FormatUnit} from "@/lib/helpers"
import {Unit} from "@/features/filter/types";


const chartConfig = {
    avgWin: {
        label: "Average Win",
        color: "hsl(var(--green-bg))",
    },
    avgLoss: {
        label: "Average Loss",
        color: "hsl(var(--red-bg))",
    },
    label: {
        color: "hsl(var(--f2))",
    },
} satisfies ChartConfig

interface AvgWinLossWidgetProps {
    avgWin: number,
    avgLoss: number,
    unit: Unit,
}

export function AvgWinLossWidget({avgWin, avgLoss, unit}: AvgWinLossWidgetProps) {
    avgLoss = Math.abs(avgLoss);
    const chartData = {
        avgWin: avgWin,
        avgLoss: avgLoss,
        avgWinP: avgWin / ((avgWin + avgLoss) || 1) * 100,
        avgLossP: avgLoss / ((avgWin + avgLoss) || 1) * 100,
    };


    return (
        <div className="h-full w-full">
            <Card className="w-full px-4 py-2">
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-1">
                    <CardTitle className="text-sm font-medium">Avg Win/Loss</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row items-start justify-start gap-4 p-0">
                    <div
                        className={cn("text-2xl font-bold", chartData.avgWin / chartData.avgLoss >= 1 ? "text-foreground-green" : "text-foreground-red")}>
                        {(chartData.avgWin / (chartData.avgLoss || 1)).toFixed(2)}
                    </div>
                    <ChartContainer config={chartConfig} className="h-8 w-full">
                        <BarChart layout="vertical" data={[chartData]} margin={{left: 0, right: 0, top: 0, bottom: 0}}>
                            <XAxis type="number" tickLine={false} axisLine={false} hide className="w-full"/>
                            <YAxis type="category" hide/>
                            <Bar dataKey="avgWinP" stackId="a" radius={[4, 0, 0, 4]} className="fill-background-green">
                                {
                                    chartData.avgWin > 0 &&
                                    <LabelList dataKey="avgWin" position="inside" offset={8}
                                               className="fill-foreground-green" fontSize={12}
                                               formatter={(value: number) => FormatUnit(value, unit)}/>
                                }
                            </Bar>
                            <Bar dataKey="avgLossP" stackId="a" radius={[0, 4, 4, 0]} className="fill-background-red">
                                {
                                    chartData.avgLoss > 0 &&
                                    <LabelList dataKey="avgLoss" position="inside" offset={8}
                                               className="fill-foreground-red" fontSize={12}
                                               formatter={(value: number) => FormatUnit(value, unit)}/>
                                }
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}


export default AvgWinLossWidget;