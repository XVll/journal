import {TradeAction} from "@prisma/client";
import {fromZonedTime} from "date-fns-tz";
import { ExecutionInput } from "../../types";

export interface DasSchema {
    Time: string;
    Symbol: string;
    Side: string;
    Price: number;
    Qty: number;
    ECNFee: number;
    SecType: string;
    Liq: string;
}

export type TradeMapper<T> = (input: T, year: number, month: number, day: number) => ExecutionInput;
export const DasTradeMapper: TradeMapper<DasSchema> = (input: DasSchema, year, month, day) => {
  return {
    ticker: input.Symbol,
    quantity: input.Qty,
    price: input.Price,
    date: setTime(input.Time, year, month, day),
    action: input.Side === "B" ? TradeAction.Buy : TradeAction.Sell,
    addLiquidity: input.Liq === "+",
    type: input.SecType === "Equity/ETF" ? "Stock" : null,
  } as ExecutionInput;
};
const setTime = (time: string, year:number, month:number, day:number) => {
  const [hours, min, sec] = time.split(":");
  const d = new Date(year, month , day, parseInt(hours), parseInt(min), parseInt(sec));
  return fromZonedTime(d, "America/New_York");
}

