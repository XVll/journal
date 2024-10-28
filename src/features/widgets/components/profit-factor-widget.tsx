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


const chartConfig = {
    profitFactor: {
        label: "Profit Factor",
        color: "hsl(var(--green-bg))",
    },
    lossFactor: {
        label: "Loss Factor",
        color: "hsl(var(--red-bg))",
    },
    label: {
        color: "hsl(var(--f2))",
    },
} satisfies ChartConfig

interface ProfitFactorWidgetProps {
    profitFactor: number,
    lossFactor: number,
}

export function ProfitFactorWidget({profitFactor, lossFactor}: ProfitFactorWidgetProps) {
    lossFactor = Math.abs(lossFactor);
    const chartData = {
        profitFactor: profitFactor,
        lossFactor: lossFactor,
        profitFactorp: profitFactor / (profitFactor + lossFactor) * 100,
        lossFactorp: lossFactor / (profitFactor + lossFactor) * 100,
    };


    return (
        <div className="h-full w-full">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row items-start justify-start gap-4">
                    <div
                        className={cn("text-2xl font-bold", chartData.profitFactor > 1 && "text-foreground-green", chartData.profitFactor < 1 && "text-foreground-red")}>
                        {chartData.profitFactor.toFixed(2)}
                    </div>
                    <ChartContainer config={chartConfig} className="h-8 w-full">
                        <BarChart layout="vertical" data={[chartData]} margin={{left: 0, right: 0, top: 0, bottom: 0}}>
                            <XAxis type="number" tickLine={false} axisLine={false} hide className="w-full"/>
                            <YAxis type="category" hide/>
                            <Bar dataKey="profitFactorp" stackId="a" radius={[4, 0, 0, 4]}
                                 className="fill-background-green"></Bar>
                            <Bar dataKey="lossFactorp" stackId="a" radius={[0, 4, 4, 0]}
                                 className="fill-background-red"></Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
