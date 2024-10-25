"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/lib/helpers";
import { cn } from "@/lib/utils";
interface ExpectancyWidgetProps {
    expectancy: number;
}

const ExpectancyWidget = ({expectancy}: ExpectancyWidgetProps) => {
    return (
        <div className="h-full w-full">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expectancy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", expectancy > 0 ? "text-foreground-green" : "text-foreground-red")}>{Currency(expectancy)}</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpectancyWidget;