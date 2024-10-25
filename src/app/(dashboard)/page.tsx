import { AdvancedCalendar } from "@/features/calendar/components/advanced-calendar/advanced-calendar";
import { PnlType, Unit } from "@/features/filter/types";
import AvgWinLossWidget from "@/features/widgets/components/avg-win-loss";
import { DailyPnlWidget } from "@/features/widgets/components/daily-pnl";
import { DailyPnlAccumulatedWidget } from "@/features/widgets/components/daily-pnl-accumulated";
import ExpectancyWidget from "@/features/widgets/components/expectancy";
import PnlWidget from "@/features/widgets/components/pnl-widget";
import { ProfitFactorWidget } from "@/features/widgets/components/profit-factor-widget";
import { WinLossWidget } from "@/features/widgets/components/win-loss";
import { TradeResult, TradeType } from "@prisma/client";

// Todo : in order to decide if a trade win or loose we need to factor in the commissions. Remove Trade Result enum from The trade and calculate based on selected calculation type
// enum for Gross and Net
const unit = Unit.Currency;
const calculationType = PnlType.Gross;
const trades = [
    { pnl: 200, commissions: 10, result: TradeResult.Win, startDate: new Date(2024, 1, 1) },
    { pnl: 200, commissions: 10, result: TradeResult.Win, startDate: new Date(2024, 1, 1) },
    { pnl: 200, commissions: 10, result: TradeResult.Win, startDate: new Date(2024, 2, 1) },
    { pnl: 200, commissions: 10, result: TradeResult.Win, startDate: new Date(2024, 2, 1) },
    { pnl: 200, commissions: 10, result: TradeResult.Win, startDate: new Date(2024, 2, 1) },
    { pnl: 800, commissions: 10, result: TradeResult.Win, startDate: new Date(2024, 2, 2) },
    { pnl: 100, commissions: 10, result: TradeResult.Win, startDate: new Date(2024, 2, 3) },
    { pnl: -100, commissions: 10, result: TradeResult.Loss, startDate: new Date(2024, 2, 4) },
    { pnl: -300, commissions: 10, result: TradeResult.Loss, startDate: new Date(2024, 2, 5) },
    { pnl: 10, commissions: 10, result: TradeResult.BreakEven, startDate: new Date(2024, 2, 6) },
    { pnl: 10, commissions: 10, result: TradeResult.BreakEven, startDate: new Date(2024, 2, 6) },
];

const dailyPnl: { date: Date; pnl: number }[] = trades.map((trade) => ({
    date: trade.startDate,
    pnl: calculationType === PnlType.Gross ? trade.pnl : trade.pnl - trade.commissions,
}));

const dailyPnlAccumulated = dailyPnl.reduce(
    (acc, trade) => {
        const last = acc[acc.length - 1];
        acc.push({ date: trade.date, pnl: last.pnl + trade.pnl });
        return acc;
    },
    [{ date: dailyPnl[0].date, pnl: dailyPnl[0].pnl }],
);
const sumOfProfit = trades.reduce((acc, trade) => trade.result === TradeResult.Win ? acc + trade.pnl : acc, 0);
const sumOfLoss = trades.reduce((acc, trade) => trade.result === TradeResult.Loss ? acc + trade.pnl : acc, 0);
const winCount = trades.filter((trade) => trade.result === TradeResult.Win).length;
const looseCount = trades.filter((trade) => trade.result === TradeResult.Loss).length;
const breakevenCount = trades.filter((trade) => trade.result === TradeResult.BreakEven).length;

const totalTradeCount = winCount + looseCount + breakevenCount;
const avgWin = sumOfProfit/winCount;
const avgLoss = -sumOfLoss/looseCount;
const profitFactor = -sumOfProfit/sumOfLoss;
const lossFactor = -sumOfLoss/sumOfProfit;
const totalPnl = sumOfProfit + sumOfLoss;
const winRate = winCount/(winCount + looseCount + breakevenCount) * 100;
const looseRate = looseCount/(winCount + looseCount + breakevenCount) * 100;
const breakevenRate = breakevenCount/(winCount + looseCount + breakevenCount) * 100;
const expectancy = (avgWin * winRate - avgLoss * looseRate)/100

export default function Dashboard() {
    return (
        <div className="pt-2">
            <div className="grid grid-cols-15 gap-2">

                <div className="col-span-3 row-span-1">
                    <PnlWidget pnl={totalPnl} tradeCount={totalTradeCount}/>
                </div>
                <div className="col-span-3 row-span-1">
                    <ExpectancyWidget expectancy={expectancy}/>
                </div>
                <div className="col-span-3 row-span-1">
                    <ProfitFactorWidget profitFactor={profitFactor} lossFactor={lossFactor} />
                </div>
                <div className="col-span-3 row-span-1">
                    <WinLossWidget win={winCount} loss={looseCount} breakeven={breakevenCount} winRate={winRate} looseRate={looseRate} breakevenRate={breakevenRate}/>
                </div>
                <div className="col-span-3 row-span-1">
                    <AvgWinLossWidget avgWin={avgWin} avgLoss={avgLoss}/>
                </div>
                <div className="col-span-5 row-span-1">
                    <DailyPnlAccumulatedWidget chartData={dailyPnlAccumulated} />
                </div>
                <div className="col-span-5 row-span-1">
                    <DailyPnlWidget chartData={dailyPnl} />
                </div>
                <div className="col-span-5 row-span-1">
                    <DailyPnlAccumulatedWidget chartData={dailyPnlAccumulated} />
                </div>

                <div className="col-span-10 col-start-6  row-span-3">
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
