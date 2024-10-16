enum TradeAction {
    Buy,
    Sell,
    Short,
    Cover,
}

enum TradeDirection {
    Long,
    Short,
}

enum TradeType {
    Stock,
    Option,
    Future,
    Forex,
    Crypto,
}

enum TradeStatus {
    Open, Closed
}
enum TradeResult {
    Win, Loss, BreakEven
}

export interface Trade {
    id: string;
    startDate: Date;
    endDate: Date;
    executionTime: number;
    ticker: string;
    direction: TradeDirection;
    type: TradeType;
    status: TradeStatus;
    volume: number;
    startPrice: number;
    endPrice: number;
    averagePrice: number;
    amount: number;
    commission: number;
    fees: number;
    pnl: number;
    result: TradeResult;
    notes: string;
    executions: Execution[];
}

export interface Execution {
    id: string;// abc
    date: Date; // 2021-01-01
    ticker: string; // AAPL
    action: TradeAction; // Buy
    quantity: number; // +100
    price: number; // 100
    amount: number; // 10000
    commission: number; // 0
    tradePosition: number; // 0
    fees: number; // 0
    pnl: number;
}

// AAPL  2021-01-01  Buy  1000  100  0  10000  0  0