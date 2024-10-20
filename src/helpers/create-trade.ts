import { Execution, ScalingAction, TradeAction, TradeDirection, TradeResult, TradeStatus, TradeType } from "@prisma/client";
import { createHash } from "crypto";
import { ExecutionInput, TradeWithExecutions } from "../../prisma/types";
import { isDate } from "date-fns";

function CalculateCommission(execution: ExecutionInput) {
    // 0.0035 for <300k, 0.0020 for <3m, 0.0015 for <20m
    // You need to calculate monthly volume to determine the commission rate
    return -0.002 * execution.quantity;
}
function CalculateFees(execution: ExecutionInput) {
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
function createExecutionId(input: ExecutionInput) {
    return createHash("md5")
        .update(input.date.toISOString() + input.ticker + input.action + input.price + input.quantity)
        .digest("hex");
}

export default async function CreateTrades(inputs: ExecutionInput[], account: string) {
    // Group by ticker
    const groupedExecutionInputs = inputs.reduce(
        (acc, execution) => {
            if (!acc[execution.ticker]) {
                acc[execution.ticker] = [];
            }
            acc[execution.ticker].push(execution);
            return acc;
        },
        {} as Record<string, ExecutionInput[]>,
    );

    const trades = [];

    // Sort executions by date
    for (const ticker in groupedExecutionInputs) {
        const executionInputs = groupedExecutionInputs[ticker].sort((a, b) => a.date.getTime() - b.date.getTime());

        if (executionInputs.length === 0) {
            continue;
        }

        while (executionInputs.length > 0) {
            // Start from the first execution and create a trade
            const firstExecutionInput = executionInputs.shift();

            if (!firstExecutionInput) {
                continue;
            }

            const firstExecution: Execution = {
                ...firstExecutionInput,
                pnl: 0,
                scalingAction: ScalingAction.Initial,
                tradePosition: firstExecutionInput.quantity,
                avgPrice: firstExecutionInput.price,
                commission: CalculateCommission(firstExecutionInput),
                fees: CalculateFees(firstExecutionInput),
                amount: firstExecutionInput.price * firstExecutionInput.quantity,
                executionHash: createExecutionId(firstExecutionInput),
                tradeId: "",
                id: "",
            };

            const trade: TradeWithExecutions = {
                id: "",
                account: account,
                ticker: ticker,
                type: TradeType.Stock,
                notes: "",
                startDate: isDate(firstExecution.date) ? firstExecution.date : new Date(),
                direction: firstExecution.action === TradeAction.Buy ? TradeDirection.Long : TradeDirection.Short,
                volume: firstExecution.quantity,
                buyVolume: firstExecution.action === TradeAction.Buy ? firstExecution.quantity : 0,
                sellVolume: firstExecution.action === TradeAction.Sell ? firstExecution.quantity : 0,
                openPosition: firstExecution.quantity || 0,
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

            while (executionInputs.length > 0) {
                const executionInput = executionInputs.shift();

                if (!executionInput) {
                    break;
                }

                    const execution: Execution = {
                        ...executionInput,
                        pnl: 0,
                        scalingAction: ScalingAction.Initial,
                        tradePosition: 0,
                        avgPrice: 0,

                        commission: CalculateCommission(executionInput),
                        fees: CalculateFees(executionInput),
                        executionHash: createExecutionId(executionInput),
                        amount: executionInput.price * executionInput.quantity,
                        tradeId: "",
                        id: "",
                    };
                if (trade.direction === TradeDirection.Long) {
                    let executionQuantity = execution.quantity || 0;
                    // Does execution closes the trade ? If so, adjust the quantity and add a new execution with the remaining quantity
                    // If the execution is a sell and it partially closes the trade, add a new execution with the remaining quantity and it will appear as a short trade
                    if (execution.action === TradeAction.Sell && trade.openPosition < execution.quantity) {
                        executionQuantity = trade.openPosition;
                        const newExecutionInput = { ...executionInput };
                        newExecutionInput.quantity = executionInput.quantity - trade.openPosition;
                        executionInputs.unshift(newExecutionInput);
                    }

                    trade.volume += executionQuantity;
                    trade.commission += execution.commission;
                    trade.fees += execution.fees;

                    if (execution.action === TradeAction.Buy) {
                        trade.averagePrice =
                            (trade.averagePrice * trade.buyVolume + execution.price * executionQuantity) / (trade.buyVolume + executionQuantity);
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

                    execution.tradePosition =
                        execution.action === TradeAction.Buy ? trade.openPosition + executionQuantity : trade.openPosition - executionQuantity;
                    trade.openPosition = execution.tradePosition;
                    execution.avgPrice = trade.averagePrice;
                } else if (trade.direction === TradeDirection.Short) {
                    let executionQuantity = executionInput?.quantity || 0;

                    // Does execution closes the trade ? If so, adjust the quantity and add a new execution with the remaining quantity
                    // If the execution is a sell and it partially closes the trade, add a new execution with the remaining quantity and it will appear as a short trade
                    if (execution.action === TradeAction.Buy && trade.openPosition < execution.quantity) {
                        executionQuantity = trade.openPosition;
                        const newExecutionInput = { ...executionInput };
                        newExecutionInput.quantity = executionInput.quantity - trade.openPosition;
                        executionInputs.unshift(newExecutionInput);
                    }

                    trade.volume += executionQuantity;
                    trade.commission += execution.commission;
                    trade.fees += execution.fees;

                    if (execution.action === TradeAction.Sell) {
                        trade.averagePrice =
                            (trade.averagePrice * trade.sellVolume + execution.price * executionQuantity) / (trade.sellVolume + executionQuantity);
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

                    execution.tradePosition =
                        execution.action === TradeAction.Sell ? trade.openPosition + executionQuantity : trade.openPosition - executionQuantity;
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
