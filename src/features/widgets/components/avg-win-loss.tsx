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
import {Currency} from "@/lib/helpers"


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
}

export function AvgWinLossWidget({avgWin, avgLoss}: AvgWinLossWidgetProps) {
    const chartData = {
        avgWin: avgWin,
        avgLoss: avgLoss,
        avgWinnp: avgWin / (avgWin + avgLoss) * 100,
        avgLossp: avgLoss / (avgWin + avgLoss) * 100,
    };


    return (
        <div className="h-full w-full">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Win/Loss</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row items-start justify-start gap-4">
                    <div
                        className={cn("text-2xl font-bold", chartData.avgWin / chartData.avgLoss >= 1 ? "text-foreground-green" : "text-foreground-red")}>
                        {(chartData.avgWin / chartData.avgLoss).toFixed(2)}
                    </div>
                    <ChartContainer config={chartConfig} className="h-8 w-full">
                        <BarChart layout="vertical" data={[chartData]} margin={{left: 0, right: 0, top: 0, bottom: 0}}>
                            <XAxis type="number" tickLine={false} axisLine={false} hide className="w-full"/>
                            <YAxis type="category" hide/>
                            <Bar dataKey="avgWin" stackId="a" radius={[4, 0, 0, 4]} className="fill-background-green">
                                {
                                    chartData.avgWinnp > 0 &&
                                    <LabelList dataKey="avgWin" position="inside" offset={8}
                                               className="fill-foreground-green" fontSize={12}
                                               formatter={(value: number) => Currency(value)}/>
                                }
                            </Bar>
                            <Bar dataKey="avgLoss" stackId="a" radius={[0, 4, 4, 0]} className="fill-background-red">
                                {
                                    chartData.avgLossp > 0 &&
                                    <LabelList dataKey="avgLoss" position="inside" offset={8}
                                               className="fill-foreground-red" fontSize={12}
                                               formatter={(value: number) => Currency(value)}/>
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