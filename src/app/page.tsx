import { TradeParser } from "@/helpers/Parsing/trade-parser";
import { DasSchema, DasTradeMapper } from "@/helpers/Parsing/das-schema";
import { Execution, ScalingAction, Trade, TradeAction, TradeDirection, TradeResult, TradeStatus, TradeType } from "@prisma/client";

export default async function Home() {
  const data =
    "Time,Symbol,Side,Price,Qty,P / L,SecType,\n" +
    "04:30:00,STEC,B,2.00,2000,0.00,Equity/ETF,\n" +
    "04:31:00,STEC,B,3.00,1000,0.00,Equity/ETF,\n" +
    "04:32:00,STEC,S,1.00,2000,0.00,Equity/ETF,\n" +
    "05:30:00,STEC,B,2.00,1000,0.00,Equity/ETF,\n" +
    "05:31:00,STEC,S,3.00,1000,0.00,Equity/ETF,\n" +
    "05:32:00,STEC,S,3.00,2000,0.00,Equity/ETF,\n" +
    "07:05:55,ATNF,B,11.15,2000,0.00,Equity/ETF,\n" +
    "08:53:36,ATNF,S,9,1000,,240.15,Equity/ETF,\n" +
    "09:15:54,ATNF,S,12,1000,0.00,Equity/ETF,\n";
  // parse csv file

  // All Executions
  const account = "TRIB14396";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const trades = await CreateTrades(results, account);

  return (
    <div>
      <pre>
        <code>{JSON.stringify(trades, null, 2)}</code>
      </pre>
    </div>
  );
}

const CreateTrades = async (executions: Execution[], account: string) => {
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

  const trades = [];

  for (const ticker in groupedExecutions) {
    const executions = groupedExecutions[ticker].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (executions.length === 0) {
      continue;
    }

    while (executions.length > 0) {
      const firstExecution = executions.shift();

      if (!firstExecution) {
        continue;
      }
      const trade: Trade & { executions: Execution[] } = {
        id: "",

        account: account,
        ticker: ticker,
        type: TradeType.Stock,
        notes: "",

        startDate: firstExecution.date,
        direction: firstExecution.action === TradeAction.Buy ? TradeDirection.Long : TradeDirection.Short,
        volume: firstExecution.quantity,
        buyVolume: firstExecution.action === TradeAction.Buy ? firstExecution.quantity : 0,
        sellVolume: firstExecution.action === TradeAction.Sell ? firstExecution.quantity : 0,
        openPosition: firstExecution.quantity,
        averagePrice: firstExecution.price,
        commission: firstExecution.commission,
        fees: firstExecution.fees,
        pnl: firstExecution.pnl,

        endDate: null,
        result: null,
        executionTime: 0,
        status: TradeStatus.Open,
        executions: [],
      };

      firstExecution.scalingAction = ScalingAction.Initial;
      firstExecution.tradePosition = firstExecution.quantity;
      firstExecution.avgPrice = firstExecution.price;

      trade.executions.push(firstExecution);
      trades.push(trade);

      while (executions.length > 0) {
        const execution = executions.shift();
        let executionQuantity = execution?.quantity || 0;

        if (!execution) {
          break;
        }

        if (trade.direction === TradeDirection.Long) {
          // Does execution closes the trade ? If so, adjust the quantity and add a new execution with the remaining quantity
          // If the execution is a sell and it partially closes the trade, add a new execution with the remaining quantity and it will appear as a short trade
          if (execution.action === TradeAction.Sell && trade.openPosition <= execution.quantity) {
            executionQuantity = trade.openPosition;
            const newExecution = { ...execution };
            newExecution.quantity = execution.quantity - trade.openPosition;
            executions.unshift(newExecution);
          }

          trade.volume += executionQuantity;
          trade.commission += execution.commission;
          trade.fees += execution.fees;

          if (execution.action === TradeAction.Buy) {
            trade.averagePrice = (trade.averagePrice * trade.buyVolume + execution.price * executionQuantity) / (trade.buyVolume + executionQuantity);
            trade.buyVolume += executionQuantity;
          } else if (execution.action === TradeAction.Sell) {
            trade.sellVolume += executionQuantity;
          }

          if (execution.action === TradeAction.Sell) {
            if (!execution.pnl) {
              trade.pnl += (execution.price - trade.averagePrice) * executionQuantity;
              execution.pnl = (execution.price - trade.averagePrice) * executionQuantity;
            } else trade.pnl += execution.pnl;
          }

          execution.scalingAction =
            execution.action === TradeAction.Buy
              ? ScalingAction.ScaleIn
              : execution.price > trade.averagePrice
              ? ScalingAction.ProfitTaking
              : ScalingAction.StopLoss;

          execution.tradePosition = execution.action === TradeAction.Buy ? trade.openPosition + executionQuantity : trade.openPosition - executionQuantity;
          trade.openPosition = execution.tradePosition;
          execution.avgPrice = trade.averagePrice;
        } else if (trade.direction === TradeDirection.Short) {
          trade.volume += executionQuantity;
          trade.commission += execution.commission;
          trade.fees += execution.fees;
          // Todo ?
          if (execution.action === TradeAction.Sell) {
            trade.averagePrice = (trade.averagePrice * trade.sellVolume + execution.price * executionQuantity) / (trade.sellVolume + executionQuantity);
            trade.sellVolume += executionQuantity;
          }
          trade.pnl += execution.pnl;

          execution.scalingAction =
            execution.action === TradeAction.Sell
              ? ScalingAction.ScaleIn
              : execution.price < trade.averagePrice
              ? ScalingAction.ProfitTaking
              : ScalingAction.StopLoss;
          execution.tradePosition = execution.action === TradeAction.Sell ? trade.openPosition - executionQuantity : trade.openPosition + executionQuantity;
          execution.avgPrice = (trade.averagePrice * trade.volume + execution.price * executionQuantity) / (trade.volume + executionQuantity);
        }

        if (execution.tradePosition === 0) {
          trade.endDate = execution.date;
          trade.executionTime = (trade.endDate.getTime() - trade.startDate.getTime()) / 1000;
          trade.result = trade.pnl > 0 ? TradeResult.Win : trade.pnl < 0 ? TradeResult.Loss : TradeResult.BreakEven;
          trade.status = TradeStatus.Closed;
          trade.executions.push(execution);
          break;
        }
        trade.executions.push(execution);
      }
    }
  }
  return trades;
};
