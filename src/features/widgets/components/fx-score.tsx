"aspect-squaruuse client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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
import { FormatUnit } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Unit } from "@/features/filter/types";
import { Stats } from "@/features/calendar/types";


const chartConfig = {
    factor: {
        label: "Value",
        color: "hsl(var(--blue))"
    }
} satisfies ChartConfig;

interface FxScoreWidgetProps {
    stats: Stats,
    betPercentage: number,

}

export function FxScoreWidget({ stats, betPercentage }: FxScoreWidgetProps) {

    const chartData = [
        {
            factor: "Win Rate",
            value: stats.scores.winRate,
            displayValue: `${stats.scores.winRate.toFixed(2)}%`
        },
        {
            factor: "Profit Factor",
            value: stats.scores.profitFactor,
            displayValue: `${stats.scores.profitFactor.toFixed(2)}%`
        },
        {
            factor: "Avg Win/Loss",
            value: stats.scores.avgWinLoss,
            displayValue: `${(stats.scores.avgWinLoss).toFixed(2)}%`
        }
    ];
    if (stats.days > 2) {
        chartData.push(
            {
                factor: "Consistency",
                value: stats.scores.consistency,
                displayValue: `${stats.scores.consistency.toFixed(2)}%`
            }
        );
        chartData.push(
            {
                factor: "Risk Management",
                value: stats.scores.riskManagement,
                displayValue: `${stats.scores.riskManagement.toFixed(2)}%`
            }
        );
    }
    return (
        <Card className={"w-full h-full"}>
            <CardHeader className="pb-4">
                <CardTitle>Score</CardTitle>
                {
                    stats.days === 0
                        ? <CardDescription>No trading data available</CardDescription>
                        : stats.days < 3 ? <CardDescription>Not enough trading data</CardDescription> : null
                }
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-auto h-48 "
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip formatter={(value, s, k) => k.payload.displayValue} cursor={false}
                                      content={<ChartTooltipContent indicator={"line"} />} />
                        <PolarAngleAxis dataKey="factor" />
                        <PolarGrid />
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
                    stats.scores.overall >= 50 ? "text-foreground-green" :
                        stats.scores.overall >= 40 ? "text-foreground-yellow" : "text-foreground-red"
                )}>
                    Your score is {stats.scores.overall.toFixed(2)}% <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 font-medium leading-none">
                    Suggested bet size %{(betPercentage * 100).toFixed(2)} of Buying Power <TrendingUp
                    className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>
    );
}
