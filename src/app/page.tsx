import {TradeParser} from "@/helpers/Parsing/trade-parser";
import {DasSchema, DasTradeMapper} from "@/helpers/Parsing/das-schema";
import {
    Execution,
    ScalingAction,
    Trade,
    TradeAction,
    TradeDirection,
    TradeResult,
    TradeStatus,
    TradeType
} from "@prisma/client";


export default async function Home() {
    const data = "Time,Symbol,Side,Price,Qty,Route,Broker,Account,Type,Cloid,Liq,ECNFee,P / L,SecType,LiqType,BP,Value,P/L R,\n" +
        "04:30:00,STEC,B,2.78,7172,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-19938.2,19938.2,,\n" +
        "09:05:55,ATNF,B,11.15,2639,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-29424.9,29424.9,,\n" +
        "08:53:36,ATNF,S,9,1601,SMRT,,TRIB14396,Margin,AUTO,+,0,240.15,Equity/ETF,,15129.5,14409,,\n" +
        "09:15:54,ATNF,B,16.8,1851,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-31096.8,31096.8,,\n"
    // parse csv file

    // All Executions
    const account = "TRIB14396";
    const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
    const trades = await CreateTrades(results);


    return (
        <div>
            <pre>
                <code>
                    {JSON.stringify(trades, null, 2)}
                </code>
            </pre>
        </div>
    );
}


/*
* Trade
* Equity/ETF
* Commissions: Add a checkbox to add commissions if there is none in the data
* Fees: Add a checkbox to add fees if there is none in the data
 */
const CreateTrades = async (executions: Execution[]) => {
    // First group executions by ticker
    // const Trades: Trade[] = [];
    // Group by ticker
    const groupedExecutions = executions.reduce((acc, execution) => {
        if (!acc[execution.ticker]) {
            acc[execution.ticker] = [];
        }
        acc[execution.ticker].push(execution);
        return acc;
    }, {} as Record<string, Execution[]>);

    // Create Trades from each ticker
    for (const ticker in groupedExecutions) {
        /*
        * Now we have Ticker and its executions, we will traverse through each execution and create a trade. If the direction is Long we will close the trade with a sell and if the direction is short we will close the trade with a buy.
        */
        const trade: Trade = {
            ticker: ticker,
            type: TradeType.Stock, // If equity/ETF
            notes: "",
            executions: [],

            startDate: "",// First execution date
            startPrice: 0, // First execution price
            direction: TradeDirection.Long, // If the first execution is long

            volume: 0, // Total volume of executions
            averagePrice: 0, // Average price of all executions
            commissions: 0, // Total commission
            fees: 0, // Total fees
            pnl: 0, // Total pnl from all executions


            executionTime: 0, // From first to last execution if the trade is closed else 0
            endPrice: 0, // Last execution price
            endDate: "",// Last execution date
            result: TradeResult.Win, // If the trade is a win, loss, breakeven
            status: TradeStatus.Open, // If the trade is open or closed
        };
        const executions = groupedExecutions[ticker].sort((a, b) => a.date.getTime() - b.date.getTime());
        if (executions.length === 0) {
            continue;
        }
        const tradeDirection = executions[0].action === TradeAction.Buy ? TradeDirection.Long : executions[0].action === TradeAction.Short ? TradeDirection.Short : null;

        for (let i = 0; i < executions.length; i++) {
            const execution = executions[i];
            /* Execution
            * ScalingAction: Calculate the scaling action based on the previous trade
            * TradePosition: Calculate the trade position based on the previous trade
            * AvgPrice: Calculate the average price of the trade after this execution
            */
            const firstExecution = i === 0;
            if (firstExecution) {
                execution.scalingAction = ScalingAction.Initial;
                execution.tradePosition = execution.quantity;
                execution.avgPrice = execution.price;
            }
            {
                if (tradeDirection === TradeDirection.Long) {
                    execution.scalingAction = execution.action === TradeAction.Buy ? ScalingAction.ScaleIn : execution.price > trade.averagePrice ? ScalingAction.ProfitTaking : ScalingAction.StopLoss;
                    execution.tradePosition = execution.action === TradeAction.Buy ? trade.volume + execution.quantity : trade.volume - execution.quantity;
                    execution.avgPrice = (trade.averagePrice * trade.volume + execution.price * execution.quantity) / (trade.volume + execution.quantity);
                } else if (tradeDirection === TradeDirection.Short) {
                    execution.scalingAction = execution.action === TradeAction.Sell ? ScalingAction.ScaleIn : execution.price < trade.averagePrice ? ScalingAction.ProfitTaking : ScalingAction.StopLoss;
                    execution.tradePosition = execution.action === TradeAction.Sell ? trade.volume + execution.quantity : trade.volume - execution.quantity;
                    execution.avgPrice = (trade.averagePrice * trade.volume + execution.price * execution.quantity) / (trade.volume + execution.quantity);
                }
                }

            }

        }
        return groupedExecutions;
    }