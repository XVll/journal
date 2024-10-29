import { TradeAction, ScalingAction, TradeType, Execution, TradeDirection, TradeStatus, TradeResult, Trade, Prisma } from "@prisma/client";
import { z } from "zod";
import { TradeWithExecutions } from "./types";

export const ExecutionSchema = z.object({
    id: z.string(),
    date: z.date(),
    ticker: z.string(),
    action: z.nativeEnum(TradeAction),
    quantity: z.number(),
    amount: z.number(),
    tradePosition: z.number(),
    price: z.number(),
    avgPrice: z.number(),
    scalingAction: z.nativeEnum(ScalingAction),
    pnl: z.number(),
    tradeId: z.string(),
    fees: z.number(),
    commission: z.number(),
    addLiquidity: z.boolean(),
    executionHash: z.string(),
    type: z.nativeEnum(TradeType),
}) satisfies z.Schema<Execution>;
export const ExecutionInputSchema = ExecutionSchema.omit({
    id: true,
    amount: true,
    tradePosition: true,
    avgPrice: true,
    scalingAction: true,
    pnl: true,
    tradeId: true,
}).extend({
    type: z.nativeEnum(TradeType),
}); 

export const TradeSchema = z.object({
    id: z.string(),
    account: z.string(),
    startDate: z.date(),
    endDate: z.date().nullable(),
    executionTime: z.number().nullable(),
    ticker: z.string(),
    direction: z.nativeEnum(TradeDirection),
    type: z.nativeEnum(TradeType),
    status: z.nativeEnum(TradeStatus),
    volume: z.number(),
    openPosition: z.number(),
    averagePrice: z.number(),
    commission: z.number(),
    fees: z.number(),
    pnl: z.number(),
    result: z.nativeEnum(TradeResult).nullable(),
    notes: z.string().nullable(),
}) satisfies z.Schema<Trade>;


export const ExecutionCreateSchema = ExecutionSchema.omit({ id: true }) satisfies z.Schema<Prisma.ExecutionUncheckedCreateWithoutTradeInput>;

export const TradeWithExecutionsSchema = TradeSchema.extend({
  executions: z.array(ExecutionSchema),
}) satisfies z.Schema<TradeWithExecutions>;
  