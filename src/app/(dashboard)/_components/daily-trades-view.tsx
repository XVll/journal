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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsWidget } from "@/features/widgets/components/stats";
import { FormatUnit } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Unit } from "@/features/filter/types";

const DailyTradesView = () => {
    const { dailyDrawerOpen, setDailyDrawerOpen, dailyDrawerDate } = useUIStore();
    const dailyStats = {
        pnl: 1000,
        winCount: 6,
        lossCount: 2,
        breakEvenCount: 2,
        profitFactor: 2,
        avgHoldTimeWin: 20,
        avgHoldTimeLoss: 10,
        avgHoldTimeBreakEven: 5,
        largestGain: 2000,
        largestLoss: 1100,
        maxConsecutiveWins: 9,
        maxConsecutiveLoss: 3,
        avgTradeGainLoss: 22,
        avgPerShareGainLoss: 10,
        avgDailyVolume: 3500,
        avgTradeVolume: 2000,
        totalCommission: 100,
        totalFees: 200,
        unit: Unit.Currency
    };
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
    /*
        * Total Trades, Win Rate, Total Volume, Commissions, Fees, PnL, A chart displays pnl for daily trades
        * A table displays the following columns: Start Time, Ticker, Side, ROI, R-Multiple, Tags, PnL, Exec Count,
     */
    return (<Drawer modal={true} open={dailyDrawerOpen} onClose={() => setDailyDrawerOpen(false)}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{dailyDrawerDate?.toLocaleString()}</DrawerTitle>
                    <DrawerDescription>{FormatUnit(dailyStats.pnl, dailyStats.unit)}</DrawerDescription>
                </DrawerHeader>
                <div className={"grid grid-cols-3"}>

                    <div className={"col-span-1"}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Trade Stats</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Total PnL</TableCell>
                                    <TableCell
                                        className={cn(dailyStats.pnl > 0 && "text-foreground-green", dailyStats.pnl < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.pnl, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Profit Factor</TableCell>
                                    <TableCell
                                        className={cn(dailyStats.profitFactor > 0 && "text-foreground-green", dailyStats.profitFactor < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.profitFactor, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Win Rate</TableCell>
                                    <TableCell className={"flex gap-4 justify-center items-center"}>
                                    <span
                                        className={cn("inline-flex", dailyStats.profitFactor > 0 && "text-foreground-green", dailyStats.profitFactor < 0 && "text-foreground-red")}>%{dailyStats.winCount / (dailyStats.winCount + dailyStats.breakEvenCount + dailyStats.lossCount) * 100}</span>
                                        <StatsWidget left={dailyStats.winCount} right={dailyStats.lossCount}
                                                     mid={dailyStats.breakEvenCount} />
                                    </TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Win/Loss</TableCell>
                                    <TableCell className={"flex gap-4 justify-center items-center"}>
                                    <span
                                        className={cn("inline-flex", dailyStats.profitFactor > 0 && "text-foreground-green", dailyStats.profitFactor < 0 && "text-foreground-red")}>%{dailyStats.winCount / (dailyStats.winCount + dailyStats.breakEvenCount + dailyStats.lossCount) * 100}</span>
                                        <StatsWidget left={dailyStats.winCount} right={dailyStats.lossCount}
                                                     mid={dailyStats.breakEvenCount} />
                                    </TableCell>
                                </TableRow>

                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Hold Time (Minute)</TableCell>
                                    <TableCell>
                                        <StatsWidget left={dailyStats.avgHoldTimeWin} right={dailyStats.avgHoldTimeLoss}
                                                     mid={dailyStats.avgHoldTimeBreakEven}
                                                     formatter={(v: any) => `${(v < 60 ? "<1" : (v / 60).toFixed(0))}`} />
                                    </TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Largest Gain/Loss</TableCell>
                                    <TableCell>
                                        <StatsWidget left={dailyStats.largestGain}
                                                     right={Math.abs(dailyStats.largestLoss)}
                                                     formatter={(v: any) => `${FormatUnit(v, dailyStats.unit)}`} />
                                    </TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Max Consecutive
                                        Win/Loss</TableCell>
                                    <TableCell>
                                        <StatsWidget left={dailyStats.maxConsecutiveWins}
                                                     right={dailyStats.maxConsecutiveLoss} />
                                    </TableCell>
                                </TableRow>

                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Per Trade Gain/Loss</TableCell>
                                    <TableCell
                                        className={cn(dailyStats.avgTradeGainLoss > 0 && "text-foreground-green", dailyStats.avgTradeGainLoss < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.avgTradeGainLoss, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Per Share Gain/Loss</TableCell>
                                    <TableCell
                                        className={cn(dailyStats.avgPerShareGainLoss > 0 && "text-foreground-green", dailyStats.avgPerShareGainLoss < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.avgPerShareGainLoss, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Daily Volume</TableCell>
                                    <TableCell>{dailyStats.avgDailyVolume}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Volume Per Trade</TableCell>
                                    <TableCell>{dailyStats.avgTradeVolume.toFixed()}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Commissions</TableCell>
                                    <TableCell>{FormatUnit(dailyStats.totalCommission, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Fees</TableCell>
                                    <TableCell>{FormatUnit(dailyStats.totalFees, dailyStats.unit)}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </div>
                    <div className={"col-span-2 flex"}>
                        <Separator orientation={"vertical"} />
                        <Table >
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Ticker</TableHead>
                                    <TableHead>Side</TableHead>
                                    <TableHead>ROI</TableHead>
                                    <TableHead>R-Multiple</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="text-right">PnL</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>INV001</TableCell>
                                    <TableCell>Paid</TableCell>
                                    <TableCell>Credit Card</TableCell>
                                    <TableCell>INV001</TableCell>
                                    <TableCell>Paid</TableCell>
                                    <TableCell>Credit Card</TableCell>
                                    <TableCell className="text-right">$250.00</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <DrawerFooter>
                    <div className={"flex justify-center items-center gap-2"}>
                        <DrawerClose asChild>
                            <Button variant={"secondary"} size={"sm"}>Close</Button>
                        </DrawerClose>

                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
        ;
};

export default DailyTradesView;