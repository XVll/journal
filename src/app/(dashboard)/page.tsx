"use client";
import {AdvancedCalendar} from "@/features/calendar/components/advanced-calendar/advanced-calendar";
import {useFilterStore} from "@/features/filter/hooks/use-filters";
import {PnlType} from "@/features/filter/types";
import AvgWinLossWidget from "@/features/widgets/components/avg-win-loss";
import {DailyPnlWidget} from "@/features/widgets/components/daily-pnl";
import {DailyPnlAccumulatedWidget} from "@/features/widgets/components/daily-pnl-accumulated";
import ExpectancyWidget from "@/features/widgets/components/expectancy";
import {FxScoreWidget} from "@/features/widgets/components/fx-score";
import PnlWidget from "@/features/widgets/components/pnl-widget";
import {ProfitFactorWidget} from "@/features/widgets/components/profit-factor-widget";
import {WinLossWidget} from "@/features/widgets/components/win-loss";
import {TradeResult} from "@prisma/client";

// Todo : in order to decide if a trade win or loose we need to factor in the commissions. Remove Trade Result enum from The trade and calculate based on selected calculation type
// enum for Gross and Net
function calculateDailyPnL(trades: any[], pnlType: PnlType): { date: Date; pnl: number, gain: number }[] {
    const dailyPnLMap = new Map<string, { date: Date; pnl: number, gain: number }>();

    trades.forEach((trade) => {
        const dateKey = trade.closeDate.toISOString().split("T")[0];

        const pnl = pnlType === PnlType.Gross ? trade.pnl : trade.pnl + trade.commissions;
        const gain = (pnl / (trade.avgPrice * trade.volume / 2)) * 100;


        if (dailyPnLMap.has(dateKey)) {
            dailyPnLMap.get(dateKey)!.pnl += pnl;
            dailyPnLMap.get(dateKey)!.gain += gain;
        } else {
            dailyPnLMap.set(dateKey, {date: trade.closeDate, pnl: pnl, gain: gain});
        }
    });

    return Array.from(dailyPnLMap.values());
}

function calculateCumulativeDailyPnl(trades: any[], pnlType: PnlType): { date: Date; pnl: number, gain: number }[] {
    const dailyPnl = calculateDailyPnL(trades, pnlType);

    const sortedDailyPnl = dailyPnl.sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulativePnl = 0;
    let cumulativeGain = 0;
    const cumulativeDailyPnl = sortedDailyPnl.map((trade) => {
        cumulativePnl += trade.pnl;
        cumulativeGain += trade.gain;
        return {date: trade.date, pnl: cumulativePnl, gain: cumulativeGain};
    });

    return cumulativeDailyPnl;
}


// Consistency Index (R-Squared),
// This doesn't take into account if the trades are profitable or not just the consistency of the trades
// Even if the trades are all losses, but the pnl is consistent the score will be high
function calculateConsistencyScore(cumulativePnLs: { date: Date, pnl: number }[]): number {
    const n = cumulativePnLs.length;
    const tradeIndices = Array.from({length: n}, (_, i) => i + 1);

    const meanX = (n + 1) / 2;
    const meanY = cumulativePnLs.reduce((acc, trade) => acc + trade.pnl, 0) / n;

// Calculate regression coefficients
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
        numerator += (tradeIndices[i] - meanX) * (cumulativePnLs[i].pnl - meanY);
        denominator += Math.pow(tradeIndices[i] - meanX, 2);
    }


    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

// Calculate R-squared
    let ssTotal = 0;
    let ssResidual = 0;
    for (let i = 0; i < n; i++) {
        const predictedY = slope * tradeIndices[i] + intercept;
        ssTotal += Math.pow(cumulativePnLs[i].pnl - meanY, 2);
        ssResidual += Math.pow(cumulativePnLs[i].pnl - predictedY, 2);
    }

    const rSquared = 1 - ssResidual / ssTotal;

// Normalize to 0 - 100 scale
    return rSquared * 100;
}

const calculateSortinoRatio = (dailyPnls: { date: Date, pnl: number }[], riskFreeRate = 0) => {
    const n = dailyPnls.length;
    if (n === 0) return {
        Sortino_Ratio: 0,
        Sortino_Ratio_Scaled: 0
    }

    // Step 1: Calculate the average return (Rp)
    const meanReturn = dailyPnls.reduce((a, b) => a + b.pnl, 0) / n;

    // Step 2: Calculate the excess return over the risk-free rate
    const excessReturn = meanReturn - riskFreeRate;

    // Step 3: Identify negative returns (downside)
    const negativeReturns = dailyPnls.filter(pnl => pnl.pnl < riskFreeRate);

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

    const sortinoRatioScaled = Math.max(Math.min((sortinoRatio / 2) * 100, 100), 0);

    return {
        Sortino_Ratio: sortinoRatio,
        Sortino_Ratio_Scaled: sortinoRatioScaled
    }

}

interface Trade {
    pnl: number;
    commissions: number;
    result: TradeResult;
    closeDate: Date;
    avgPrice: number;
    volume: number;
}

enum TradeResult {
    Win,
    Loss,
}

function calculateKRatio(trades: Trade[]) {
    if (trades.length < 2) {
        // Not enough data to compute K-Ratio
        return {K_Ratio: 0, K_Ratio_Scaled: 0};
    }

    // Step 1: Sort trades by closeDate (optional if trades are already sequential)
    trades.sort((a, b) => a.closeDate.getTime() - b.closeDate.getTime());

    // Step 2: Compute cumulative PnL and time indices
    const cumulativePnL: number[] = [];
    const t: number[] = []; // time indices starting from 0

    let cumulativeSum = 0;

    for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];
        cumulativeSum += trade.pnl;
        cumulativePnL.push(cumulativeSum);

        // Time indices starting from 0
        t.push(i);
    }

    const N = trades.length;
    const y = cumulativePnL;

    // Step 3: Compute sums for linear regression
    let sum_t = 0;
    let sum_y = 0;
    let sum_t2 = 0;
    let sum_t_y = 0;

    for (let i = 0; i < N; i++) {
        sum_t += t[i];
        sum_y += y[i];
        sum_t2 += t[i] * t[i];
        sum_t_y += t[i] * y[i];
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
        const residual = y[i] - y_pred;
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
    const K_Ratio_max = 20; // Assumed maximum K-Ratio for scaling
    let K_scaled = (K / K_Ratio_max) * 100;
    K_scaled = Math.max(0, Math.min(100, K_scaled)); // Ensure the value is between 0 and 100

    return {
        K_Ratio: K,
        K_Ratio_Scaled: K_scaled
    }
}

function calculatePerformanceScore(
    pfScore: number,
    winRatio: number,
    avgWlsScore: number,
    rms: number,
    cs: number
): number {


    const FPS = 0.50 * pfScore + 0.10 * winRatio + 0.10 * avgWlsScore + 0.10 * rms + 0.30 * cs;

    return Math.max(0, Math.min(100, FPS));
}


const trades = [
    {pnl: 170, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 1), avgPrice: 1.2, volume: 100},
    {pnl: -130, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 2), avgPrice: 1.2, volume: 100},
    {pnl: -120, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 3), avgPrice: 1.2, volume: 100},
    {pnl: 120, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 4), avgPrice: 1.2, volume: 100},
    {pnl: -120, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 5), avgPrice: 1.2, volume: 100},
    {pnl: 120, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 6), avgPrice: 1.2, volume: 100},
    {pnl: 150, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 7), avgPrice: 1.2, volume: 100},
    {pnl: 160, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 8), avgPrice: 1.2, volume: 100},
    {pnl: 160, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 9), avgPrice: 1.2, volume: 100},
    {pnl: -120, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 10), avgPrice: 1.2, volume: 100},
    {pnl: 150, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 11), avgPrice: 1.2, volume: 100},
    {pnl: -120, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 12), avgPrice: 1.2, volume: 100},
    {pnl: -140, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 13), avgPrice: 1.2, volume: 100},
    {pnl: -130, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 14), avgPrice: 1.2, volume: 100},
    {pnl: 120, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 15), avgPrice: 1.2, volume: 100},
    {pnl: -140, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 16), avgPrice: 1.2, volume: 100},
    {pnl: 150, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 17), avgPrice: 1.2, volume: 100},
    {pnl: -140, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 18), avgPrice: 1.2, volume: 100},
    {pnl: 150, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 19), avgPrice: 1.2, volume: 100},
    {pnl: 180, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 20), avgPrice: 1.2, volume: 100},
    {pnl: -150, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 21), avgPrice: 1.2, volume: 100},
    {pnl: -140, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 22), avgPrice: 1.2, volume: 100},
    {pnl: 100, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 23), avgPrice: 1.2, volume: 100},
    {pnl: -150, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 24), avgPrice: 1.2, volume: 100},
    {pnl: 110, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 25), avgPrice: 1.2, volume: 100},
    {pnl: 113, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 26), avgPrice: 1.2, volume: 100},
    {pnl: -150, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 27), avgPrice: 1.2, volume: 100},
    {pnl: -150, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 28), avgPrice: 1.2, volume: 100},
    {pnl: 115, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 29), avgPrice: 1.2, volume: 100},
    {pnl: -140, commissions: 0, result: TradeResult.Loss, closeDate: new Date(2024, 10, 30), avgPrice: 1.2, volume: 100},
    {pnl: 110, commissions: 0, result: TradeResult.Win, closeDate: new Date(2024, 10, 31), avgPrice: 1.2, volume: 100},



];

export default function Dashboard() {
    const {unit, pnlType} = useFilterStore();


    const sumOfProfit = trades.reduce((acc, trade) => (trade.result === TradeResult.Win ? acc + trade.pnl : acc), 0);
    const sumOfLoss = trades.reduce((acc, trade) => (trade.result === TradeResult.Loss ? acc + trade.pnl : acc), 0);
    const winCount = trades.filter((trade) => trade.result === TradeResult.Win).length;
    const looseCount = trades.filter((trade) => trade.result === TradeResult.Loss).length;
    const breakevenCount = trades.filter((trade) => trade.result === TradeResult.BreakEven).length;

    const totalTradeCount = winCount + looseCount + breakevenCount;
    const avgWin = sumOfProfit / winCount || 0;
    const avgLoss = Math.abs(sumOfLoss / looseCount) || 0;
    const avgWinLossRatio = avgWin / avgLoss;
    const profitFactor = Math.abs(sumOfProfit / sumOfLoss);
    const lossFactor = Math.abs(sumOfLoss / sumOfProfit);
    const totalPnl = sumOfProfit + sumOfLoss;
    const winRate = (winCount / (winCount + looseCount + breakevenCount)) * 100;
    const looseRate = (looseCount / (winCount + looseCount + breakevenCount)) * 100;
    const breakevenRate = (breakevenCount / (winCount + looseCount + breakevenCount)) * 100;
    const expectancy = (avgWin * winRate - avgLoss * looseRate) / 100;

    const dailyPnl = calculateDailyPnL(trades, pnlType);
    const dailyPnlCumulative = calculateCumulativeDailyPnl(trades, pnlType);
    // const consistencyScore = calculateConsistencyScore(dailyPnlCumulative);
    const riskScore = calculateSortinoRatio(dailyPnl);
    const consistencyScore = calculateKRatio(trades);
    const kellyCriterion = (winRate / 100 - ((1 - winRate / 100) / avgWinLossRatio));
    const suggestedShareSize = kellyCriterion * 100000;

    const profitFactorScaled = Math.min(profitFactor, 2) / 2 * 100;
    const avgWinLossRatioScaled = Math.min(avgWin / avgLoss, 2) / 2 * 100;

    const performanceScore = calculatePerformanceScore(profitFactorScaled, winRate, avgWinLossRatioScaled, riskScore.Sortino_Ratio_Scaled, consistencyScore.K_Ratio_Scaled);
    const scoreData = [
        {factor: "Win Rate", value: winRate, displayValue: `${winRate.toFixed(2)}%`},
        {factor: "Profit Factor", value: profitFactorScaled, displayValue: `${profitFactor.toFixed(2)}`},
        {factor: "Risk Management", value: riskScore.Sortino_Ratio_Scaled, displayValue: `${riskScore.Sortino_Ratio.toFixed(2)}`},
        {factor: "Consistency", value: consistencyScore.K_Ratio_Scaled, displayValue: `${consistencyScore.K_Ratio.toFixed(2)}`},
        {factor: "Avg Win/Loss", value: avgWinLossRatioScaled, displayValue: `${(avgWinLossRatio).toFixed(2)}`},
    ]
    // * Kelly Criterion %(Can use this to suggest a share size to use) = Win Ratio - ((1 - Win Ratio) / (Average Win / Average Loss))
// * Eg if Win Ratio is 70%, Average Win is 100$ and Average Loss is 50$ then Kelly Criterion % = 70% - ((1 - 70%) / (100 / 50)) = 70% - (30% / 2) = 70% - 15% = 55% and this means that trader can place 55% of his capital on each trade. If a trader has 25.000$ capital then he can place 13.750$ on each trade.
    return (
        <div className="pt-2">
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2 row-span-1">
                    <PnlWidget pnl={totalPnl} tradeCount={totalTradeCount}/>
                </div>
                <div className="col-span-2 row-span-1">
                    <ExpectancyWidget expectancy={expectancy}/>
                </div>
                <div className="col-span-2 row-span-1">
                    <ProfitFactorWidget profitFactor={profitFactor} lossFactor={lossFactor}/>
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
                    <AvgWinLossWidget avgWin={avgWin} avgLoss={avgLoss}/>
                </div>
                <div className="col-span-4 col-start-1 row-span-1">
                    <FxScoreWidget totalScore={performanceScore} chartData={scoreData} betSize={suggestedShareSize}/>
                </div>
                <div className="col-span-4 row-span-1">
                    <DailyPnlAccumulatedWidget chartData={dailyPnlCumulative}/>
                </div>
                <div className="col-span-4 row-span-1">
                    <DailyPnlWidget chartData={dailyPnl}/>
                </div>

                <div className="col-span-12 col-start-1 row-span-3">
                    <AdvancedCalendar/>
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
