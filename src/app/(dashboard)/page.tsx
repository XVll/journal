import { AdvancedCalendar } from "@/features/calendar/components/advanced-calendar/advanced-calendar";
import ExpectancyWidget from "@/features/widgets/components/expectancy";
import PnlWidget from "@/features/widgets/components/pnl-widget";
import { ProfitFactorWidget } from "@/features/widgets/components/profit-factor-widget";
import { WinLossWidget } from "@/features/widgets/components/win-loss";

const totalPnl = 33.44;
const totalTradeCount = 33;
const winRate = 50;
const looseRate = 50;
const avgWin = 23.44;
const avgLoss = 63.44;
const expectancy = (avgWin * winRate - avgLoss * looseRate)/100

export default function Dashboard() {
    return (
        <div className="pt-2">
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 row-span-1">
                    <PnlWidget pnl={totalPnl} tradeCount={totalTradeCount}/>
                </div>
                <div className="col-span-1 row-span-1">
                    <ExpectancyWidget expectancy={expectancy}/>
                </div>
                <div className="col-span-1 row-span-1">
                    <PnlWidget pnl={33.44} tradeCount={33}/>
                </div>
                <div className="col-span-1 row-span-1">
                    <PnlWidget pnl={33.44} tradeCount={33}/>
                </div>
                <div className="col-span-1 row-span-2">
                    <WinLossWidget />
                </div>
                <div className="col-span-1 row-span-2">
                    <ProfitFactorWidget />
                </div>
                <div className="col-span-1 row-span-2">
                    <ProfitFactorWidget />
                </div>
                <div className="col-span-1 row-span-2">
                    <ProfitFactorWidget />
                </div>

                <div className="col-span-4 col-start-1 row-span-4">
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
