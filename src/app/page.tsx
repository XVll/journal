import { TradeParser } from "@/helpers/Parsing/trade-parser";
import { DasSchema, DasTradeMapper } from "@/helpers/Parsing/das-schema";
import CreateTrades from "@/helpers/create-trade";
import { DataTable } from "./trades/data-table";
import { columns} from "./trades/columns";
import { TradeDetails } from "./trades/trade-detail";

export default async function Home() {
  const data =
    "Time,Symbol,Side,Price,Qty,P / L,SecType,\n" +
    "04:30:00,STEC,B,2.00,2000,0.00,Equity/ETF,\n" +
    "05:31:00,STEC,S,3.00,1000,0.00,Equity/ETF,\n" +
    "05:32:00,STEC,B,4.00,4000,0.00,Equity/ETF,\n"  +
    "05:33:00,STEC,S,2.00,1000,0.00,Equity/ETF,\n"+
    "05:38:00,STEC,S,8.00,4000,0.00,Equity/ETF,\n" +

    "04:30:00,ATFN,S,2.00,1000,0.00,Equity/ETF,\n" +
    "05:31:00,ATFN,B,3.00,500,0.00,Equity/ETF,\n" +
    "05:32:00,ATFN,S,4.00,2000,0.00,Equity/ETF,\n"  +
    "05:33:00,ATFN,B,2.00,500,0.00,Equity/ETF,\n"+
    "05:38:00,ATFN,B,8.00,2000,0.00,Equity/ETF,\n" ;

  // All Executions
  const account = "TRIB14396";
  const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
  const trades = await CreateTrades(results, account);

  return (
    <div className="w-full text-xs">
      <DataTable columns={columns} data={trades} />
      <TradeDetails/>
      <pre>
        <code>{JSON.stringify(trades, null, 2)}</code>
      </pre>
    </div>
  );
}
