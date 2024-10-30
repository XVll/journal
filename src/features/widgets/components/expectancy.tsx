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
            <Card className="w-full px-4 py-2">
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-1">
                    <CardTitle className="text-sm font-medium">Expectancy</CardTitle>
                </CardHeader>
                <CardContent className={"p-0"}>
                    <div className={cn("text-2xl font-bold", expectancy > 0 && "text-foreground-green", expectancy < 0 && "text-foreground-red")}>{FormatUnit(expectancy, unit) || 0}</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpectancyWidget;