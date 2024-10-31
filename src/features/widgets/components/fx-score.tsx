"use client"

import {TrendingUp} from "lucide-react"
import {PolarAngleAxis, PolarGrid, Radar, RadarChart} from "recharts"

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
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {FormatUnit} from "@/lib/helpers";
import {cn} from "@/lib/utils";
import {Unit} from "@/features/filter/types";


const chartConfig = {
    factor: {
        label: "Value",
        color: "hsl(var(--blue))",
    },
} satisfies ChartConfig

interface FxScoreWidgetProps {
    chartData: { factor: string; value: number, displayValue: string }[],
    totalScore: number,
    betSize: number,
    unit : Unit

}

export function FxScoreWidget({chartData, totalScore, betSize, unit}: FxScoreWidgetProps) {
    return (
        <Card className={"w-full h-full"}>
            <CardHeader className="items-center pb-4">
                <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] w-full h-full"
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip formatter={(value, s, k) => k.payload.displayValue} cursor={false}
                                      content={<ChartTooltipContent indicator={"line"}/>}/>
                        <PolarAngleAxis dataKey="factor"/>
                        <PolarGrid/>
                        <Radar
                            dataKey="value"
                            fill="var(--color-factor)"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className={cn("flex items-center gap-2 font-medium leading-none",
                    totalScore >= 50 ? "text-foreground-green" :
                        totalScore >= 40 ? "text-foreground-yellow" : "text-foreground-red"
                )}>
                    Your score is {totalScore.toFixed(2)}% <TrendingUp className="h-4 w-4"/>
                </div>
                <div className="flex items-center gap-2 font-medium leading-none">
                    Suggested bet size {FormatUnit(betSize, unit)} <TrendingUp className="h-4 w-4"/>
                </div>
            </CardFooter>
        </Card>
    )
}
