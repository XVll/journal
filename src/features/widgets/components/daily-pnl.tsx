"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

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

export const description = "A bar chart with negative values"

const chartData = [
  { day: new Date(2024,1,1), pnl: 186 },
  { day: new Date(2024,1,2), pnl: 205 },
  { day: new Date(2024,1,3), pnl: -307 },
  { day: new Date(2024,1,4), pnl: 173 },
  { day: new Date(2024,1,5), pnl: -209 },
  { day: new Date(2024,1,6), pnl: 214 },
  { day: new Date(2024,1,7), pnl: 186 },
  { day: new Date(2024,1,8), pnl: 205 },
  { day: new Date(2024,1,9), pnl: -207 },
  { day: new Date(2024,1,10), pnl: 173 },
  { day: new Date(2024,1,11), pnl: -209 },
  { day: new Date(2024,1,12), pnl: 214 },
  { day: new Date(2024,1,13), pnl: 786 },
  { day: new Date(2024,1,14), pnl: 205 },
  { day: new Date(2024,1,15), pnl: -207 },
  { day: new Date(2024,2,4), pnl: 173 },
  { day: new Date(2024,2,5), pnl: -209 },
  { day: new Date(2024,2,6), pnl: 214 },
  { day: new Date(2024,2,7), pnl: 186 },
  { day: new Date(2024,2,8), pnl: 1205 },
  { day: new Date(2024,2,9), pnl: -2207 },
  { day: new Date(2024,2,10), pnl: 173 },
  { day: new Date(2024,2,11), pnl: -209 },
  { day: new Date(2024,2,12), pnl: 214 },
]

const chartConfig = {
  pnl: {
    label: "pnl",
  },
} satisfies ChartConfig

export function DailyPnlWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Negative</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid  />
            <XAxis tickLine={false} axisLine={false} dataKey="day" tickFormatter={(value:Date) => value.toLocaleDateString()} />
            <YAxis dataKey="pnl" tickLine={false} axisLine={false}/>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Bar dataKey="pnl" strokeWidth={2} radius={4}>
              {chartData.map((item) => (
                <Cell
                  key={item.day.toLocaleString()}
                  fill={
                    item.pnl > 0
                      ? "hsl(var(--chart-1))"
                      : "hsl(var(--chart-2))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
