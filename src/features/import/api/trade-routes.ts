import db from "@/lib/db/db";
import CreateTrades from "@/features/import/lib/create-trade";
import { DasSchema, DasTradeMapper } from "@/features/import/lib/Parsing/das-schema";
import { TradeParser } from "@/features/import/lib/Parsing/trade-parser";
import { Hono } from "hono";
import { TradeStatus, TradeType } from "@prisma/client";

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
})
.get("/trades", async (c) => {
  const trades = await db.trade.findMany({
      //where: {
          //  startDate: {
          //    gte: new Date(2024, 9, 1),
          //     lt: new Date(2024, 10, 1),
          //   },
          // ticker: { contains: "AAPL" },
          // status: TradeStatus.Closed,
          // account: "Cash",
          // direction: "Long",
          // type: TradeType.Stock,
          // volume: { gt: 0 },
          // pnl: { not: 0 },
          // result: { not: "BreakEven" },
          // executionTime: { not: null },
      //},
      include: {
          executions: true,
      },
  });
  return c.json(trades);
});

export default app;