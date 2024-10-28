"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormatUnit } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {Unit} from "@/features/filter/types";
interface ExpectancyWidgetProps {
    expectancy: number;
    unit: Unit;
}

const ExpectancyWidget = ({expectancy, unit}: ExpectancyWidgetProps) => {
    return (
        <div className="h-full w-full">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expectancy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", expectancy > 0 && "text-foreground-green", expectancy < 0 && "text-foreground-red")}>{FormatUnit(expectancy, unit) || 0}</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpectancyWidget;