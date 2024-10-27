"use client";
import { AdvancedCalendar } from "@/features/calendar/components/advanced-calendar/advanced-calendar";
import { useFilterStore } from "@/features/filter/hooks/use-filters";
import { PnlType, Unit } from "@/features/filter/types";
import AvgWinLossWidget from "@/features/widgets/components/avg-win-loss";
import { DailyPnlWidget } from "@/features/widgets/components/daily-pnl";
import { DailyPnlAccumulatedWidget } from "@/features/widgets/components/daily-pnl-accumulated";
import ExpectancyWidget from "@/features/widgets/components/expectancy";
import { FxScoreWidget } from "@/features/widgets/components/fx-score";
import PnlWidget from "@/features/widgets/components/pnl-widget";
import { ProfitFactorWidget } from "@/features/widgets/components/profit-factor-widget";
import { WinLossWidget } from "@/features/widgets/components/win-loss";
import { TradeResult, TradeType } from "@prisma/client";

// Todo : in order to decide if a trade win or loose we need to factor in the commissions. Remove Trade Result enum from The trade and calculate based on selected calculation type
// enum for Gross and Net
function calculateDailyPnL(trades: any[], pnlType: PnlType): { date: Date; pnl: number, gain:number }[] {
    const dailyPnLMap = new Map<string, { date: Date; pnl: number, gain:number }>();

    trades.forEach((trade) => {
        const dateKey = trade.closeDate.toISOString().split("T")[0];

        const pnl = pnlType === PnlType.Gross ? trade.pnl : trade.pnl + trade.commissions;
        const gain = (pnl / (trade.avgPrice * trade.volume/ 2)) * 100;

        

        if (dailyPnLMap.has(dateKey)) {
            dailyPnLMap.get(dateKey)!.pnl += pnl;
            dailyPnLMap.get(dateKey)!.gain += gain;
        } else {
            dailyPnLMap.set(dateKey, { date: trade.closeDate, pnl: pnl, gain: gain });
        }
    });

    return Array.from(dailyPnLMap.values());
}

function calculateCumulativeDailyPnl(trades: any[], pnlType: PnlType): { date: Date; pnl: number, gain:number }[] {
    const dailyPnl = calculateDailyPnL(trades, pnlType);

    const sortedDailyPnl = dailyPnl.sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulativePnl = 0;
    let cumulativeGain = 0;
    const cumulativeDailyPnl = sortedDailyPnl.map((trade) => {
        cumulativePnl += trade.pnl;
        cumulativeGain += trade.gain;
        return { date: trade.date, pnl: cumulativePnl, gain: cumulativeGain };
    });

    return cumulativeDailyPnl;
}
// K-Ratio is a measure of consistency in trading. This indicates how consistent the trader is in making profits. A K-Ratio of 1 indicates that the trader is making profits consistently. A K-Ratio of less than 1 indicates that the trader is not making profits consistently.
function calculateKRatio(dailyCumulativePnl: { pnl: number, gain: number }[]): number {
    const n = dailyCumulativePnl.length;
    const meanIndex = (n - 1) / 2;
    const meanPnl = dailyCumulativePnl.reduce((sum, val) => sum + val.pnl, 0) / n;

    const numerator = dailyCumulativePnl.reduce((sum, val, i) => sum + (i - meanIndex) * (val.pnl - meanPnl), 0);
    const denominator = dailyCumulativePnl.reduce((sum, _, i) => sum + (i - meanIndex) ** 2, 0);
    const slope = numerator / denominator;

    const variance = dailyCumulativePnl.reduce((sum, val) => sum + (val.pnl - meanPnl) ** 2, 0) / n;
    const standardDeviation = Math.sqrt(variance);
    const kRatio = slope / standardDeviation;

    console.log("Slope:", slope);
    console.log("Standard Deviation:", standardDeviation);
    console.log("K-Ratio:", kRatio);
    return kRatio;
}

const trades = [
    { pnl: 10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 1), avgPrice: 1.2, volume: 100 },
    { pnl: -10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 2), avgPrice: 1.2, volume: 100 }, 
    { pnl: 10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 22), avgPrice: 1.2, volume: 100 },
    { pnl: 10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 23), avgPrice: 1.2, volume: 100 },
    { pnl: 10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 24), avgPrice: 1.2, volume: 100 },
    { pnl: 10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 25), avgPrice: 1.2, volume: 100 }, 
    { pnl: 10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 26), avgPrice: 1.2, volume: 100 }, 
    { pnl: 10, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 27), avgPrice: 1.2, volume: 100 }, 
];

export default function Dashboard() {
    const { unit, pnlType } = useFilterStore();

    const dailyPnl = calculateDailyPnL(trades, pnlType);
    const dailyPnlCumulative = calculateCumulativeDailyPnl(trades, pnlType);
    const consistencyScore = calculateKRatio(dailyPnlCumulative);

    const sumOfProfit = trades.reduce((acc, trade) => (trade.result === TradeResult.Win ? acc + trade.pnl : acc), 0);
    const sumOfLoss = trades.reduce((acc, trade) => (trade.result === TradeResult.Loss ? acc + trade.pnl : acc), 0);
    const winCount = trades.filter((trade) => trade.result === TradeResult.Win).length;
    const looseCount = trades.filter((trade) => trade.result === TradeResult.Loss).length;
    const breakevenCount = trades.filter((trade) => trade.result === TradeResult.BreakEven).length;

    const totalTradeCount = winCount + looseCount + breakevenCount;
    const avgWin = sumOfProfit / winCount;
    const avgLoss = -sumOfLoss / looseCount;
    const profitFactor = -sumOfProfit / sumOfLoss;
    const lossFactor = -sumOfLoss / sumOfProfit;
    const totalPnl = sumOfProfit + sumOfLoss;
    const winRate = (winCount / (winCount + looseCount + breakevenCount)) * 100;
    const looseRate = (looseCount / (winCount + looseCount + breakevenCount)) * 100;
    const breakevenRate = (breakevenCount / (winCount + looseCount + breakevenCount)) * 100;
    const expectancy = (avgWin * winRate - avgLoss * looseRate) / 100;

    return (
        <div className="pt-2">
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2 row-span-1">
                    <PnlWidget pnl={totalPnl} tradeCount={totalTradeCount} />
                </div>
                <div className="col-span-2 row-span-1">
                    <ExpectancyWidget expectancy={expectancy} />
                </div>
                <div className="col-span-2 row-span-1">
                    <ProfitFactorWidget profitFactor={profitFactor} lossFactor={lossFactor} />
                </div>
                <div className="col-span-3 row-span-1">
                    <WinLossWidget
                        win={winCount}
                        loss={looseCount}
                        breakeven={breakevenCount}
                        winRate={winRate}
                        looseRate={looseRate}
                        breakevenRate={breakevenRate}
                    />
                </div>
                <div className="col-span-3 row-span-1">
                    <AvgWinLossWidget avgWin={avgWin} avgLoss={avgLoss} />
                </div>
                <div className="col-span-4 col-start-1 row-span-1">
                    <FxScoreWidget />
                </div>
                <div className="col-span-4 row-span-1">
                    <DailyPnlAccumulatedWidget chartData={dailyPnlCumulative} />
                </div>
                <div className="col-span-4 row-span-1">
                    <DailyPnlWidget chartData={dailyPnl} />
                </div>

                <div className="col-span-12 col-start-1 row-span-3">
                    <AdvancedCalendar />
                </div>
                {
                    // Profit Factor
                    // Trade Win % : A widget that shows percentage of winning trades and number of trades
                    // Streaks : A widget that shows the longest winning and losing streaks for both trades and days
                    // Fx Score : A widget that shows the overall performance of the trader using a proprietary algorithm
                    // Using Win/Loss ratio, Profit Factor, Streaks, and other metrics
                    // Daily Cumulative P&L : A widget that shows the daily cumulative profit or loss
                }
            </div>
            {/*
            
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }, (_, i) => new Date(new Date().setMonth(new Date().getMonth() + i))).map((month, i) => (
                    <BasicCalendar
                        key={i}
                        month={month}
                        selected={[]}
                        modifiers={{
                            winningDay: trades
                                .filter((trade) => new Date(trade.startDate)?.getMonth() === month.getMonth() && trade.result === TradeResult.Win)
                                .map((trade) => new Date(trade.startDate)),
                            losingDay: trades
                                .filter((trade) => new Date(trade.startDate)?.getMonth() === month.getMonth() && trade.result === TradeResult.Loss)
                                .map((trade) => new Date(trade.startDate)),
                        }}
                        modifiersClassNames={{
                            winningDay: "bg-background-green text-foreground-green",
                            losingDay: "bg-background-red text-foreground-red",
                        }}
                    />
                ))}
            </div>
            
            
            
            */}
            {/*
          <DataTable columns={columns} data={trades} />
          <TradeDetails trade={trades[0]} tradeId="" />

            */}
        </div>
    );
}
