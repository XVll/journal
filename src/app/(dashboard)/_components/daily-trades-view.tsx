import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerDescription, DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/hooks/use-ui-settings";
import { Trade, TradeResult } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { StatsWidget } from "@/features/widgets/components/stats";
import { FormatUnit } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Unit } from "@/features/filter/types";

const DailyTradesView = () => {
    const { dailyDrawerOpen, setDailyDrawerOpen, dailyDrawerDate } = useUIStore();
    const dailyStats = {
        avgHoldTimeWin: 0,
        avgHoldTimeLoss: 0,
        avgHoldTimeBreakEven: 0,
        largestGain: 0,
        largestLoss: 0,
        maxConsecutiveWins: 0,
        maxConsecutiveLoss: 0,
        avgTradeGainLoss: 0,
        avgPerShareGainLoss: 0,
        avgDailyVolume: 0,
        avgTradeVolume: 0,
        totalCommission: 0,
        totalFees: 0,
        unit: Unit.Currency
    }
    const dailyTrades: Trade[] = [
        {
            id: "1",
            account: "1",
            startDate: new Date(),
            ticker: "AAPL",
            direction: "Long",
            type: "Stock",
            status: "Open",
            volume: 100,
            openPosition: 100,
            averagePrice: 100,
            commission: -10,
            fees: -20,
            pnl: 300,
            endDate: new Date(),
            result: TradeResult.Win,
            executionTime: 0,
            notes: "",
            tags: ["tag1", "tag2"]
        }
    ];
    return (
        <Drawer modal={true} open={dailyDrawerOpen} onClose={() => setDailyDrawerOpen(false)}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{dailyDrawerDate?.toLocaleString()}</DrawerTitle>
                    <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <div className={"flex flex-row"}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Hold Time (Minute)</TableCell>
                                <TableCell>
                                    <StatsWidget left={dailyStats.avgHoldTimeWin} right={dailyStats.avgHoldTimeLoss} mid={dailyStats.avgHoldTimeBreakEven} formatter={(v: any) => `${(v < 60 ? "<1" : (v / 60).toFixed(0))}`} />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Largest Gain/Loss</TableCell>
                                <TableCell>
                                    <StatsWidget left={dailyStats.largestGain} right={Math.abs(dailyStats.largestLoss)} formatter={(v: any) => `${FormatUnit(v, dailyStats.unit)}`} />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Max Consecutive
                                    Win/Loss</TableCell>
                                <TableCell>
                                    <StatsWidget left={dailyStats.maxConsecutiveWins} right={dailyStats.maxConsecutiveLoss} />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Avg Per Trade Gain/Loss</TableCell>
                                <TableCell
                                    className={cn(dailyStats.avgTradeGainLoss > 0 && "text-foreground-green", dailyStats.avgTradeGainLoss < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.avgTradeGainLoss, dailyStats.unit)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Avg Per Share Gain/Loss</TableCell>
                                <TableCell
                                    className={cn(dailyStats.avgPerShareGainLoss > 0 && "text-foreground-green", dailyStats.avgPerShareGainLoss < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.avgPerShareGainLoss, dailyStats.unit)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Avg Daily Volume</TableCell>
                                <TableCell>{dailyStats.avgDailyVolume}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Avg Volume Per Trade</TableCell>
                                <TableCell>{dailyStats.avgTradeVolume.toFixed()}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Commissions</TableCell>
                                <TableCell>{FormatUnit(dailyStats.totalCommission, dailyStats.unit)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={"w-0 whitespace-nowrap"}>Fees</TableCell>
                                <TableCell>{FormatUnit(dailyStats.totalFees, dailyStats.unit)}</TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>
                </div>
                <DrawerFooter>
                    <div className={"flex justify-center items-center gap-2"}>
                        <Button size={"sm"}>Details</Button>
                        <DrawerClose asChild>
                            <Button variant={"secondary"} size={"sm"}>Cancel</Button>
                        </DrawerClose>

                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
        ;
};

export default DailyTradesView;