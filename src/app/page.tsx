import {TradeParser} from "@/helpers/Parsing/trade-parser";
import {DasSchema, DasTradeMapper} from "@/helpers/Parsing/das-schema";
import {Execution, Trade} from "@prisma/client";


export default async function Home() {
    const data = "Time,Symbol,Side,Price,Qty,Route,Broker,Account,Type,Cloid,Liq,ECNFee,P / L,SecType,LiqType,BP,Value,P/L R,\n" +
        "04:30:00,STEC,B,2.78,7172,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-19938.2,19938.2,,\n" +
        "09:05:55,ATNF,B,11.15,2639,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-29424.9,29424.9,,\n" +
        "08:53:36,ATNF,S,9,1601,SMRT,,TRIB14396,Margin,AUTO,+,0,240.15,Equity/ETF,,15129.5,14409,,\n" +
        "09:15:54,ATNF,B,16.8,1851,SMRT,,TRIB14396,Margin,AUTO,-,0,0.00,Equity/ETF,,-31096.8,31096.8,,\n"
    // parse csv file

    // All Executions
    const results = await TradeParser.parse<DasSchema>(data, DasTradeMapper);
    const trades = await CreateTrades(results);


    return (
        <div>
            <pre>
                <code>
                    {JSON.stringify(trades, null, 2)}
                </code>
            </pre>
        </div>
    );
}

/*
model Trade {
  id            String         @id @default(uuid())
  startDate     DateTime
  endDate       DateTime
  executionTime Int
  ticker        String
  direction     TradeDirection
  type          TradeType
  status        TradeStatus
  volume        Int
  startPrice    Float
  endPrice      Float
  averagePrice  Float
  amount        Float
  commission    Float
  fees          Float
  pnl           Float
  result        TradeResult
  notes         String?
  executions    Execution[]
}
*/
const CreateTrades = async (executions: Execution[]) => {
    // First group executions by ticker
    const Trades: Trade[] = [];
    // Group by ticker
    const groupedExecutions = executions.reduce((acc, execution) => {
        if (!acc[execution.ticker]) {
            acc[execution.ticker] = [];
        }
        acc[execution.ticker].push(execution);
        return acc;
    }, {} as Record<string, Execution[]>);

    // Sort each group by date
    const sortedGroups = Object.values(groupedExecutions).map((executions) => {
        return executions.sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    for (const executions of sortedGroups) {

    }

}