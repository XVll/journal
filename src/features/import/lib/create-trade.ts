import { ExecutionInput } from "@/features/import/types";
import {
    Execution,
    Prisma,
    ScalingAction,
    TradeAction,
    TradeDirection,
    TradeResult,
    TradeStatus,
    TradeType
} from "@prisma/client";
import { createHash } from "crypto";

function CalculateCommission(execution: ExecutionInput) {
    // 0.0035 for <300k, 0.0020 for <3m, 0.0015 for <20m
    // You need to calculate monthly volume to determine the commission rate
    return -0.0007 * execution.quantity;
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
        {} as Record<string, ExecutionInput[]>
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

            const firstExecution: Prisma.ExecutionUncheckedCreateWithoutTradeInput = {
                ...firstExecutionInput,
                pnl: 0,
                scalingAction: ScalingAction.Initial,
                tradePosition: firstExecutionInput.quantity,
                avgPrice: firstExecutionInput.price,
                commission: CalculateCommission(firstExecutionInput),
                fees: CalculateFees(firstExecutionInput),
                amount: firstExecutionInput.price * firstExecutionInput.quantity,
                executionHash: createExecutionId(firstExecutionInput)
            };

            const trade: Prisma.TradeUncheckedCreateWithoutExecutionsInput & {
                executions: Prisma.ExecutionUncheckedCreateWithoutTradeInput[];
            } = {
                account: account,
                ticker: ticker,
                type: firstExecution.type || TradeType.Stock,
                startDate: new Date(firstExecution.date),
                direction: firstExecution.action === TradeAction.Buy ? TradeDirection.Long : TradeDirection.Short,
                volume: firstExecution.quantity,
                openPosition: firstExecution.quantity || 0,
                averagePrice: firstExecution.price,
                commission: firstExecution.commission,
                fees: firstExecution.fees,
                pnlNet: firstExecution.pnl,
                pnlGross: firstExecution.pnl + firstExecution.commission + firstExecution.fees,
                status: TradeStatus.Open,
                notes: null,
                endDate: null,
                executionTime: null,
                resultNet: null,
                resultGross: null,
                executions: []
            };

            trade.executions.push(firstExecution);
            trades.push(trade);

            while (executionInputs.length > 0) {
                const executionInput = executionInputs.shift();

                if (!executionInput) {
                    break;
                }

                const execution: Prisma.ExecutionUncheckedCreateWithoutTradeInput = {
                    ...executionInput,
                    pnl: 0,
                    scalingAction: ScalingAction.Initial,
                    tradePosition: 0,
                    avgPrice: 0,

                    commission: CalculateCommission(executionInput),
                    fees: CalculateFees(executionInput),
                    executionHash: createExecutionId(executionInput),
                    amount: executionInput.price * executionInput.quantity
                };
                if (trade.direction === TradeDirection.Long) {
                    let executionQuantity = execution.quantity || 0;
                    // Does execution close the trade? If so, adjust the quantity and add a new execution with the remaining quantity
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
                            (trade.averagePrice * trade.openPosition + execution.price * executionQuantity) / (trade.openPosition + executionQuantity);
                        trade.openPosition += executionQuantity;
                    } else if (execution.action === TradeAction.Sell) {
                        trade.openPosition -= executionQuantity;
                        if (!execution.pnl) {
                            trade.pnlNet += (execution.price - trade.averagePrice) * executionQuantity;
                            execution.pnl = (execution.price - trade.averagePrice) * executionQuantity;
                        } else trade.pnlNet += execution.pnl;
                    }

                    execution.scalingAction =
                        execution.action === TradeAction.Buy
                            ? ScalingAction.ScaleIn
                            : execution.price > trade.averagePrice
                                ? ScalingAction.ProfitTaking
                                : ScalingAction.StopLoss;

                    execution.tradePosition = trade.openPosition;
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
                            (trade.averagePrice * trade.openPosition + execution.price * executionQuantity) / (trade.openPosition + executionQuantity);
                        trade.openPosition += executionQuantity;
                    } else if (execution.action === TradeAction.Buy) {
                        trade.openPosition -= executionQuantity;
                        if (!execution.pnl) {
                            trade.pnlNet += (trade.averagePrice - execution.price) * executionQuantity;
                            execution.pnl = (trade.averagePrice - execution.price) * executionQuantity;
                        } else trade.pnlNet += execution.pnl;
                    }

                    execution.scalingAction =
                        execution.action === TradeAction.Sell
                            ? ScalingAction.ScaleIn
                            : execution.price < trade.averagePrice
                                ? ScalingAction.ProfitTaking
                                : ScalingAction.StopLoss;

                    execution.tradePosition = trade.openPosition;
                    execution.avgPrice = trade.averagePrice;
                }

                if (execution.tradePosition === 0) {
                    trade.endDate = execution.date;
                    trade.executionTime = (new Date(trade.endDate).getTime() - new Date(trade.startDate).getTime()) / 1000;
                    trade.resultNet = trade.pnlNet > 0 ? TradeResult.Win : trade.pnlNet < 0 ? TradeResult.Loss : TradeResult.BreakEven;
                    trade.resultGross = trade.pnlGross > 0 ? TradeResult.Win : trade.pnlGross < 0 ? TradeResult.Loss : TradeResult.BreakEven;
                    trade.pnlGross = trade.pnlNet + trade.commission + trade.fees;
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
