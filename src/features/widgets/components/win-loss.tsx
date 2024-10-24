"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

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


const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
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
                  <BarChart layout="vertical" data={chartData}>
                      <XAxis type="number" tickLine={false} axisLine={false} hide />
                      <YAxis type="category" dataKey="month" tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="desktop" stackId="a" fill="var(--color-desktop)" radius={[4, 0, 0, 4]} />
                      <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" radius={[0, 4, 4, 0]} />
                  </BarChart>
              </ChartContainer>
          </CardContent>
      </Card>
  );
}
