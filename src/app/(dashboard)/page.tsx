"use client";
import { AdvancedCalendar } from "@/features/calendar/components/advanced-calendar/advanced-calendar";
import { useFilterStore } from "@/features/filter/hooks/use-filters";
import { PnlType, Unit } from "@/features/filter/types";
import AvgWinLossWidget from "@/features/widgets/components/avg-win-loss";
import { DailyPnlWidget } from "@/features/widgets/components/daily-pnl";
import { DailyPnlAccumulatedWidget } from "@/features/widgets/components/daily-pnl-accumulated";
import { FxScoreWidget } from "@/features/widgets/components/fx-score";
import PnlWidget from "@/features/widgets/components/pnl-widget";
import { ProfitFactorWidget } from "@/features/widgets/components/profit-factor-widget";
import { WinLossWidget } from "@/features/widgets/components/win-loss";
import { Trade, TradeResult } from "@prisma/client";
import { DailyStats, ProfitTarget, Stats } from "@/features/calendar/types";
import { StatsWidget } from "@/features/widgets/components/stats";
import { FormatUnit, getTradeResult } from "@/lib/helpers";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreHistoryWidget } from "@/features/widgets/components/score-history";
import { cn } from "@/lib/utils";
import DailyTradesView from "@/app/(dashboard)/_components/daily-trades-view";
import { useGetCalendarDataQuery } from "@/features/calendar/hooks/use-get-calendar-data-query";
import { useUIStore } from "@/hooks/use-ui-settings";
import { format } from "date-fns";

function calculateDailyPnLAndStats(trades: Trade[] | undefined, pnlType: PnlType, unit: Unit, risk: number = 1, percentageRisk: number = 1) {
    trades?.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const dailyStatsMap: Map<string, DailyStats> = new Map();
    let dailyStats: DailyStats[] = [];
    let overallStats = new Stats(unit, pnlType);

    if (!trades) return { overallStats, dailyStats };


    // Initialize accumulators for additional calculations
    let overallConsecutiveWins = 0;
    let overallConsecutiveLoss = 0;
    const dailyMaxConsecutiveMap: Record<string, { win: number, loss: number }> = {};

    trades.forEach((trade) => {
        const dateKey = trade.startDate.toDateString();

        // Populate the dailyStatsMap
        let dailyStats = dailyStatsMap.get(dateKey);
        if (!dailyStats) {
            dailyStats = new DailyStats(trade.startDate, unit, pnlType);
            dailyStats.days = 1;
            dailyStatsMap.set(dateKey, dailyStats);
        }
        // Todo Update create-trade function to implement new pnlType
        if (getTradeResult(trade, dailyStats.pnlType) === TradeResult.Win) {
            dailyStats.profitCurrency += dailyStats.pnlType === PnlType.Gross ? trade.pnlGross : trade.pnlNet;
            dailyStats.profitPercent += (dailyStats.pnlType === PnlType.Gross ? trade.pnlGross : trade.pnlNet) / ((trade.averagePrice * (trade.volume / 2)) * (percentageRisk / 100));
            dailyStats.profitR += (dailyStats.pnlType === PnlType.Gross ? trade.pnlGross : trade.pnlNet) / risk;
            dailyStats.winCount += 1;
            dailyStats.holdTimeWin += trade.executionTime ? trade.executionTime : 0;

            dailyMaxConsecutiveMap[dateKey] = dailyMaxConsecutiveMap[dateKey] || { win: 0, loss: 0 };
            dailyMaxConsecutiveMap[dateKey].win += 1;
            dailyMaxConsecutiveMap[dateKey].loss = 0;
            if (dailyMaxConsecutiveMap[dateKey].win > dailyStats.maxConsecutiveWins) {
                dailyStats.maxConsecutiveWins = dailyMaxConsecutiveMap[dateKey].win;
            }

            overallConsecutiveWins += 1;
            overallConsecutiveLoss = 0;
            if (overallConsecutiveWins > overallStats.maxConsecutiveWins) {
                overallStats.maxConsecutiveWins = overallConsecutiveWins;
            }


        } else if (getTradeResult(trade, dailyStats.pnlType) === TradeResult.Loss) {
            dailyStats.lossCurrency += dailyStats.pnlType === PnlType.Gross ? trade.pnlGross : trade.pnlNet;
            dailyStats.lossPercent += (dailyStats.pnlType === PnlType.Gross ? trade.pnlGross : trade.pnlNet) / ((trade.averagePrice * (trade.volume / 2)) * (percentageRisk / 100));
            dailyStats.lossR += (dailyStats.pnlType === PnlType.Gross ? trade.pnlGross : trade.pnlNet) / risk;
            dailyStats.lossCount += 1;
            dailyStats.holdTimeLoss += trade.executionTime ? trade.executionTime : 0;


            dailyMaxConsecutiveMap[dateKey] = dailyMaxConsecutiveMap[dateKey] || { win: 0, loss: 0 };
            dailyMaxConsecutiveMap[dateKey].loss += 1;
            dailyMaxConsecutiveMap[dateKey].win = 0;
            if (dailyMaxConsecutiveMap[dateKey].loss > dailyStats.maxConsecutiveLoss) {
                // Todo When you set like this it will set gross or net based on pnlType, but trade could be both gross and net loss.
                dailyStats.maxConsecutiveLoss = dailyMaxConsecutiveMap[dateKey].loss;
            }

            overallConsecutiveLoss += 1;
            overallConsecutiveWins = 0;
            if (overallConsecutiveLoss > overallStats.maxConsecutiveLoss) {
                overallStats.maxConsecutiveLoss = overallConsecutiveLoss;
            }

        } else {
            dailyStats.breakEvenCount += 1;
            dailyStats.holdTimeBreakEven += trade.executionTime ? trade.executionTime : 0;

            dailyMaxConsecutiveMap[dateKey] = dailyMaxConsecutiveMap[dateKey] || { win: 0, loss: 0 };
            dailyMaxConsecutiveMap[dateKey].win = 0;
            dailyMaxConsecutiveMap[dateKey].loss = 0;

            overallConsecutiveLoss = 0;
            overallConsecutiveWins = 0;
        }

        dailyStats._largestGrossGain = Math.max(dailyStats._largestGrossGain, trade.pnlGross);
        dailyStats._largestNetGain = Math.max(dailyStats._largestNetGain, trade.pnlNet);
        dailyStats._largestGrossLoss = Math.min(dailyStats._largestGrossLoss, trade.pnlGross);
        dailyStats._largestNetLoss = Math.min(dailyStats._largestNetLoss, trade.pnlNet);
        dailyStats._commissionsCurrency += trade.commission;
        dailyStats._commissionsPercent += trade.commission / ((trade.averagePrice * (trade.volume / 2)) * (percentageRisk / 100));
        dailyStats._commissionsR += trade.commission / risk;
        dailyStats._feesCurrency += trade.fees;
        dailyStats._feesPercent += trade.fees / ((trade.averagePrice * (trade.volume / 2)) * (percentageRisk / 100));
        dailyStats._feesR += trade.fees / risk;
        dailyStats.volume += trade.volume;

    });
    dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    dailyStats.forEach((dailyStat, index) => {

        // Fill the overall stats
        overallStats.profitCurrency += dailyStat.profitCurrency;
        overallStats.profitPercent += dailyStat.profitPercent;
        overallStats.profitR += dailyStat.profitR;
        overallStats.lossCurrency += dailyStat.lossCurrency;
        overallStats.lossPercent += dailyStat.lossPercent;
        overallStats.lossR += dailyStat.lossR;
        overallStats._commissionsCurrency += dailyStat._commissionsCurrency;
        overallStats._commissionsPercent += dailyStat._commissionsPercent;
        overallStats._commissionsR += dailyStat._commissionsR;
        overallStats._feesCurrency += dailyStat._feesCurrency;
        overallStats._feesPercent += dailyStat._feesPercent;
        overallStats._feesR += dailyStat._feesR;
        overallStats._largestNetGain = Math.max(overallStats._largestNetGain, dailyStat._largestNetGain);
        overallStats._largestGrossGain = Math.max(overallStats._largestGrossGain, dailyStat._largestGrossGain);
        overallStats._largestNetLoss = Math.min(overallStats._largestNetLoss, dailyStat._largestNetLoss);
        overallStats._largestGrossLoss = Math.min(overallStats._largestGrossLoss, dailyStat._largestGrossLoss);
        overallStats.winCount += dailyStat.winCount;
        overallStats.lossCount += dailyStat.lossCount;
        overallStats.breakEvenCount += dailyStat.breakEvenCount;
        overallStats.holdTimeWin += dailyStat.holdTimeWin;
        overallStats.holdTimeLoss += dailyStat.holdTimeLoss;
        overallStats.holdTimeBreakEven += dailyStat.holdTimeBreakEven;
        overallStats.volume += dailyStat.volume;
        overallStats.days += 1;

        // Fill Daily Stats

        const currentDailyPnLs = dailyStats.slice(0, index + 1).map(stat => ({
            date: stat.date,
            pnl: stat.pnl
        }));
        const currentCumulativePnLs = calculateCumulativeDailyPnl(currentDailyPnLs);

        // Assign scores to the current dailyStat
        dailyStat.scores.winRate = overallStats.winRate;
        dailyStat.scores.riskManagement = calculateSortinoRatio(currentDailyPnLs, 2).Sortino_Ratio_Scaled;
        dailyStat.scores.consistency = calculateKRatio(currentCumulativePnLs, 2).kRatioScaled;
        dailyStat.scores.profitFactor = (Math.min(overallStats.profitFactor, 2) / 2) * 100;
        dailyStat.scores.avgWinLoss = (Math.min(overallStats.avgWinLossRatio, 2) / 2) * 100;

        // Calculate overall performance score
        dailyStat.scores.overall = calculatePerformanceScore(
            dailyStat.scores.profitFactor,
            dailyStat.scores.winRate,
            dailyStat.scores.avgWinLoss,
            dailyStat.scores.riskManagement,
            dailyStat.scores.consistency,
            currentCumulativePnLs.length
        );
    });

    const dailyCumulativePnL = calculateCumulativeDailyPnl(dailyStats.map((dailyStat) => {
        return { date: dailyStat.date, pnl: dailyStat.pnl };
    }));
    overallStats.scores.winRate = overallStats.winRate;
    overallStats.scores.riskManagement = calculateSortinoRatio(dailyStats, 2).Sortino_Ratio_Scaled;
    overallStats.scores.consistency = calculateKRatio(dailyCumulativePnL, 2).kRatioScaled;
    overallStats.scores.profitFactor = Math.min(overallStats.profitFactor, 2) / 2 * 100;
    overallStats.scores.avgWinLoss = Math.min(overallStats.avgWinLossRatio, 2) / 2 * 100;
    overallStats.scores.overall = calculatePerformanceScore(overallStats.scores.profitFactor, overallStats.scores.winRate, overallStats.scores.avgWinLoss, overallStats.scores.riskManagement, overallStats.scores.consistency, dailyCumulativePnL.length);


    return {
        overallStats,
        dailyStats,
        dailyStatsMap,
        dailyCumulativePnL: calculateCumulativeDailyPnl(dailyStats.map((dailyStat) => {
            return { date: dailyStat.date, pnl: dailyStat.pnl };
        }))
    };
}

function calculateCumulativeDailyPnl(dailyPnl: { date: Date; pnl: number }[]) {
    const sortedDailyPnl = dailyPnl.sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulativeActualPnl = 0;  // Track only the modified cumulative PnL
    return sortedDailyPnl.map((day) => {
        cumulativeActualPnl += day.pnl;  // No need to track 'gain' separately
        return { date: day.date, pnl: cumulativeActualPnl };  // Only return cumulativePnl now
    });
}

const calculateSortinoRatio = (dailyPnLs: { date: Date, pnl: number }[], benchmarkValue: number, riskFreeRate = 0) => {
    const n = dailyPnLs.length;
    if (n < 3) return {
        Sortino_Ratio: 0,
        Sortino_Ratio_Scaled: 0
    };

    // Step 1: Calculate the average return (Rp)
    const meanReturn = dailyPnLs.reduce((a, b) => a + b.pnl, 0) / n;

    // Step 2: Calculate the excess return over the risk-free rate
    const excessReturn = meanReturn - riskFreeRate;

    // Step 3: Identify negative returns (downside)
    const negativeReturns = dailyPnLs.filter(pnl => pnl.pnl < riskFreeRate);

    if (negativeReturns.length === 0) {
        // No negative returns, downside deviation is zero
        // Sortino Ratio is theoretically infinite
        return {
            Sortino_Ratio: 2,
            Sortino_Ratio_Scaled: 100
        };
    }

    // Step 4: Calculate the downside deviation (σd)
    const squaredNegativeDiffs = negativeReturns.map(pnl => Math.pow(pnl.pnl - riskFreeRate, 2));
    const downsideVariance = squaredNegativeDiffs.reduce((a, b) => a + b, 0) / negativeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);

    // Step 5: Calculate the Sortino Ratio
    const sortinoRatio = excessReturn / downsideDeviation;

    const sortinoRatioScaled = Math.max(Math.min((sortinoRatio / benchmarkValue) * 100, 100), 0);

    return {
        Sortino_Ratio: sortinoRatio,
        Sortino_Ratio_Scaled: sortinoRatioScaled
    };

};

function calculatePerformanceScore(pfScore: number, winRatio: number, avgWlsScore: number, rms: number, cs: number, numberOfDays: number): number {

    const FPS =
        (numberOfDays < 3)
            ? 0.50 * pfScore + 0.25 * winRatio + 0.25 * avgWlsScore
            : 0.40 * pfScore + 0.10 * winRatio + 0.10 * avgWlsScore + 0.10 * rms + 0.30 * cs;

    return Math.max(0, Math.min(100, FPS));
}

function calculateKRatio(cumulativeDailyPnLs: { date: Date, pnl: number }[], benchmark: number = 2) {
    const n = cumulativeDailyPnLs.length;

    if (n < 3) {
        return {
            kRatio: 0,
            kRatioScaled: 0
        };
    }

    // Step 1: Prepare data for linear regression
    const xValues: number[] = []; // Time indices (1 to n)
    const yValues: number[] = cumulativeDailyPnLs.map(item => item.pnl);

    for (let i = 0; i < n; i++) {
        xValues.push(i + 1);
    }

    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

    // Step 2: Calculate the slope (beta) and intercept (alpha)
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
        const xDiff = xValues[i] - xMean;
        const yDiff = yValues[i] - yMean;
        numerator += xDiff * yDiff;
        denominator += xDiff * xDiff;
    }

    const beta = numerator / denominator;
    const alpha = yMean - beta * xMean;

    // Step 3: Calculate residuals and standard error of the slope
    let sumSquaredResiduals = 0;

    for (let i = 0; i < n; i++) {
        const predictedY = alpha + beta * xValues[i];
        const residual = yValues[i] - predictedY;
        sumSquaredResiduals += residual * residual;
    }

    const sSquared = sumSquaredResiduals / (n - 2);
    const standardErrorBeta = Math.sqrt(sSquared / denominator);

    // Step 4: Calculate k-ratio
    const kRatio = beta / standardErrorBeta;

    const kRatioScaled = Math.max(0, Math.min(100, (kRatio / benchmark) * 100));

    return {
        kRatio,
        kRatioScaled
    };
}

export default function Dashboard() {
    const { unit, pnlType, dateRange } = useFilterStore();
    const { dailyDrawerDate } = useUIStore();
    const { data: trades, isLoading } = useGetCalendarDataQuery(dateRange);
    //  const trades = [
    //      {pnlGross: 1000, pnlNet: 1000, averagePrice: 100, volume: 10, commission: -10, fees: -10, startDate: new Date(2024,10,1), executionTime: 10, result: TradeResult.Win},
    //      {pnlGross: -1000, pnlNet: -1000, averagePrice: 100, volume: 10, commission: -10, fees: -10, startDate: new Date(2024,10,4), executionTime: 10, result: TradeResult.Loss},
    //      {pnlGross: 500, pnlNet: 500, averagePrice: 100, volume: 10, commission: -10, fees: -10, startDate: new Date(2024,10,4), executionTime: 10, result: TradeResult.Win},
    //      {pnlGross: 210, pnlNet: 510, averagePrice: 100, volume: 10, commission: -10, fees: -10, startDate: new Date(2024,10,4), executionTime: 10, result: TradeResult.Win},
    //      {pnlGross: 1000, pnlNet: 1000, averagePrice: 100, volume: 10, commission: -10, fees: -10, startDate: new Date(2024,10,5), executionTime: 10, result: TradeResult.Win},
    //  ];
    //  const isLoading = false;

    const risk = 1000;
    const percentageRisk = 5;
    const avgWinLossRatioBenchmark = 2;
    const riskScoreBenchmark = 2;
    const consistencyScoreBenchmark = 2;
    const profitFactorBenchmark = 2;

    // Targets should also be in R, Currency or Percent
    const profitTargets: ProfitTarget = {
        dailyProfit: 5000, // {Dollar : 5000, Percentage : 10, RMultiple : 2}
        dailyMaxLoss: -5000,
        weekly: 500,
        monthly: 2000
    };
    const {
        overallStats,
        dailyStats,
        dailyStatsMap,
        dailyCumulativePnL
    } = calculateDailyPnLAndStats(trades, pnlType, unit, risk, percentageRisk);
    const getDailyTrades = (date: Date) => {
        return trades?.filter((trade) => trade.startDate.toDateString() === date.toDateString());
    }

    const kellyCriterion = overallStats.avgWinLossRatio
        ? (overallStats.winRate / 100) - ((1 - (overallStats.winRate / 100)) / overallStats.avgWinLossRatio)
        : 0;


    const testScores = dailyStats.map((daily, index) => {
        return (
            {
                date: daily.date,
                profitFactor: daily.scores.profitFactor,
                winRate: daily.scores.winRate,
                overall: daily.scores.overall,
                consistency: daily.scores.consistency,
                avgWinLoss: daily.scores.avgWinLoss,
                riskManagement: daily.scores.riskManagement
            });
    });


    return (
        <div className="pt-2">
            <div className="grid grid-cols-12 gap-2">
                <div className={"flex flex-row col-span-4 gap-2"}>
                    <PnlWidget pnl={overallStats.pnl} tradeCount={overallStats.tradeCount} unit={unit} />
                    <ProfitFactorWidget profitFactor={overallStats.profitFactor} lossFactor={overallStats.lossFactor} />
                </div>
                <div className={"flex flex-row col-span-8 gap-2"}>
                    <WinLossWidget win={overallStats.winCount} loss={overallStats.lossCount}
                                   breakeven={overallStats.breakEvenCount} winRate={overallStats.winRate}
                                   looseRate={overallStats.lossRate} breakevenRate={overallStats.breakEvenRate} />
                    <AvgWinLossWidget avgWin={overallStats.avgWin} avgLoss={overallStats.avgLoss} unit={unit} />
                </div>
                <div className={"flex flex-row col-span-12 gap-2"}>
                    <FxScoreWidget stats={overallStats} betPercentage={kellyCriterion} />
                    <DailyPnlAccumulatedWidget chartData={dailyCumulativePnL} unit={unit} />
                    <DailyPnlWidget chartData={dailyStats} unit={unit} />
                </div>
                <div className={"col-span-4"}>
                    <Card className="border w-full h-full">
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Hold Time</TableCell>
                                        <TableCell>
                                            <StatsWidget left={overallStats.avgHoldTimeWin}
                                                         right={overallStats.avgHoldTimeLoss}
                                                         mid={overallStats.avgHoldTimeBreakEven}
                                                         formatter={(v: any) => `${(v < 60 ? v.toFixed() + "s" : (v / 60).toFixed(0) + "m")}`} />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Largest Gain/Loss</TableCell>
                                        <TableCell>
                                            <StatsWidget left={overallStats.largestGain}
                                                         right={Math.abs(overallStats.largestLoss)}
                                                         formatter={(v: any) => `${FormatUnit(v, unit)}`} />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Max Consecutive
                                            Win/Loss</TableCell>
                                        <TableCell>
                                            <StatsWidget left={overallStats.maxConsecutiveWins}
                                                         right={overallStats.maxConsecutiveLoss} />
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Daily Gain/Loss</TableCell>
                                        <TableCell
                                            className={cn(overallStats.avgDailyGainLoss > 0 && "text-foreground-green", overallStats.avgDailyGainLoss < 0 && "text-foreground-red")}>{FormatUnit(overallStats.avgDailyGainLoss, unit)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Trade Gain/Loss</TableCell>
                                        <TableCell
                                            className={cn(overallStats.avgTradeGainLoss > 0 && "text-foreground-green", overallStats.avgTradeGainLoss < 0 && "text-foreground-red")}>{FormatUnit(overallStats.avgTradeGainLoss, unit)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Share Gain/Loss</TableCell>
                                        <TableCell
                                            className={cn(overallStats.avgPerShareGainLoss > 0 && "text-foreground-green", overallStats.avgPerShareGainLoss < 0 && "text-foreground-red")}>{FormatUnit(overallStats.avgPerShareGainLoss, unit)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Daily Volume</TableCell>
                                        <TableCell>{overallStats.avgDailyVolume}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Trade Volume</TableCell>
                                        <TableCell>{overallStats.avgTradeVolume.toFixed()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Commissions</TableCell>
                                        <TableCell>{FormatUnit(overallStats.commissions, unit)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Fees</TableCell>
                                        <TableCell>{FormatUnit(overallStats.fees, unit)}</TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>

                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-8">
                    <AdvancedCalendar dailyStats={dailyStats} unit={unit} isLoading={isLoading}
                                      profitTarget={profitTargets} />
                </div>
                <div className="col-span-4">
                    <ScoreHistoryWidget chartData={testScores} />
                </div>
                {
                    dailyDrawerDate &&
                    <DailyTradesView dailyStats={dailyStatsMap?.get(dailyDrawerDate.toDateString())}  trades={getDailyTrades(dailyDrawerDate)} unit={unit} />
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
            <TradeDetails trade={trades[0]} tradeId=""/>

                isLoading ? <div>Loading...</div> :
                    <DataTable columns={columns} data={trades}/>
            */}

        </div>
    );
}
