import db from "@/lib/db/db";
import CreateTrades from "@/features/import/lib/create-trade";
import { DasSchema, DasTradeMapper } from "@/features/import/lib/Parsing/das-schema";
import { TradeParser } from "@/features/import/lib/Parsing/trade-parser";
import { Hono } from "hono";
import { TradeStatus, TradeType } from "@prisma/client";
import superjson from "superjson";
import { FilterSchema, FilterState } from "@/features/filter/hooks/use-filters";
import { z } from "zod";
import { endOfMonth, startOfMonth } from "date-fns";
import qs from "qs";

const app = new Hono()
    .post("/import", async (c) => {
        const { tradeData, account, year, month, day } = await c.req.json<{
            tradeData: string;
            account: string;
            year: number;
            month: number;
            day: number
        }>();

        const results = await TradeParser.parse<DasSchema>(tradeData, DasTradeMapper, year, month, day);
        const t = await CreateTrades(results, account);
        const transactions = t.map((trade) => {
            const { executions, ...rest } = trade;
            return db.trade.create({
                data: {
                    ...rest,
                    executions: { create: executions }
                }
            });
        });

        // Delete all trades
        // await db.trade.deleteMany({});
        await db.$transaction(transactions);
        return c.json({});
    })
    .get("/trades", async (c) => {
        const { query } = c.req.query();
        const parsedFilter = qs.parse(query);
        const filters = FilterSchema.parse(parsedFilter);

        const startDate = filters?.dateRange?.from || startOfMonth(new Date());
        const endDate = filters?.dateRange?.to || endOfMonth(new Date());

        const trades = await db.trade.findMany({
            where: {
                startDate: {
                    gte: startDate,
                    lt: endDate
                }
            }
            //where: {
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
        });
        const resp = superjson.serialize(trades);
        return c.json(resp);

    })
    .get("/trade/:id", async (c) => {
        const { id } = c.req.param();
        const trade = await db.trade.findUnique({
            where: {
                id: id
            },
            include: {
                executions: true
            }
        });
        return c.json(trade);
    })
;

export default app;