import { Execution, ScalingAction, Trade, TradeAction, TradeDirection, TradeResult, TradeStatus, TradeType } from "@prisma/client";

function CalculateCommission(execution: Execution) {
  // 0.0035 for <300k, 0.0020 for <3m, 0.0015 for <20m
  // You need to calculate monthly volume to determine the commission rate
  return -0.002 * execution.quantity;
}
function CalculateFees(execution: Execution) {
  const commission = CalculateCommission(execution);
  const ecnFee = execution.addLiquidity ? 0.0021 * execution.quantity : -0.003 * execution.quantity;
  const clearingFee = -0.0002 * execution.quantity;
  const secTransactionFee = -0.0000278 * execution.quantity * execution.price;
  const passThroughFee = -0.000175 * commission;
  const finraFee = -0.00056 * commission;
  const finraTradingActivityFee = -0.000166 * (execution.action == TradeAction.Sell ? execution.quantity : 0);
  const finraConsolidatedAuditTrailFee = -0.000072 * execution.quantity;
  return ecnFee + clearingFee + secTransactionFee + passThroughFee + finraFee + finraTradingActivityFee + finraConsolidatedAuditTrailFee;
}
export default async function CreateTrades(executions: Execution[], account: string) {
  // Group by ticker
  const groupedExecutions = executions.reduce((acc, execution) => {
    if (!acc[execution.ticker]) {
      acc[execution.ticker] = [];
    }
    acc[execution.ticker].push(execution);
    return acc;
  }, {} as Record<string, Execution[]>);

  const trades = [];

  // Sort executions by date
  for (const ticker in groupedExecutions) {
    const executions = groupedExecutions[ticker].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (executions.length === 0) {
      continue;
    }

    while (executions.length > 0) {
      // Start from the first execution and create a trade
      const firstExecution = executions.shift();

      if (!firstExecution) {
        continue;
      }

      firstExecution.scalingAction = ScalingAction.Initial;
      firstExecution.tradePosition = firstExecution.quantity;
      firstExecution.avgPrice = firstExecution.price;
      firstExecution.commission = CalculateCommission(firstExecution);
      firstExecution.fees = CalculateFees(firstExecution);

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


      trade.executions.push(firstExecution);
      trades.push(trade);

      while (executions.length > 0) {
        const execution = executions.shift();

        if (!execution) {
          break;
        }

        if (trade.direction === TradeDirection.Long) {
          let executionQuantity = execution?.quantity || 0;
          // Does execution closes the trade ? If so, adjust the quantity and add a new execution with the remaining quantity
          // If the execution is a sell and it partially closes the trade, add a new execution with the remaining quantity and it will appear as a short trade
          if (execution.action === TradeAction.Sell && trade.openPosition < execution.quantity) {
            executionQuantity = trade.openPosition;
            const newExecution = { ...execution };
            newExecution.quantity = execution.quantity - trade.openPosition;
            executions.unshift(newExecution);
          }


          execution.commission = CalculateCommission(execution);
          execution.fees = CalculateFees(execution);
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
          let executionQuantity = execution?.quantity || 0;

          // Does execution closes the trade ? If so, adjust the quantity and add a new execution with the remaining quantity
          // If the execution is a sell and it partially closes the trade, add a new execution with the remaining quantity and it will appear as a short trade
          if (execution.action === TradeAction.Buy && trade.openPosition < execution.quantity) {
            executionQuantity = trade.openPosition;
            const newExecution = { ...execution };
            newExecution.quantity = execution.quantity - trade.openPosition;
            executions.unshift(newExecution);
          }

          execution.commission = CalculateCommission(execution);
          execution.fees = CalculateFees(execution);
          trade.volume += executionQuantity;
          trade.commission += execution.commission;
          trade.fees += execution.fees;

          if (execution.action === TradeAction.Sell) {
            trade.averagePrice = (trade.averagePrice * trade.sellVolume + execution.price * executionQuantity) / (trade.sellVolume + executionQuantity);
            trade.sellVolume += executionQuantity;
          } else if (execution.action === TradeAction.Buy) {
            trade.buyVolume += executionQuantity;
          }
          if (execution.action === TradeAction.Buy) {
            if (!execution.pnl) {
              trade.pnl += (execution.price - trade.averagePrice) * executionQuantity;
              execution.pnl = (execution.price - trade.averagePrice) * executionQuantity;
            } else trade.pnl += execution.pnl;
          }

          execution.scalingAction =
            execution.action === TradeAction.Sell
              ? ScalingAction.ScaleIn
              : execution.price < trade.averagePrice
              ? ScalingAction.ProfitTaking
              : ScalingAction.StopLoss;

          execution.tradePosition = execution.action === TradeAction.Sell ? trade.openPosition + executionQuantity : trade.openPosition - executionQuantity;
          trade.openPosition = execution.tradePosition;
          execution.avgPrice = trade.averagePrice;
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
}
