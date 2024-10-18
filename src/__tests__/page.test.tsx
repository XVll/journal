import CreateTrades from "@/helpers/create-trade";
import { DasSchema, DasTradeMapper } from "@/helpers/Parsing/das-schema";
import { TradeParser } from "@/helpers/Parsing/trade-parser";
import { TradeResult, TradeStatus } from "@prisma/client";
import { expect, test } from "vitest";

test("Splits closing trade to another trade with remaining quantity", async () => {
  const data =
    "Time,Symbol,Side,Price,Qty,P / L,SecType,\n" +
    "04:30:00,STEC,B,2.00,2000,0.00,Equity/ETF,\n" +
    "05:31:00,STEC,S,3.00,1000,0.00,Equity/ETF,\n" +
    "05:32:00,STEC,S,3.00,2000,0.00,Equity/ETF,\n";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const account = "123";
  const trades = await CreateTrades(results, account);
  expect(trades).length(2);
  expect(trades[0].openPosition).toBe(0);
  expect(trades[1].openPosition).toBe(1000);
  expect(trades[1].direction).toBe("Short");
  expect(trades[0].direction).toBe("Long");
  expect(trades[0].result).toBe(TradeResult.Win);
  expect(trades[1].result).toBe(null);
  expect(trades[0].status).toBe(TradeStatus.Closed);
  expect(trades[1].status).toBe(TradeStatus.Open);
});
test("Handling Open trades", async () => {
  const data = "Time,Symbol,Side,Price,Qty,P / L,SecType,\n" + "04:30:00,STEC,B,2.00,2000,0.00,Equity/ETF,\n" + "05:31:00,STEC,S,3.00,1000,0.00,Equity/ETF,\n";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const account = "123";
  const trades = await CreateTrades(results, account);
  expect(trades).length(1);
  expect(trades[0].openPosition).toBe(1000);
  expect(trades[0].direction).toBe("Long");
  expect(trades[0].result).toBe(null);
  expect(trades[0].status).toBe(TradeStatus.Open);
});

test("Handles Scaling In/Out", async () => {
  const data =
    "Time,Symbol,Side,Price,Qty,P / L,SecType,\n" +
    "04:30:00,STEC,B,2.00,2000,0.00,Equity/ETF,\n" +
    "05:31:00,STEC,S,3.00,1000,0.00,Equity/ETF,\n" +
    "05:32:00,STEC,B,4.00,4000,0.00,Equity/ETF,\n" +
    "05:33:00,STEC,S,2.00,1000,0.00,Equity/ETF,\n" +
    "05:38:00,STEC,S,8.00,4000,0.00,Equity/ETF,\n";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const account = "123";
  const trades = await CreateTrades(results, account);

  expect(trades).length(1);
  expect(trades[0].startDate.getHours()).toBe(11);
  expect(trades[0].startDate.getMinutes()).toBe(30);
  expect(trades[0].startDate.getSeconds()).toBe(0);
  expect(trades[0].endDate!.getHours()).toBe(12);
  expect(trades[0].endDate!.getMinutes()).toBe(38);
  expect(trades[0].endDate!.getSeconds()).toBe(0);
  expect(trades[0].direction).toBe("Long");
  expect(trades[0].volume).toBe(12000);
  expect(trades[0].buyVolume).toBe(6000);
  expect(trades[0].sellVolume).toBe(6000);
  expect(trades[0].openPosition).toBe(0);
  expect(trades[0].averagePrice).toBeCloseTo(3.3333);
  // Commission should be 0.0035 * 12000
  // expect(trades[0].commission).toBeCloseTo(42);
  // Fees should be 0
  // expect(trades[0].fees).toBe(0);
  // PnL should be 17000
  expect(trades[0].pnl).toBeCloseTo(18333.3333);
  expect(trades[0].result).toBe("Win");
  expect(trades[0].status).toBe("Closed");
  expect(trades[0].executionTime).toBe(4080);
  expect(trades[0].executions).length(5);
});

test("Handles Scaling In/Out Short", async () => {
  const data =
    "Time,Symbol,Side,Price,Qty,P / L,SecType,\n" +
    "04:30:00,STEC,S,2.00,2000,0.00,Equity/ETF,\n" +
    "05:31:00,STEC,B,3.00,1000,0.00,Equity/ETF,\n" +
    "05:32:00,STEC,S,4.00,4000,0.00,Equity/ETF,\n" +
    "05:33:00,STEC,B,2.00,1000,0.00,Equity/ETF,\n" +
    "05:38:00,STEC,B,8.00,4000,0.00,Equity/ETF,\n";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const account = "123";
  const trades = await CreateTrades(results, account);

  // There should be 1 trade
  expect(trades).length(1);
  // Start time of trade should be GMT Today 08:30:00
  expect(trades[0].startDate.getHours()).toBe(11);
  expect(trades[0].startDate.getMinutes()).toBe(30);
  expect(trades[0].startDate.getSeconds()).toBe(0);
  // End date of trade should be GMT Today 09:38:00
  expect(trades[0].endDate!.getHours()).toBe(12);
  expect(trades[0].endDate!.getMinutes()).toBe(38);
  expect(trades[0].endDate!.getSeconds()).toBe(0);
  // Direction should be Long
  expect(trades[0].direction).toBe("Short");
  // Volume should be 12000
  expect(trades[0].volume).toBe(12000);
  // Buy Volume should be 6000
  expect(trades[0].buyVolume).toBe(6000);
  // Sell Volume should be 6000
  expect(trades[0].sellVolume).toBe(6000);
  // Open Position should be 0
  expect(trades[0].openPosition).toBe(0);
  // Average Price should be 3.333333333...
  expect(trades[0].averagePrice).toBeCloseTo(3.3333);
  // Commission should be 0.0035 * 12000
  // expect(trades[0].commission).toBeCloseTo(42);
  // Fees should be 0
  // expect(trades[0].fees).toBe(0);
  // PnL should be 17000
  expect(trades[0].pnl).toBeCloseTo(18333.3333);
  // Result should be Win
  expect(trades[0].result).toBe("Win");
  // Status should be Closed
  expect(trades[0].status).toBe("Closed");
  // Execution Time should be 68 * 60 seconds
  expect(trades[0].executionTime).toBe(4080);
  // There should be 5 executions
  expect(trades[0].executions).length(5);
});

test("Handles Time as is if its same.", async () => {
  const data =
    "Time,Symbol,Side,Price,Qty,P / L,SecType,\n" +
    "04:30:00,STEC,S,2.00,2000,0.00,Equity/ETF,\n" +
    "04:30:00,STEC,B,3.00,1000,0.00,Equity/ETF,\n" +
    "04:30:00,STEC,S,4.00,4000,0.00,Equity/ETF,\n" +
    "04:30:00,STEC,B,2.00,1000,0.00,Equity/ETF,\n" +
    "04:30:00,STEC,B,8.00,4000,0.00,Equity/ETF,\n";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const account = "123";
  const trades = await CreateTrades(results, account);

  // There should be 1 trade
  expect(trades).length(1);
  // Start time of trade should be GMT Today 08:30:00
  expect(trades[0].startDate.getHours()).toBe(11);
  expect(trades[0].startDate.getMinutes()).toBe(30);
  expect(trades[0].startDate.getSeconds()).toBe(0);
  // End date of trade should be GMT Today 09:38:00
  expect(trades[0].endDate!.getHours()).toBe(11);
  expect(trades[0].endDate!.getMinutes()).toBe(30);
  expect(trades[0].endDate!.getSeconds()).toBe(0);
  // Direction should be Long
  expect(trades[0].direction).toBe("Short");
  // Volume should be 12000
  expect(trades[0].volume).toBe(12000);
  // Buy Volume should be 6000
  expect(trades[0].buyVolume).toBe(6000);
  // Sell Volume should be 6000
  expect(trades[0].sellVolume).toBe(6000);
  // Open Position should be 0
  expect(trades[0].openPosition).toBe(0);
  // Average Price should be 3.333333333...
  expect(trades[0].averagePrice).toBeCloseTo(3.3333);
  // Commission should be 0.0035 * 12000
  // expect(trades[0].commission).toBeCloseTo(42);
  // Fees should be 0
  // expect(trades[0].fees).toBe(0);
  // PnL should be 17000
  expect(trades[0].pnl).toBeCloseTo(18333.3333);
  // Result should be Win
  expect(trades[0].result).toBe("Win");
  // Status should be Closed
  expect(trades[0].status).toBe("Closed");
  // Execution Time should be 68 * 60 seconds
  expect(trades[0].executionTime).toBe(0);
  // There should be 5 executions
  expect(trades[0].executions).length(5);
});
