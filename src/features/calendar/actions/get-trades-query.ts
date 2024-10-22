"use server"
import db from "@/lib/db/db";

export const getTradesQuery = async () => {
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

    return trades;
}