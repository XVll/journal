"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormatUnit } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Unit } from "@/features/filter/types";

interface PnlWidgetProps {
    pnl: number;
    tradeCount: number;
    unit: Unit;
}

const PnlWidget = ({ pnl, tradeCount, unit }: PnlWidgetProps) => {
    return (
        <div className="h-full w-full">
            <Card className="w-full px-4 py-2">
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-1">
                    <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
                </CardHeader>
                <CardContent className={"p-0"}>
                    <div
                        className={cn("text-2xl font-bold", pnl > 0 && "text-foreground-green", pnl < 0 && "text-foreground-red")}>{FormatUnit(pnl, unit)}
                        <span className="text-xs text-muted-foreground"> {tradeCount} Trade</span></div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PnlWidget;