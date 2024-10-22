import db from "@/lib/db/db";
import CreateTrades from "@/features/import/lib/create-trade";
import { DasSchema, DasTradeMapper } from "@/features/import/lib/Parsing/das-schema";
import { TradeParser } from "@/features/import/lib/Parsing/trade-parser";
import { Hono } from "hono";

const app = new Hono().post("/import", async (c) => {
    const { tradeData, account, year, month, day } = await c.req.json<{ tradeData: string; account: string; year: number; month: number; day: number }>();
    console.log(tradeData, account, year, month, day);

    const results = await TradeParser.parse<DasSchema>(tradeData, DasTradeMapper, year, month, day);
    const t = await CreateTrades(results, account);
    const transactions = t.map((trade) => {
        const { executions, ...rest } = trade;
        return db.trade.create({
            data: {
                ...rest,
                executions: { create: executions },
            },
        });
    });

    // Delete all trades
    // await db.trade.deleteMany({});
    await db.$transaction(transactions);
    return c.json({});
});

export default app;