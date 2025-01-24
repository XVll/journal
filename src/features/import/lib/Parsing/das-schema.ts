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
/*
Example Data =>
Time,Order Id,Fill Id,Route,Liq,B/S,Qty,Price,Position,Gross,Comm,Ecn Fee,SEC,ORF,CAT,TAF,OCC,NSCC,Acc,Clr,Misc,Net
10:57:41,0000049339,0000000001,ARCA,RR,B,113,1.66,113,0.00,0.08,0.34,,,0.01,,,0.01,,,,(0.44)
10:58:03,0000049409,0000000001,ARCA,ARE,S,56,1.81,57,8.40,0.04,(0.11),0.01,,0.01,0.01,,0.01,,,,8.43
10:58:16,0000049473,0000000001,ARCA,RR,S,28,1.78,29,3.36,0.02,0.08,0.01,,0.01,0.01,,0.01,,,,3.22
10:58:38,0000049551,0000000001,ARCA,RBD,S,29,1.72,0,1.74,0.02,0.09,0.01,,0.01,0.01,,0.01,,,,1.59
11:00:30,0000049829,0000000001,ARCA,RR,B,2,1.68,2,0.00,0.00,0.01,,,0.01,,,,,,,(0.02)
11:00:30,0000049829,0000000002,ARCA,RR,B,1,1.68,3,0.00,0.00,0.00,,,0.01,,,,,,,(0.01)
11:00:30,0000049829,0000000003,ARCA,RR,B,53,1.68,56,0.00,0.04,0.16,,,0.01,,,0.01,,,,(0.22)
11:01:54,0000049971,0000000001,ARCA,X,B,59,1.57,115,0.00,0.04,0.21,,,0.01,,,0.01,,,,(0.27)
11:02:03,0000049993,0000000001,ARCA,ARE,S,115,1.63,0,0.74,0.08,(0.23),0.01,,0.01,0.02,,0.01,,,,0.84
 */
export interface OceanSchema {
    Time: string;

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
/*
Example Data =>
Time,Order Id,Fill Id,Route,Liq,B/S,Qty,Price,Position,Gross,Comm,Ecn Fee,SEC,ORF,CAT,TAF,OCC,NSCC,Acc,Clr,Misc,Net
10:57:41,0000049339,0000000001,ARCA,RR,B,113,1.66,113,0.00,0.08,0.34,,,0.01,,,0.01,,,,(0.44)
10:58:03,0000049409,0000000001,ARCA,ARE,S,56,1.81,57,8.40,0.04,(0.11),0.01,,0.01,0.01,,0.01,,,,8.43
10:58:16,0000049473,0000000001,ARCA,RR,S,28,1.78,29,3.36,0.02,0.08,0.01,,0.01,0.01,,0.01,,,,3.22
10:58:38,0000049551,0000000001,ARCA,RBD,S,29,1.72,0,1.74,0.02,0.09,0.01,,0.01,0.01,,0.01,,,,1.59
11:00:30,0000049829,0000000001,ARCA,RR,B,2,1.68,2,0.00,0.00,0.01,,,0.01,,,,,,,(0.02)
11:00:30,0000049829,0000000002,ARCA,RR,B,1,1.68,3,0.00,0.00,0.00,,,0.01,,,,,,,(0.01)
11:00:30,0000049829,0000000003,ARCA,RR,B,53,1.68,56,0.00,0.04,0.16,,,0.01,,,0.01,,,,(0.22)
11:01:54,0000049971,0000000001,ARCA,X,B,59,1.57,115,0.00,0.04,0.21,,,0.01,,,0.01,,,,(0.27)
11:02:03,0000049993,0000000001,ARCA,ARE,S,115,1.63,0,0.74,0.08,(0.23),0.01,,0.01,0.02,,0.01,,,,0.84
11:11:13,0000051210,0000000001,ARCA,RR,B,61,1.53,61,0.00,0.04,0.18,,,0.01,,,0.01,,,,(0.25)
11:17:44,0000051965,0000000001,ARCA,RR,S,61,1.39,0,(8.54),0.04,0.18,0.01,,0.01,0.02,,0.01,,,,(8.82)
*/
export const OceanTradeMapper: TradeMapper<OceanSchema> = (input: OceanSchema, year: number, month: number, day: number) => {
    return {
    } as ExecutionInput;
}
