"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/lib/helpers";
import { cn } from "@/lib/utils";
interface PnlWidgetProps {
    pnl: number;
    tradeCount: number;
}

const PnlWidget = ({ pnl, tradeCount }: PnlWidgetProps) => {
    return (
        <div className="h-full w-full">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", pnl > 0 ? "text-foreground-green" : "text-foreground-red")}>{Currency(pnl)} <span className="text-xs text-muted-foreground">from {tradeCount} trades</span></div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PnlWidget;