"use client";
import {AdvancedCalendar, DailyStats} from "@/features/calendar/components/advanced-calendar/advanced-calendar";
import {useFilterStore} from "@/features/filter/hooks/use-filters";
import {PnlType, Unit} from "@/features/filter/types";
import AvgWinLossWidget from "@/features/widgets/components/avg-win-loss";
import {DailyPnlWidget} from "@/features/widgets/components/daily-pnl";
import {DailyPnlAccumulatedWidget} from "@/features/widgets/components/daily-pnl-accumulated";
import ExpectancyWidget from "@/features/widgets/components/expectancy";
import {FxScoreWidget} from "@/features/widgets/components/fx-score";
import PnlWidget from "@/features/widgets/components/pnl-widget";
import {ProfitFactorWidget} from "@/features/widgets/components/profit-factor-widget";
import {WinLossWidget} from "@/features/widgets/components/win-loss";
import {Trade, TradeResult} from "@prisma/client";
import {useGetCalendarDataQuery} from "@/features/calendar/hooks/use-get-calendar-data-query";
import {DataTable} from "@/app/trades/data-table";
import {columns} from "@/app/trades/columns";
import {TradeDetails} from "@/app/trades/trade-detail";

function calculateDailyPnLAndStats(trades: Trade[] | undefined, pnlType: PnlType, unit: Unit, risk: number = 1, isPercentageRisk: boolean = false) {

    if (!trades) return {
        dailyStats: [],
        sumOfProfit: 0,
        sumOfLoss: 0,
        winCount: 0,
        lossCount: 0,
        breakEvenCount: 0,
    };
    const dailyStatsMap = new Map<string, DailyStats>();

    // Initialize accumulators for additional calculations
    const result = {
        sumOfProfit: 0,
        sumOfLoss: 0,
        winCount: 0,
        lossCount: 0,
        breakEvenCount: 0,
    };

    trades.forEach((trade) => {
        const dateKey = trade.startDate.toISOString().split("T")[0];

        // Calculate pnl based on pnlType
        const pnl =
            pnlType === PnlType.Gross
                ? trade.pnl
                : trade.pnl + trade.commission + trade.fees;

        let actualPnl = pnl;
        if (unit === Unit.Percent) {
            // Percent gain
            actualPnl = (pnl / (trade.averagePrice * trade.volume / 2)) * 100;
        } else if (unit === Unit.RMultiple) {
            const calculatedRisk = isPercentageRisk
                ? (trade.averagePrice * trade.volume / 2) * (risk / 100)
                : risk;
            actualPnl = pnl / calculatedRisk;
        }

        // Populate the dailyStatsMap
        if (dailyStatsMap.has(dateKey)) {
            dailyStatsMap.get(dateKey)!.pnl += actualPnl;
            dailyStatsMap.get(dateKey)!.trades += 1;
            dailyStatsMap.get(dateKey)!.result = dailyStatsMap.get(dateKey)!.pnl > 0 ? TradeResult.Win : dailyStatsMap.get(dateKey)!.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;

        } else {
            dailyStatsMap.set(dateKey, {
                date: trade.startDate,
                pnl: actualPnl,
                trades: 1,
                result: actualPnl > 0 ? TradeResult.Win : actualPnl < 0 ? TradeResult.Loss : TradeResult.BreakEven
            });
        }

        // Update accumulators based on trade result
        if (trade.result === TradeResult.Win) {
            result.sumOfProfit += actualPnl;
            result.winCount += 1;
        } else if (trade.result === TradeResult.Loss) {
            result.sumOfLoss += actualPnl;
            result.lossCount += 1;
        } else if (trade.result === TradeResult.BreakEven) {
            result.breakEvenCount += 1;
        }
    });

    return {
        dailyStats: Array.from(dailyStatsMap.values()),
        ...result,
    };
}

function calculateCumulativeDailyPnl(dailyPnl: { date: Date; pnl: number }[]) {
    const sortedDailyPnl = dailyPnl.sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulativeActualPnl = 0;  // Track only the modified cumulative PnL
    return sortedDailyPnl.map((day) => {
        cumulativeActualPnl += day.pnl;  // No need to track 'gain' separately
        return {date: day.date, pnl: cumulativeActualPnl};  // Only return cumulativePnl now
    });
}

const calculateSortinoRatio = (dailyPnLs: { date: Date, pnl: number }[], benchmarkValue: number, riskFreeRate = 0) => {
    const n = dailyPnLs.length;
    if (n === 0) return {
        Sortino_Ratio: 0,
        Sortino_Ratio_Scaled: 0
    }

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
        }
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
    }

}

function calculateKRatio(cumulativePnL: { date: Date, pnl: number }[], benchmarkValue: number) {
    if (cumulativePnL.length < 2) {
        // Not enough data to compute K-Ratio
        return {K_Ratio: 0, K_Ratio_Scaled: 0};
    }

    const t: number[] = cumulativePnL.map((_, index) => index);

    const N = cumulativePnL.length;
    const y = cumulativePnL;

    // Step 3: Compute sums for linear regression
    let sum_t = 0;
    let sum_y = 0;
    let sum_t2 = 0;
    let sum_t_y = 0;

    for (let i = 0; i < N; i++) {
        sum_t += t[i];
        sum_y += y[i].pnl;
        sum_t2 += t[i] * t[i];
        sum_t_y += t[i] * y[i].pnl;
    }

    // Step 4: Calculate slope (b) and intercept (a)
    const denominator = N * sum_t2 - sum_t * sum_t;
    if (denominator === 0) return {K_Ratio: 0, K_Ratio_Scaled: 0};

    const b = (N * sum_t_y - sum_t * sum_y) / denominator;
    const a = (sum_y - b * sum_t) / N;

    // Step 5: Calculate residuals and sum of squared residuals (SS_res)
    let ss_res = 0;
    for (let i = 0; i < N; i++) {
        const y_pred = a + b * t[i];
        const residual = y[i].pnl - y_pred;
        ss_res += residual * residual;
    }

    // Step 6: Calculate Standard Error of the Slope (SE_b)
    const se_b_numerator = ss_res / (N - 2);
    const se_b_denominator = sum_t2 - (sum_t * sum_t) / N;
    if (se_b_denominator === 0) return {K_Ratio: 0, K_Ratio_Scaled: 0};

    const SE_b = Math.sqrt(se_b_numerator / se_b_denominator);
    if (SE_b === 0) return {K_Ratio: 0, K_Ratio_Scaled: 0};

    // Step 7: Compute the K-Ratio
    const K = (b / SE_b) * Math.sqrt(N);

    // Step 8: Scale the K-Ratio between 0 and 100
    let K_scaled = (K / benchmarkValue) * 100;
    K_scaled = Math.max(0, Math.min(100, K_scaled)); // Ensure the value is between 0 and 100

    return {
        K_Ratio: K,
        K_Ratio_Scaled: K_scaled
    }
}

function calculatePerformanceScore(pfScore: number, winRatio: number, avgWlsScore: number, rms: number, cs: number): number {


    const FPS = 0.50 * pfScore + 0.10 * winRatio + 0.10 * avgWlsScore + 0.10 * rms + 0.30 * cs;

    return Math.max(0, Math.min(100, FPS));
}


export default function Dashboard() {
    const {data: trades, isLoading} = useGetCalendarDataQuery(new Date(2024, 9, 1));

    const {unit, pnlType} = useFilterStore();
    const balance = 100000;
    const risk = 5;
    const isPercentageRisk = true;
    const profitFactorBenchmark = 2;
    const winRateBenchmark = 100;
    const avgWinLossRatioBenchmark = 2;
    const riskScoreBenchmark = 2;
    const consistencyScoreBenchmark = 20;

    const {
        sumOfProfit,
        sumOfLoss,
        winCount,
        lossCount,
        breakEvenCount,
        dailyStats
    } = calculateDailyPnLAndStats(trades, pnlType, unit, risk, isPercentageRisk);
    const dailyPnlCumulative = calculateCumulativeDailyPnl(dailyStats);
    const riskScore = calculateSortinoRatio(dailyStats, riskScoreBenchmark);
    const consistencyScore = calculateKRatio(dailyPnlCumulative, consistencyScoreBenchmark);


    const totalTradeCount = winCount + lossCount + breakEvenCount;
    const avgWin = winCount ? sumOfProfit / winCount : 0;
    const avgLoss = lossCount ? sumOfLoss / lossCount : 0;
    const avgWinLossRatio = avgLoss ? avgWin : avgWin / avgLoss;
    const profitFactor = sumOfLoss ? sumOfProfit / Math.abs(sumOfLoss) : sumOfProfit;
    const lossFactor = sumOfProfit ? sumOfLoss / Math.abs(sumOfProfit) : sumOfLoss;
    const totalPnl = sumOfProfit + sumOfLoss;
    const winRate = winCount ? (winCount / (winCount + lossCount + breakEvenCount)) * 100 : 0;
    const lossRate = lossCount ? (lossCount / (winCount + lossCount + breakEvenCount)) * 100 : 0;
    const breakEvenRate = breakEvenCount ? (breakEvenCount / (winCount + lossCount + breakEvenCount)) * 100 : 0;
    const expectancy = (avgWin * winRate + avgLoss * lossRate) / 100;
    const kellyCriterion = avgWinLossRatio ? (winRate / 100 - ((1 - winRate / 100) / avgWinLossRatio)) : 0;
    const suggestedShareSize = kellyCriterion * balance;

    const profitFactorScaled = Math.min(profitFactor, profitFactorBenchmark) / profitFactorBenchmark * 100;
    const avgWinLossRatioScaled = Math.min(avgWin / avgLoss, avgWinLossRatioBenchmark) / avgWinLossRatioBenchmark * 100;

    const performanceScore = calculatePerformanceScore(profitFactorScaled, winRate, avgWinLossRatioScaled, riskScore.Sortino_Ratio_Scaled, consistencyScore.K_Ratio_Scaled);
    const scoreData = [
        {
            factor: "Win Rate",
            value: winRate,
            displayValue: `${winRate.toFixed(2)}% vs Benchmark : ${winRateBenchmark}%`
        },
        {
            factor: "Profit Factor",
            value: profitFactorScaled,
            displayValue: `${profitFactor.toFixed(2)} vs Benchmark: ${profitFactorBenchmark}`
        },
        {
            factor: "Risk Management",
            value: riskScore.Sortino_Ratio_Scaled,
            displayValue: `${riskScore.Sortino_Ratio.toFixed(2)} vs Benchmark : ${riskScoreBenchmark}`
        },
        {
            factor: "Consistency",
            value: consistencyScore.K_Ratio_Scaled,
            displayValue: `${consistencyScore.K_Ratio.toFixed(2)} vs Benchmark : ${consistencyScoreBenchmark}`
        },
        {
            factor: "Avg Win/Loss",
            value: avgWinLossRatioScaled,
            displayValue: `${(avgWinLossRatio).toFixed(2)} vs Benchmark : ${avgWinLossRatioBenchmark}`
        },
    ]
    return (
        <div className="pt-2">
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2 row-span-1">
                    <PnlWidget pnl={totalPnl} tradeCount={totalTradeCount} unit={unit}/>
                </div>
                <div className="col-span-2 row-span-1">
                    <ExpectancyWidget expectancy={expectancy} unit={unit}/>
                </div>
                <div className="col-span-2 row-span-1">
                    <ProfitFactorWidget profitFactor={profitFactor} lossFactor={lossFactor}/>
                </div>
                <div className="col-span-3 row-span-1">
                    <WinLossWidget
                        win={winCount}
                        loss={lossCount}
                        breakeven={breakEvenCount}
                        winRate={winRate}
                        looseRate={lossRate}
                        breakevenRate={breakEvenRate}
                    />
                </div>
                <div className="col-span-3 row-span-1">
                    <AvgWinLossWidget avgWin={avgWin} avgLoss={avgLoss} unit={unit}/>
                </div>
                <div className="col-span-4 col-start-1 row-span-1">
                    <FxScoreWidget totalScore={performanceScore} chartData={scoreData} betSize={suggestedShareSize}
                                   unit={unit}/>
                </div>
                <div className="col-span-4 row-span-1">
                    <DailyPnlAccumulatedWidget chartData={dailyPnlCumulative} unit={unit}/>
                </div>
                <div className="col-span-4 row-span-1">
                    <DailyPnlWidget chartData={dailyStats} unit={unit}/>
                </div>

                <div className="col-span-12 col-start-1 row-span-3">
                    <AdvancedCalendar/>
                </div>
                {
                    // Streaks: A widget that shows the longest winning and losing streaks for both trades and days
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

            */}
            {
                isLoading ? <div>Loading...</div> :
                <DataTable columns={columns} data={trades}/>
            }


        </div>
    );
}
