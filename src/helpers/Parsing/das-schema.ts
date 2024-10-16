import {Execution} from "@prisma/client";
import {startOfToday} from "date-fns";
import {fromZonedTime, toZonedTime} from "date-fns-tz";

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

/* Execution
* ScalingAction: Calculate the scaling action based on the previous trade
* TradePosition: Calculate the trade position based on the previous trade
* Action: Calculate the action based on the Side and the previous trade
* AvgPrice: Calculate the average price of the trade after this execution
* Date set the date to the current date and time to gmt (data is in eastern time)
*/

/*
* Trade
* Equity/ETF
* Commissions: Add a checkbox to add commissions if there is none in the data
* Fees: Add a checkbox to add fees if there is none in the data
 */
export type TradeMapper<T> = (input: T) => Execution;
export const DasTradeMapper: TradeMapper<DasSchema> = (input: DasSchema) => {
    return {
        ticker: input.Symbol,
        quantity: input.Qty,
        price: input.Price,
        pnl: input['P / L'],
        amount: input.Qty * input.Price,
        date: setTime(input.Time),
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
