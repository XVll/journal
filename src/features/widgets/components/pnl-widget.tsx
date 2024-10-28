"use client"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {FormatUnit} from "@/lib/helpers";
import {cn} from "@/lib/utils";
import {Unit} from "@/features/filter/types";

interface PnlWidgetProps {
    pnl: number;
    tradeCount: number;
    unit: Unit;
}

const PnlWidget = ({pnl, tradeCount, unit}: PnlWidgetProps) => {
    return (
        <div className="h-full w-full">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className={cn("text-2xl font-bold", pnl > 0 && "text-foreground-green", pnl < 0 && "text-foreground-red",)}>{FormatUnit(pnl, unit)}
                        <span className="text-xs text-muted-foreground"> {tradeCount} trades</span></div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PnlWidget;