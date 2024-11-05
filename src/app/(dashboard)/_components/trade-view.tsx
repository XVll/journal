"use client";
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
import { useGetTradeQuery } from "@/features/calendar/hooks/use-get-trade-query";

/*
model Execution {
  date          DateTime
  ticker        String
  action        TradeAction
  quantity      Int
  amount        Float
  tradePosition Int
  price         Float
  avgPrice      Float
  scalingAction ScalingAction
  pnl           Float
  fees          Float
  type          TradeType
  commission    Float
  addLiquidity  Boolean
}
* */
const TradeView = () => {
    const { tradeDrawerOpen, setTradeDrawerOpen, tradeId } = useUIStore();

    const { data } = useGetTradeQuery(tradeId);

    if (!data) {
        return null;
    }

    /*
model Trade {
  startDate     DateTime
  direction     TradeDirection
  type          TradeType
  status        TradeStatus
  volume        Int
  openPosition  Int
  averagePrice  Float
  commission    Float
  fees          Float
  pnlNet        Float
  pnlGross      Float
  resultNet     TradeResult?
  resultGross   TradeResult?
  endDate       DateTime?
  executionTime Int?
  notes         String?
  tags          String[]
}
    * */
    return (
        <Drawer modal={true} open={tradeDrawerOpen} onClose={() => setTradeDrawerOpen(false)} fadeFromIndex={0}
                snapPoints={[1.0, 1.0, 1.0, 1.0]}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Trade</DrawerTitle>
                    <DrawerDescription>{tradeId}</DrawerDescription>
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
                                    <TableCell className={"w-0 whitespace-nowrap"}>Net PnL</TableCell>
                                    <TableCell className={cn(data.pnlNet > 0 && "text-foreground-green", data.pnlNet < 0 && "text-foreground-red")}>{data.pnlNet.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell className={"w-0 whitespace-nowrap"}>Gross PnL</TableCell>
                                    <TableCell className={cn(data.pnlGross > 0 && "text-foreground-green", data.pnlGross < 0 && "text-foreground-red")}>{data.pnlGross.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell>Account</TableCell>
                                    <TableCell>{data.account}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell>Symbol</TableCell>
                                    <TableCell>{data.ticker}</TableCell>
                                </TableRow>
                                <TableRow className={"border-none"}>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>{data.quantity}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div className={"col-span-2 flex"}>
                        <Separator orientation={"vertical"}/>
                        {
                            data.executions.length > 0 && (
                                <Table>
                                    <TableCaption>Executions</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Scaling Action</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>PnL</TableHead>
                                            <TableHead>Avg Price</TableHead>
                                            <TableHead>Trade Position</TableHead>
                                            <TableHead>Fees</TableHead>
                                            <TableHead>Commission</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Add Liquidity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {
                                            data.executions.map((execution, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{execution.date}</TableCell>
                                                    <TableCell>{execution.action}</TableCell>
                                                    <TableCell>{execution.scalingAction}</TableCell>
                                                    <TableCell>{execution.quantity}</TableCell>
                                                    <TableCell>{Currency(execution.price)}</TableCell>
                                                    <TableCell>{Currency(execution.pnl)}</TableCell>
                                                    <TableCell>{Currency(execution.avgPrice)}</TableCell>
                                                    <TableCell>{execution.tradePosition}</TableCell>
                                                    <TableCell>{Currency(execution.fees)}</TableCell>
                                                    <TableCell>{Currency(execution.commission)}</TableCell>
                                                    <TableCell>{Currency(execution.amount)}</TableCell>
                                                    <TableCell>{execution.addLiquidity ? "+" : "-"}</TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            )
                        }
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

export default TradeView;