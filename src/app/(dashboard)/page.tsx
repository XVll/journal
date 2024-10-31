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
import { Trade, TradeResult } from "@prisma/client";
import { useGetCalendarDataQuery } from "@/features/calendar/hooks/use-get-calendar-data-query";
import { DailyStats, ProfitTarget } from "@/features/calendar/types";
import { StatsWidget } from "@/features/widgets/components/stats";
import { FormatUnit } from "@/lib/helpers";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreHistoryWidget } from "@/features/widgets/components/score-history";
import { cn } from "@/lib/utils";

function calculateDailyPnLAndStats(trades: Trade[] | undefined, pnlType: PnlType, unit: Unit, risk: number = 1, percentageRisk: number = 1) {
    trades?.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const result = {
        dailyStats: [] as DailyStats[],
        sumOfProfit: 0,
        sumOfLoss: 0,
        winCount: 0,
        lossCount: 0,
        breakEvenCount: 0,
        largestGain: 0,
        largestLoss: 0,
        totalCommission: 0,
        totalFees: 0,
        maxConsecutiveWins: 0,
        maxConsecutiveLoss: 0,
        totalHoldTimeWin: 0,
        totalHoldTimeLoss: 0,
        totalHoldTimeBreakEven: 0,
        totalVolume: 0
    };

    if (!trades) return result;
    const dailyStatsMap: Record<string, DailyStats> = {};

    // Initialize accumulators for additional calculations
    let currentConsecutiveWins = 0;
    let currentConsecutiveLoss = 0;

    trades.forEach((trade) => {
        const dateKey = trade.startDate.toISOString().split("T")[0];

        // Calculate pnl based on pnlType
        let pnl = pnlType === PnlType.Gross
            ? trade.pnl
            : trade.pnl + trade.commission + trade.fees;
        let commission = trade.commission;
        let fee = trade.fees;


        if (unit === Unit.Percent) {
            // Percent gain
            pnl = pnl / ((trade.averagePrice * (trade.volume / 2)) * (percentageRisk / 100));
            commission = commission / ((trade.averagePrice * (trade.volume / 2)) * (percentageRisk / 100));
            fee = fee / ((trade.averagePrice * (trade.volume / 2)) * (percentageRisk / 100));
        } else if (unit === Unit.RMultiple) {
            pnl = pnl / risk;
            commission = commission / risk;
            fee = fee / risk;
        }

        // Populate the dailyStatsMap
        let dailyStats = dailyStatsMap[dateKey];
        if (dailyStats) {
            dailyStats.pnl += pnl;
            dailyStats.trades += 1;
            dailyStats.result = dailyStats.pnl > 0 ? TradeResult.Win : dailyStats.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;


        } else {
            dailyStatsMap[dateKey] = {
                date: trade.startDate,
                pnl: pnl,
                trades: 1,
                result: pnl > 0 ? TradeResult.Win : pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven,
                scores: {
                    overall: 0,
                    avgWinLoss: 0,
                    winRate: 0,
                    profitFactor: 0,
                    consistency: 0,
                    riskManagement: 0
                }
            };
            dailyStats = dailyStatsMap[dateKey];
        }


        // Update accumulators based on trade result
        if (trade.result === TradeResult.Win) {
            result.sumOfProfit += pnl;
            result.winCount += 1;
            currentConsecutiveWins += 1;
            currentConsecutiveLoss = 0;
            if (currentConsecutiveWins > result.maxConsecutiveWins) {
                result.maxConsecutiveWins = currentConsecutiveWins;
            }
            result.totalHoldTimeWin += trade.executionTime ? trade.executionTime : 0;

        } else if (trade.result === TradeResult.Loss) {
            result.sumOfLoss += pnl;
            result.lossCount += 1;
            currentConsecutiveLoss += 1;
            currentConsecutiveWins = 0;
            if (currentConsecutiveLoss > result.maxConsecutiveLoss) {
                result.maxConsecutiveLoss = currentConsecutiveLoss;
            }
            result.totalHoldTimeLoss += trade.executionTime ? trade.executionTime : 0;
        } else if (trade.result === TradeResult.BreakEven) {
            result.breakEvenCount += 1;
            currentConsecutiveLoss = 0;
            currentConsecutiveWins = 0;
            result.totalHoldTimeBreakEven += trade.executionTime ? trade.executionTime : 0;
        }

        if (pnl > result.largestGain) result.largestGain = pnl;
        if (pnl < result.largestLoss) result.largestLoss = pnl;
        result.totalCommission += commission;
        result.totalFees += fee;
        result.totalVolume += trade.volume;


        // Move this to a separate function this calculates for each trade; even though the result is correct, this is expensive.
        // Keep totalProfit, totalLoss, winCount, lossCount, breakEvenCount on dailyStatsMap
        const dailyPnlCumulative = calculateCumulativeDailyPnl(Array.from(Object.values(dailyStatsMap)));
        const riskScore = calculateSortinoRatio(dailyPnlCumulative, 2);
        const consistencyScore = calculateKRatioFromCumulativePnL(dailyPnlCumulative, 2);
        dailyStats.scores.winRate = result.winCount ? (result.winCount / (result.winCount + result.lossCount + result.breakEvenCount)) * 100 : 0;
        const profitFactor = result.sumOfLoss ? result.sumOfProfit / Math.abs(result.sumOfLoss) : result.sumOfProfit;
        const avgWinLoss = (result.sumOfLoss && result.lossCount && result.sumOfProfit && result.winCount)
            ? (result.sumOfProfit / result.winCount) / (result.sumOfLoss / result.lossCount)
            : (result.winCount ? result.sumOfProfit / result.winCount : 0);
        dailyStats.scores.riskManagement = riskScore.Sortino_Ratio_Scaled;
        dailyStats.scores.consistency = consistencyScore.K_Ratio_Scaled;
        dailyStats.scores.profitFactor = Math.min(profitFactor, 2) / 2 * 100;
        dailyStats.scores.avgWinLoss = Math.min(Math.abs(avgWinLoss), 2) / 2 * 100;
        dailyStats.scores.overall = calculatePerformanceScore(dailyStats.scores.profitFactor, dailyStats.scores.winRate, dailyStats.scores.avgWinLoss, riskScore.Sortino_Ratio_Scaled, consistencyScore.K_Ratio_Scaled);

    });

    return {
        ...result,
        dailyStats: Array.from(Object.values(dailyStatsMap))
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
    if (n === 0) return {
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

function calculatePerformanceScore(pfScore: number, winRatio: number, avgWlsScore: number, rms: number, cs: number): number {


    const FPS = 0.40 * pfScore + 0.10 * winRatio + 0.10 * avgWlsScore + 0.10 * rms + 0.30 * cs;

    return Math.max(0, Math.min(100, FPS));
}

function calculateKRatioFromCumulativePnL(dailyPnLs: { date: Date; pnl: number }[], benchmark: number = 2) {
    const n = dailyPnLs.length;
    if (n === 0) {
        return {
            K_Ratio: 0,
            K_Ratio_Scaled: 0
        };
    }

    // The dailyPnLs array is assumed to be sorted by date and contains cumulative PnL values.
    // Extract cumulative PnL values
    const cumulativePnL: number[] = dailyPnLs.map(item => item.pnl);

    // Step 1: Shift cumulative PnL to ensure all values are positive
    const minCumulativePnL = Math.min(...cumulativePnL);
    const shiftAmount = minCumulativePnL <= 0 ? -minCumulativePnL + 1 : 0;

    const shiftedCumulativePnL = cumulativePnL.map(value => value + shiftAmount);

    // Step 2: Compute the logarithm of the shifted cumulative PnL
    const logCumulativePnL: number[] = shiftedCumulativePnL.map(value => Math.log(value));

    // Prepare the time periods array
    const timePeriods: number[] = Array.from({ length: n }, (_, i) => i + 1);

    // Calculate means of timePeriods and logCumulativePnL
    const meanTime = timePeriods.reduce((sum, val) => sum + val, 0) / n;
    const meanLogCumulativePnL = logCumulativePnL.reduce((sum, val) => sum + val, 0) / n;

    // Step 3: Perform linear regression
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
        const timeDiff = timePeriods[i] - meanTime;
        const logPnLDiff = logCumulativePnL[i] - meanLogCumulativePnL;
        numerator += timeDiff * logPnLDiff;
        denominator += timeDiff ** 2;
    }

    if (denominator === 0) {
        // throw new Error("Variance of time periods is zero; cannot perform linear regression.");
        return {
            K_Ratio: 0,
            K_Ratio_Scaled: 0
        };
    }

    const slope = numerator / denominator;
    const intercept = meanLogCumulativePnL - slope * meanTime;

    // Step 4: Calculate the standard error of the regression
    let sumSquaredResiduals = 0;
    for (let i = 0; i < n; i++) {
        const predictedLogPnL = slope * timePeriods[i] + intercept;
        const residual = logCumulativePnL[i] - predictedLogPnL;
        sumSquaredResiduals += residual ** 2;
    }

    const degreesOfFreedom = n - 2;
    if (degreesOfFreedom <= 0) {
        // throw new Error("Not enough data points to calculate standard error.");
        return {
            K_Ratio: 0,
            K_Ratio_Scaled: 0
        };
    }

    const standardError = Math.sqrt(sumSquaredResiduals / degreesOfFreedom);

    // Step 5: Compute the K-Ratio
    const standardErrorOfSlope = standardError / Math.sqrt(denominator);
    if (standardErrorOfSlope === 0) {
        throw new Error("Standard error of the slope is zero; cannot calculate K-Ratio.");
    }

    const kRatio = slope / standardErrorOfSlope;
    const kRatioScaled = Math.max(0, Math.min(100, kRatio / benchmark * 100));

    return {
        K_Ratio: kRatio,
        K_Ratio_Scaled: kRatioScaled
    };
}

export default function Dashboard() {
    const { unit, pnlType } = useFilterStore();
     const { data: trades, isLoading } = useGetCalendarDataQuery(new Date(2024, 9, 1));
    // const trades = [
    //     { pnl: -5, commission: 0, fees: 0, result: TradeResult.Loss, startDate: new Date(2024, 9, 1), averagePrice: 1.2, volume: 100 },
    //     { pnl: -4, commission: 0, fees: 0, result: TradeResult.Loss, startDate: new Date(2024, 9, 3), averagePrice: 1.2, volume: 100 },
    //     { pnl: -3, commission: 0, fees: 0, result: TradeResult.Loss, startDate: new Date(2024, 9, 4), averagePrice: 1.2, volume: 100 },
    //     { pnl: 2, commission: 0, fees: 0, result: TradeResult.Win, startDate: new Date(2024, 9, 7), averagePrice: 1.2, volume: 100 },
    //     { pnl: 3, commission: 0, fees: 0, result: TradeResult.Win, startDate: new Date(2024, 9, 8), averagePrice: 1.2, volume: 100 },
    //     { pnl: 4, commission: 0, fees: 0, result: TradeResult.Win, startDate: new Date(2024, 9, 9), averagePrice: 1.2, volume: 100 },
    //     { pnl: 5, commission: 0, fees: 0, result: TradeResult.Win, startDate: new Date(2024, 9, 10), averagePrice: 1.2, volume: 100 }
    // ];
    // const isLoading = false;

    const balance = 25000;
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
        dailyStats,
        sumOfProfit,
        sumOfLoss,
        winCount,
        lossCount,
        breakEvenCount,
        largestGain,
        largestLoss,
        totalCommission,
        totalFees,
        maxConsecutiveWins,
        maxConsecutiveLoss,
        totalHoldTimeWin,
        totalHoldTimeLoss,
        totalHoldTimeBreakEven,
        totalVolume
    } = calculateDailyPnLAndStats(trades, pnlType, unit, risk, percentageRisk);
    const dailyPnlCumulative = calculateCumulativeDailyPnl(dailyStats);
    const riskScore = calculateSortinoRatio(dailyStats, riskScoreBenchmark);
    const consistencyScore = calculateKRatioFromCumulativePnL(dailyPnlCumulative, consistencyScoreBenchmark);


    const totalTradeCount = winCount + lossCount + breakEvenCount;
    const avgWin = winCount ? sumOfProfit / winCount : 0;
    const avgLoss = lossCount ? sumOfLoss / lossCount : 0;
    const avgWinLossRatio = Math.abs(avgLoss ? avgWin / avgLoss : avgWin);
    const profitFactor = sumOfLoss ? sumOfProfit / Math.abs(sumOfLoss) : sumOfProfit;
    const lossFactor = sumOfProfit ? sumOfLoss / Math.abs(sumOfProfit) : sumOfLoss;
    const totalPnl = sumOfProfit + sumOfLoss;
    const winRate = winCount ? (winCount / (winCount + lossCount + breakEvenCount)) * 100 : 0;
    const lossRate = lossCount ? (lossCount / (winCount + lossCount + breakEvenCount)) * 100 : 0;
    const breakEvenRate = breakEvenCount ? (breakEvenCount / (winCount + lossCount + breakEvenCount)) * 100 : 0;
    const avgPerShareGainLoss = totalVolume ? totalPnl / (totalVolume / 2) : 0;
    const avgTradeGainLoss = totalTradeCount ? totalPnl / totalTradeCount : 0;
    const avgHoldTimeWin = winCount ? totalHoldTimeWin / winCount : 0;
    const avgHoldTimeLoss = lossCount ? totalHoldTimeLoss / lossCount : 0;
    const avgHoldTimeBreakEven = breakEvenCount ? totalHoldTimeBreakEven / breakEvenCount : 0;
    const avgDailyVolume = dailyStats.length ? totalVolume / dailyStats.length : 0;
    const avgTradeVolume = totalVolume / totalTradeCount;

    const kellyCriterion = avgWinLossRatio ? (winRate / 100) - ((1 - (winRate / 100) / avgWinLossRatio)) : 0;
    const suggestedShareSize = kellyCriterion > 0 ? balance * kellyCriterion / 100 : 0;

    const profitFactorScaled = Math.min(profitFactor, profitFactorBenchmark) / profitFactorBenchmark * 100;
    const avgWinLossRatioScaled = Math.min(avgWinLossRatio, avgWinLossRatioBenchmark) / avgWinLossRatioBenchmark * 100;


    const performanceScore = calculatePerformanceScore(profitFactorScaled, winRate, avgWinLossRatioScaled, riskScore.Sortino_Ratio_Scaled, consistencyScore.K_Ratio_Scaled);
    const testScores = dailyStats.map((daily) => {
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
    const scoreData = [
        {
            factor: "Win Rate",
            value: winRate,
            displayValue: `${winRate.toFixed(2)}%`
        },
        {
            factor: "Profit Factor",
            value: profitFactorScaled,
            displayValue: `${profitFactorScaled.toFixed(2)}%`
        },
        {
            factor: "Risk Management",
            value: riskScore.Sortino_Ratio_Scaled,
            displayValue: `${riskScore.Sortino_Ratio_Scaled.toFixed(2)}%`
        },
        {
            factor: "Consistency",
            value: consistencyScore.K_Ratio_Scaled,
            displayValue: `${consistencyScore.K_Ratio_Scaled.toFixed(2)}%`
        },
        {
            factor: "Avg Win/Loss",
            value: avgWinLossRatioScaled,
            displayValue: `${(avgWinLossRatioScaled).toFixed(2)}%`
        }
    ];


    console.log(largestLoss);

    return (
        <div className="pt-2">
            <div className="grid grid-cols-12 gap-2">
                <div className={"flex flex-row col-span-4 gap-2"}>
                    <PnlWidget pnl={totalPnl} tradeCount={totalTradeCount} unit={unit} />
                    <ProfitFactorWidget profitFactor={profitFactor} lossFactor={lossFactor} />
                </div>
                <div className={"flex flex-row col-span-8 gap-2"}>
                    <WinLossWidget win={winCount} loss={lossCount} breakeven={breakEvenCount} winRate={winRate}
                                   looseRate={lossRate} breakevenRate={breakEvenRate} />
                    <AvgWinLossWidget avgWin={avgWin} avgLoss={avgLoss} unit={unit} />
                </div>
                <div className={"flex flex-row col-span-12 gap-2"}>
                    <FxScoreWidget totalScore={performanceScore} chartData={scoreData} betSize={suggestedShareSize}
                                   unit={unit} />
                    <DailyPnlAccumulatedWidget chartData={dailyPnlCumulative} unit={unit} />
                    <DailyPnlWidget chartData={dailyStats} unit={unit} />
                </div>
                <div className={"col-span-4"}>
                    <Card className="border w-full h-full">
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Hold Time (Minute)</TableCell>
                                        <TableCell>
                                            <StatsWidget left={avgHoldTimeWin} right={avgHoldTimeLoss}
                                                         mid={avgHoldTimeBreakEven}
                                                         formatter={(v: any) => `${(v < 60 ? "<1" : (v / 60).toFixed(0))}`} />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Largest Gain/Loss</TableCell>
                                        <TableCell>
                                            <StatsWidget left={largestGain} right={Math.abs(largestLoss)}
                                                         formatter={(v: any) => `${FormatUnit(v, unit)}`} />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Max Consecutive
                                            Win/Loss</TableCell>
                                        <TableCell>
                                            <StatsWidget left={maxConsecutiveWins} right={maxConsecutiveLoss} />
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Per Trade
                                            Gain/Loss</TableCell>
                                        <TableCell
                                            className={cn(avgTradeGainLoss > 0 && "text-foreground-green", avgTradeGainLoss < 0 && "text-foreground-red")}>{FormatUnit(avgTradeGainLoss, unit)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Per Share
                                            Gain/Loss</TableCell>
                                        <TableCell
                                            className={cn(avgPerShareGainLoss > 0 && "text-foreground-green", avgPerShareGainLoss < 0 && "text-foreground-red")}>{FormatUnit(avgPerShareGainLoss, unit)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Daily Volume</TableCell>
                                        <TableCell>{avgDailyVolume}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Avg Volume Per Trade</TableCell>
                                        <TableCell>{avgTradeVolume.toFixed()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Commissions</TableCell>
                                        <TableCell>{FormatUnit(totalCommission, unit)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={"w-0 whitespace-nowrap"}>Fees</TableCell>
                                        <TableCell>{FormatUnit(totalFees, unit)}</TableCell>
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
                <div className="col-span-12">
                    <ScoreHistoryWidget chartData={testScores} />
                </div>
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
