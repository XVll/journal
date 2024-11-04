import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerDescription, DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/hooks/use-ui-settings";
import { Trade, TradeResult } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsWidget } from "@/features/widgets/components/stats";
import { Currency, FormatUnit } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { PnlType, Unit } from "@/features/filter/types";
import { DailyStats } from "@/features/calendar/types";

interface DailyTradesViewProps {
    dailyStats?: DailyStats;
    trades?: Trade[];
}

const DailyTradesView = ({ dailyStats, trades }: DailyTradesViewProps) => {
    const { dailyDrawerOpen, setDailyDrawerOpen, dailyDrawerDate } = useUIStore();
    if (!dailyStats) return null;
    console.log(dailyStats);
    return (
        <Drawer modal={true} open={dailyDrawerOpen} onClose={() => setDailyDrawerOpen(false)} fadeFromIndex={0}
                snapPoints={[1.0, 1.0, 1.0, 1.0]}>
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
                                        className={cn(dailyStats.profitFactor > 0 && "text-foreground-green", dailyStats.profitFactor < 0 && "text-foreground-red")}>{dailyStats.profitFactor.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Win Rate</TableCell>
                                    <TableCell className={"flex gap-4 justify-center items-center"}>
                                        <span
                                            className={cn("inline-flex w-10", dailyStats.winRate >= 50 && "text-foreground-green", dailyStats.profitFactor < 50 && "text-foreground-red")}>%{(dailyStats.winRate).toFixed(2)}</span>
                                        <StatsWidget left={dailyStats.winCount} right={dailyStats.lossCount}
                                                     mid={dailyStats.breakEvenCount} />
                                    </TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Win/Loss</TableCell>
                                    <TableCell className={"flex gap-4 justify-center items-center"}>
                                        <span
                                            className={cn("inline-flex w-10", dailyStats.avgWinLossRatio > 1 && "text-foreground-green", dailyStats.avgWinLossRatio < 1 && "text-foreground-red")}>{(dailyStats.avgWinLossRatio.toFixed(2))}</span>
                                        <StatsWidget left={dailyStats.avgWin} right={Math.abs(dailyStats.avgLoss)}
                                                     formatter={(v: any) => `${FormatUnit(v, dailyStats.unit)}`} />
                                    </TableCell>
                                </TableRow>

                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Hold Time</TableCell>
                                    <TableCell>
                                        <StatsWidget left={dailyStats.avgHoldTimeWin}
                                                     right={dailyStats.avgHoldTimeLoss}
                                                     mid={dailyStats.avgHoldTimeBreakEven}
                                                     formatter={(v: any) => `${(v < 60 ? v.toFixed() + "s" : (v / 60).toFixed(0) + "m")}`} />
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
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Trade Gain/Loss</TableCell>
                                    <TableCell
                                        className={cn(dailyStats.avgTradeGainLoss > 0 && "text-foreground-green", dailyStats.avgTradeGainLoss < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.avgTradeGainLoss, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Share Gain/Loss</TableCell>
                                    <TableCell
                                        className={cn(dailyStats.avgPerShareGainLoss > 0 && "text-foreground-green", dailyStats.avgPerShareGainLoss < 0 && "text-foreground-red")}>{FormatUnit(dailyStats.avgPerShareGainLoss, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Daily Volume</TableCell>
                                    <TableCell>{dailyStats.avgDailyVolume}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Avg Trade Volume</TableCell>
                                    <TableCell>{dailyStats.avgTradeVolume?.toFixed()}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Commissions</TableCell>
                                    <TableCell>{FormatUnit(dailyStats.commissions, dailyStats.unit)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Fees</TableCell>
                                    <TableCell>{FormatUnit(dailyStats.fees, dailyStats.unit)}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </div>
                    <div className={"col-span-2 flex"}>
                        <Separator orientation={"vertical"} />
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Ticker</TableHead>
                                    <TableHead>Side</TableHead>
                                    <TableHead className={"text-right"}>PnL</TableHead>
                                    <TableHead className={"text-right"}>ROI</TableHead>
                                    <TableHead className={"text-right"}>Volume</TableHead>
                                    <TableHead className={"text-right"}>Exec Count</TableHead>
                                    <TableHead className={"text-right"}>Tags</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trades?.map((trade: Trade) => (
                                    <TableRow key={trade.id}>
                                        <TableCell>{trade.startDate.toLocaleTimeString()}</TableCell>
                                        <TableCell>{trade.ticker}</TableCell>
                                        <TableCell>{trade.direction}</TableCell>
                                        <TableCell className={cn("text-right",
                                            trade.pnlNet > 0 && "text-foreground-green",
                                            trade.pnlNet < 0 && "text-foreground-red"
                                        )}>{Currency(dailyStats.pnlType === PnlType.Net ? trade.pnlNet.toFixed(2) : trade.pnlGross.toFixed(2))}</TableCell>
                                        <TableCell
                                            className={cn("text-right", trade.pnlNet > 0 && "text-foreground-green", trade.pnlNet < 0 && "text-foreground-red")}
                                        >% {((dailyStats.pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross) / ((trade.volume / 2) * trade.averagePrice) * 100).toFixed(2)}</TableCell>
                                        <TableCell className={"text-right"}>{trade.volume}</TableCell>
                                        <TableCell className={"text-right"}>Execs</TableCell>
                                        <TableCell className={"text-right"}>{
                                            trade.tags?.map((tag) => (
                                                <span key={tag}
                                                      className={"text-xs bg-foreground text-background rounded-md px-1"}>{tag}</span>
                                            ))
                                        }</TableCell>
                                    </TableRow>
                                ))}
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