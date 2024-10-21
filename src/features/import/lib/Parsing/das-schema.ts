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
  // console.log(new UTCDate(2024, 0, 1, 18, 0, 0)); // This will display same for both local and UTC
  // console.log(fromZonedTime(new Date(2024, 0, 1, 4, 30, 0), "America/New_York").toLocaleString()); // This is like setting time with US local time

  const [hours, min, sec] = time.split(":");
  const d = new Date(year, month - 1, day, parseInt(hours), parseInt(min), parseInt(sec));
  return fromZonedTime(d, "America/New_York");
}

