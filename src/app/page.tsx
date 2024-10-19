import { TradeParser } from "@/helpers/Parsing/trade-parser";
import { DasSchema, DasTradeMapper } from "@/helpers/Parsing/das-schema";
import CreateTrades from "@/helpers/create-trade";
import { DataTable } from "./trades/data-table";
import { columns} from "./trades/columns";
import { TradeDetails } from "./trades/trade-detail";
import { BasicCalendar } from "@/components/custom/basic-calendar";
import { AdvancedCalendar } from "@/components/custom/advanced-calendar";

export default async function Home() {
  const data =
  "Time,Symbol,Side,Price,Qty,Route,Broker,Account,Type,Cloid,Liq,ECNFee,P / L,SecType,LiqType,BP,Value,P/L R,\n" +
  "04:32:30,UPXI,S,6,471,SMRT,,TRIB14396,Margin,AUTO,-,0,65.94,Equity/ETF,,3023.82,2826,,\n" +
  "04:32:15,UPXI,S,6.02,471,SMRT,,TRIB14396,Margin,AUTO,+,0,75.36,Equity/ETF,,3061.5,2835.42,,\n" +
  "04:32:05,UPXI,S,6,942,SMRT,,TRIB14396,Margin,AUTO,+,0,131.88,Equity/ETF,,6047.64,5652,,\n" +
  "04:31:57,UPXI,S,6.5,1884,SMRT,,TRIB14396,Margin,AUTO,+,0,1205.76,Equity/ETF,,15863.3,12246,,\n" +
  "04:31:36,UPXI,B,5.86,3768,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-22080.5,22080.5,,\n" +
  "04:29:00,PEGY,S,11.21,556,SMRT,,TRIB14396,Margin,AUTO,-,0,-105.64,Equity/ETF,,5915.84,6232.76,,\n" +
  "04:28:41,PEGY,S,11.7,555,SMRT,,TRIB14396,Margin,AUTO,+,0,166.50,Equity/ETF,,6993,6493.5,,\n" +
  "04:28:33,PEGY,B,11.4,1111,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-12665.4,12665.4,,\n" +
  "04:53:23,JDZG,S,2.9,6000,SMRT,,TRIB14396,Margin,AUTO,-,0,240.00,Equity/ETF,,69600,17400,,\n" +
  "04:52:53,JDZG,B,2.86,6000,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-68640,17160,,\n" +
  "10:20:48,DRUG,S,50.5,148,SMRT,,TRIB14396,Margin,AUTO,-,0,310.80,Equity/ETF,,8406.4,7474,,\n" +
  "10:20:43,DRUG,B,48.4,148,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-7163.2,7163.2,,\n" +
  "10:07:49,DRUG,S,47.32,152,SMRT,,TRIB14396,Margin,AUTO,-,0,10.64,Equity/ETF,,7224.56,7192.64,,\n" +
  "07:09:08,PEGY,S,10.22,599,SMRT,,TRIB14396,Margin,AUTO,-,0,-95.84,Equity/ETF,,5834.26,6121.78,,\n" +
  "07:09:04,PEGY,S,10.5,599,SMRT,,TRIB14396,Margin,AUTO,-,0,71.88,Equity/ETF,,6505.14,6289.5,,\n" +
  "10:07:31,DRUG,B,47.25,152,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-7182,7182,,\n" +
  "07:08:45,PEGY,B,10.38,1198,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-12435.2,12435.2,,\n" +
  "04:09:04,TNON,S,6.12,904,SMRT,,TRIB14396,Margin,AUTO,-,0,-72.32,Equity/ETF,,5315.52,5532.48,,\n" +
  "04:08:54,TNON,S,6.33,903,SMRT,,TRIB14396,Margin,AUTO,-,0,117.39,Equity/ETF,,6068.16,5715.99,,\n" +
  "09:53:30,VTAK,S,1.65,2054,SMRT,,TRIB14396,Margin,AUTO,-,0,184.86,Equity/ETF,,13556.4,3389.1,,\n" +
  "04:08:48,TNON,S,6.2,1807,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,11203.4,11203.4,,\n" +
  "04:08:42,TNON,B,6.2,3614,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-22406.8,22406.8,,\n" +
  "04:08:04,TNON,S,5.95,1875,SMRT,,TRIB14396,Margin,AUTO,-,0,93.75,Equity/ETF,,11437.5,11156.2,,\n" +
  "04:07:54,TNON,B,5.9,1875,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-11062.5,11062.5,,\n" +
  "09:46:59,PEGY,S,9.65,638,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,6156.7,6156.7,,\n" +
  "09:53:19,VTAK,B,1.56,2054,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-12817,3204.24,,\n" +
  "07:04:30,PEGY,S,10.18,312,SMRT,,TRIB14396,Margin,AUTO,-,0,78.00,Equity/ETF,,3410.16,3176.16,,\n" +
  "07:04:24,PEGY,S,9.91,312,SMRT,,TRIB14396,Margin,AUTO,-,0,-6.24,Equity/ETF,,3073.2,3091.92,,\n" +
  "07:04:19,PEGY,S,10,623,SMRT,,TRIB14396,Margin,AUTO,-,0,43.61,Equity/ETF,,6360.83,6230,,\n" +
  "07:04:17,PEGY,S,10,1246,SMRT,,TRIB14396,Margin,AUTO,+,0,87.22,Equity/ETF,,12721.7,12460,,\n" +
  "09:46:54,PEGY,B,9.65,638,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-6156.7,6156.7,,\n" +
  "07:04:12,PEGY,B,9.93,2493,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-24755.5,24755.5,,\n" ;
  

  // All Executions
  const account = "TRIB14396";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const trades = await CreateTrades(results, account);

  const year =2024;
  const months = Array.from({length: 12}, (_, i) => new Date(year, i));

  type TradeDay = {
    date: Date;
    isWinningDay: boolean;
  };

  const generateTradeDaysForMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const tradeDays: TradeDay[] = [];
  
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isWinningDay = Math.random() > 0.5; // Replace this with actual logic
      tradeDays.push({ date, isWinningDay });
    }
  
    return tradeDays;
  };
  const tradeDays = generateTradeDaysForMonth(2024, 0);
  const modifiers = {
    winningDay: tradeDays.filter((day) => day.isWinningDay).map((day) => day.date),
    losingDay: tradeDays.filter((day) => !day.isWinningDay).map((day) => day.date),
  }
  return (
    <div className="w-full text-xs flex flex-col gap-4 p-4">
      <AdvancedCalendar
      modifiers={modifiers}
      modifiersClassNames={{
        winningDay: "bg-green-100 text-green-700",
        losingDay: "bg-red-100 text-red-700",
      }}
      />
      <div className="grid grid-cols-3 gap-4">
        {months.map((month, i) => (
          <BasicCalendar
            key={i}
            month={month}
            selected={[]}
            modifiers={modifiers}
            modifiersClassNames={{
              winningDay: "bg-green-100 text-green-700",
              losingDay: "bg-red-100 text-red-700",
            }}
          />
        ))}
      </div>
      <DataTable columns={columns} data={trades} />
      <TradeDetails trade={trades[0]} tradeId="" />
    </div>
  );
}
