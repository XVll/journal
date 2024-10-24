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

export const description = "A horizontal stacked bar chart with a legend"

const chartData = [
  { a: "Win",b:"Loss", win: 486, loss: 10 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function WinLossWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Horizontal Stacked + Legend</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            layout="vertical" // Makes the chart horizontal
            width={500}
            height={300}
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" tickLine={false} axisLine={false} hide />
            <YAxis type="category" dataKey="a" tickLine={false} axisLine={false} hide />
            <Tooltip />
            <Bar
              dataKey="win"
              stackId="a"
              fill="var(--color-desktop)"
              radius={[4, 0, 0, 4]}
            >
                <LabelList dataKey="win" position="left" />
                <LabelList dataKey="a" position="bottom" className="fill-foreground" />
            </Bar>
            <Bar
              dataKey="loss"
              stackId="a"
              fill="var(--color-mobile)"
              radius={[0, 4, 4, 0]}
            >
                <LabelList dataKey="loss" position="right" />
                <LabelList dataKey="b" position="bottom" className="fill-foreground" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
