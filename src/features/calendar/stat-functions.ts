import db from "@/lib/db/db";
import { Trade, TradeStatus, TradeType } from "@prisma/client";

export const CalculateTotalPnL = (trades: Trade[]) => {
    // Total PnL is the sum of all trades' PnL Winning - Losing
    return trades.reduce((acc, trade) => {
        return acc + trade.pnl;
    }, 0);
}

export const CalculateTotalTrades = async () => {
    return trades.length;
}