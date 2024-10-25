"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts"

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
import { Berkshire_Swash } from "next/font/google"
import { cn } from "@/lib/utils"




const chartConfig = {
  win: {
    label: "Win",
    color: "hsl(var(--green-bg))",
  },
  loss: {
    label: "Loss",
    color: "hsl(var(--red-bg))",
  },
  breakeven: {
    label: "Breakeven",
    color: "hsl(var(--blue-bg))",
  },
  label: {
    color: "hsl(var(--f2))",
  },
} satisfies ChartConfig

interface WinLossWidgetProps {
  win: number,
  loss: number,
  breakeven: number,
  winRate: number,
  looseRate: number,
  breakevenRate: number,
}
export function WinLossWidget({win,loss,breakeven, winRate, looseRate, breakevenRate}: WinLossWidgetProps) {
const chartData = 
    {
        win: win,
        loss: loss,
        breakeven: breakeven,
        winp: winRate,
        lossp: looseRate,
        breakevenp: breakevenRate,
    }

  return (
      <div className="h-full w-full">
          <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trade Win %</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-row items-start justify-start gap-4">
                  <div className={cn("text-2xl font-bold", chartData.winp > 0 ? "text-foreground-green" : "text-foreground-red")}>
                      {chartData.winp.toFixed(2)}%
                  </div>
                  <ChartContainer config={chartConfig} className="w-full h-8">
                      <BarChart layout="vertical" data={[chartData]} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                          <XAxis type="number" tickLine={false} axisLine={false} hide className="w-full" />
                          <YAxis type="category" hide />
                          <Bar dataKey="winp" stackId="a" fill="var(--color-win)" radius={[4, 0, 0, 4]} className="w-full">
                              <LabelList dataKey="win" position="inside" offset={8} className="fill-foreground-green" fontSize={12} />
                          </Bar>
                          <Bar dataKey="breakevenp" stackId="a" fill="var(--color-breakeven)" radius={[0, 0, 0, 0]} >
                              <LabelList dataKey="breakeven" position="inside" offset={8} className="fill-foreground-blue" fontSize={12} />
                          </Bar>
                          <Bar dataKey="lossp" stackId="a" fill="var(--color-loss)" radius={[0, 4, 4, 0]} >
                              <LabelList dataKey="loss" position="inside" offset={8} className="fill-foreground-red" fontSize={12} />
                          </Bar>
                      </BarChart>
                  </ChartContainer>
              </CardContent>
          </Card>
      </div>
  );
}
