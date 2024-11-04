import { TradeResult } from "@prisma/client";
import { PnlType, Unit } from "@/features/filter/types";

export class Stats {
    unit: Unit = Unit.Currency; // Daily.Ok
    pnlType: PnlType = PnlType.Net; // Daily.Ok

    scores: {
        overall: number;
        avgWinLoss: number;
        winRate: number;
        profitFactor: number;
        consistency: number;
        riskManagement: number;
    } = {
        overall: 0,
        avgWinLoss: 0,
        winRate: 0,
        profitFactor: 0,
        consistency: 0,
        riskManagement: 0
    };
    profitCurrency: number = 0; // Daily.Ok Overall.Ok
    profitPercent: number = 0; // Daily.Ok Overall.Ok
    profitR: number = 0; // Daily.Ok Overall.Ok
    lossCurrency: number = 0; // Daily.Ok Overall.Ok
    lossPercent: number = 0; // Daily.Ok Overall.Ok
    lossR: number = 0; // Daily.Ok Overall.Ok

    _commissionsCurrency: number = 0; // Daily.Ok Overall.Ok
    _feesCurrency: number = 0; // Daily.Ok Overall.Ok
    _commissionsPercent: number = 0; // Daily.Ok Overall.Ok
    _feesPercent: number = 0; // Daily.Ok Overall.Ok
    _commissionsR: number = 0; // Daily.Ok Overall.Ok
    _feesR: number = 0; // Daily.Ok Overall.Ok

    _largestGrossGain: number = 0; // Daily.Ok Overall.Ok
    _largestNetGain: number = 0; // Daily.Ok Overall.Ok
    _largestNetLoss: number = 0; // Daily.Ok Overall.Ok
    _largestGrossLoss: number = 0; // Daily.Ok Overall.Ok
    maxConsecutiveGrossWins: number = 0; // Daily.Ok Overall.Ok
    maxConsecutiveNetWins: number = 0; // Daily.Ok Overall.Ok
    maxConsecutiveNetLoss: number = 0; // Daily.Ok Overall.Ok
    maxConsecutiveGrossLoss: number = 0; // Daily.Ok Overall.Ok

    winCount: number = 0; // Daily.Ok Overall.Ok
    lossCount: number = 0; // Daily.Ok Overall.Ok
    breakEvenCount: number = 0; // Daily.Ok Overall.Ok
    days: number = 0; // Daily.Ok Overall.Ok
    holdTimeWin: number = 0; // Daily.Ok Overall.Ok
    holdTimeLoss: number = 0; // Daily.Ok Overall.Ok
    holdTimeBreakEven: number = 0; // Daily.Ok Overall.Ok
    volume: number = 0; // Daily.Ok Overall.Ok

    constructor(unit: Unit, pnlType: PnlType) {
        this.unit = unit;
        this.pnlType = pnlType;
    }

    get largestGain() {
        return this.pnlType === PnlType.Gross ? this._largestGrossGain : this._largestNetGain;
    }

    get largestLoss() {
        return this.pnlType === PnlType.Gross ? this._largestGrossLoss : this._largestNetLoss;
    }

    get maxConsecutiveWins() {
        return this.pnlType === PnlType.Gross ? this.maxConsecutiveGrossWins : this.maxConsecutiveNetWins;
    }

    set maxConsecutiveWins(value: number) {
        if (this.pnlType === PnlType.Gross) this.maxConsecutiveGrossWins = value; else this.maxConsecutiveNetWins = value;
    }

    get maxConsecutiveLoss() {
        return this.pnlType === PnlType.Gross ? this.maxConsecutiveGrossLoss : this.maxConsecutiveNetLoss;
    }

    set maxConsecutiveLoss(value: number) {
        if (this.pnlType === PnlType.Gross) this.maxConsecutiveGrossLoss = value; else this.maxConsecutiveNetLoss = value;
    }

    get commissions() {
        switch (this.unit) {
            case Unit.Currency:
                return this._commissionsCurrency;
            case Unit.Percent:
                return this._commissionsPercent;
            case Unit.RMultiple:
                return this._commissionsR;
        }
    }

    get fees() {
        switch (this.unit) {
            case Unit.Currency:
                return this._feesCurrency;
            case Unit.Percent:
                return this._feesPercent;
            case Unit.RMultiple:
                return this._feesR;
        }
    }

    profit() {
        switch (this.unit) {
            case Unit.Currency:
                return  this.profitCurrency;
            case Unit.Percent:
                return  this.profitPercent;
            case Unit.RMultiple:
                return  this.profitR;
        }
    }

    loss() {
        switch (this.unit) {
            case Unit.Currency:
                return  this.lossCurrency;
            case Unit.Percent:
                return this.lossPercent;
            case Unit.RMultiple:
                return this.lossR;
        }
    }

    get pnl() {
        return this.profit() + this.loss();
    }

    get result() {
        if (this.pnl > 0) return TradeResult.Win;
        if (this.pnl < 0) return TradeResult.Loss;
        return TradeResult.BreakEven;
    }

    get tradeCount() {
        return this.winCount + this.lossCount + this.breakEvenCount;
    }

    get avgWin() {
        return this.winCount ? this.profit() / this.winCount : 0;
    }

    get avgLoss() {
        return this.lossCount ? this.loss() / this.lossCount : 0;
    }

    get avgWinLossRatio() {
        return Math.abs(this.avgLoss ? this.avgWin / this.avgLoss : this.avgWin);
    }

    get profitFactor() {
        return this.loss() ? this.profit() / Math.abs(this.loss()) : this.profit();
    }

    get lossFactor() {
        return this.profit() ? this.loss() / Math.abs(this.profit()) : this.loss();
    }

    get winRate() {
        return this.tradeCount ? (this.winCount / this.tradeCount) * 100 : 0;
    }

    get lossRate() {
        return this.tradeCount ? (this.lossCount / this.tradeCount) * 100 : 0;
    }

    get breakEvenRate() {
        return this.tradeCount ? (this.breakEvenCount / this.tradeCount) * 100 : 0;
    }

    get avgPerShareGainLoss() {
        return this.volume ? this.pnl / (this.volume / 2) : 0;
    }

    get avgTradeGainLoss() {
        return this.tradeCount ? this.pnl / this.tradeCount : 0;
    }

    get avgDailyGainLoss() {
        return this.days ? this.pnl / this.days : 0;
    }

    get avgHoldTimeWin() {
        return this.winCount ? this.holdTimeWin / this.winCount : 0;
    }

    get avgHoldTimeLoss() {
        return this.lossCount ? this.holdTimeLoss / this.lossCount : 0;
    }

    get avgHoldTimeBreakEven() {
        return this.breakEvenCount ? this.holdTimeBreakEven / this.breakEvenCount : 0;
    }

    get avgDailyVolume() {
        return this.volume ? this.volume / this.days : 0;
    }

    get avgTradeVolume() {
        return this.volume ? this.volume / this.tradeCount : 0;
    }
}

export class DailyStats extends Stats {
    date: Date;

    constructor(date: Date, unit: Unit, pnlType: PnlType) {
        super(unit, pnlType);
        this.date = date;
    }
}

export type CalendarWeekStats = {
    weekNumber: number;
    result: TradeResult;
    pnl: number;
    trades: number;
};
export type CalendarMonthStats = {
    month: number;
    result: TradeResult;
    pnl: number;
    trades: number;
};
export type ProfitTarget = {
    dailyProfit: number;
    dailyMaxLoss: number;
    weekly: number;
    monthly: number;
};
