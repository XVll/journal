import { PnlType, Unit } from "@/features/filter/types";
import { Trade, TradeResult } from "@prisma/client";

export const FormatUnit = (input: number | string | undefined | null, unit: Unit): string | undefined => {
    if (input === undefined || input === null) return "";
    let inputNumber = Number(input);
    if (isNaN(inputNumber)) return "";


    if (unit === Unit.Currency) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(Number(inputNumber));
    } else if (unit === Unit.RMultiple) {
        return `${Number(inputNumber).toFixed(2)}R`;
    } else if (unit === Unit.Percent) {
        return `${Number(inputNumber).toFixed(2)}%`;
    }
};
export const Currency = (input: number | string | undefined | null) => {
    if (input === undefined || input === null) return "";

    if (typeof input === "string") {
        input = Number(input);
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(input));
};
export const getTradeResult = (trade: Trade, pnlType: PnlType) => {
    if (pnlType === PnlType.Net) {
        return trade.pnlNet > 0 ? TradeResult.Win : trade.pnlNet < 0 ? TradeResult.Loss : TradeResult.BreakEven;
    } else {
        return trade.pnlGross > 0 ? TradeResult.Win : trade.pnlGross < 0 ? TradeResult.Loss : TradeResult;
    }
};