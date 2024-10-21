import db from "@/db/db";
import CreateTrades from "@/helpers/create-trade";
import { DasSchema, DasTradeMapper } from "@/helpers/Parsing/das-schema";
import { TradeParser } from "@/helpers/Parsing/trade-parser";
import { Hono } from "hono";

const app = new Hono()

.post("/api/trades", async (c) => {

const {tradeData, account} = await c.req.json<{ account: string; tradeData: string }>();

  const results = await TradeParser.parse<DasSchema>(tradeData, DasTradeMapper, 2024, 10, 1);
  const t = await CreateTrades(results, account);
  const transactions = t.map(trade => {
    const { executions, ...rest } = trade;
    return db.trade.create({
      data:{
        ...rest,
        executions:{create:executions}
      }
    })
  })

  // Delete all trades
  await db.trade.deleteMany({});
  await db.$transaction(transactions);
});

export default app;