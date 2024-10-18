import {Execution, TradeAction} from "@prisma/client";
import { createHash } from "crypto";
import { startOfToday } from "date-fns";
import {fromZonedTime} from "date-fns-tz";

export interface DasSchema {
    Time: string;
    Symbol: string;
    Side: string;
    Price: number;
    Qty: number;
    Account: string;
    ECNFee: number;
    'P / L': number;
    SecType: string;
}

export type TradeMapper<T> = (input: T) => Execution;
export const DasTradeMapper: TradeMapper<DasSchema> = (input: DasSchema) => {
    return {
      ticker: input.Symbol,
      quantity: input.Qty,
      price: input.Price,
      pnl: input["P / L"],
      amount: input.Qty * input.Price,
      date: setTime(input.Time),
      action: input.Side === "B" ? TradeAction.Buy : TradeAction.Sell,
      tradePosition: 0,
      id: createHash("md5")
        .update(input.Time + input.Symbol + input.Side === "B" ? TradeAction.Buy : TradeAction.Sell + input.Price + input.Qty)
        .digest("hex"),
    } as Execution;
}
const setTime = (time: string) => {
    const [hours, min, sec] = time.split(':');
    const today = startOfToday();
    today.setHours(parseInt(hours), parseInt(min), parseInt(sec));
    return fromZonedTime(today, 'America/New_York');

}

export type CommissionOptions = {
    perTrade: number;
    addPerShare: boolean;
    minCommission: number;
    maxCommission: number;
    perShare: number;

}

// function CalculateCommission(input: DasSchema, options: CommissionOptions) {
//     const commission = options.addCommission ? options.perTrade : 0;
//     const perShare = options.addPerShare ? Math.max(options.minCommission, Math.min(options.perShare * input.Qty : 0;
//     return Math.max(options.minCommission, Math.min(options.maxCommission, commission + perShare));
//     return input.Qty * 0.0035;
// }
