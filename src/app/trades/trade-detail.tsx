import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Execution, Trade } from "@prisma/client";

interface TradeDetailProps {
  tradeId: string;
  trade: Trade & { executions?: Execution[] };
}

export const TradeDetails = ({trade, tradeId}:TradeDetailProps) => {
  return (
    <div className="w-full">
      <div className="flex gap-4">
        <div className="flex flex-col">
          <div className="flex flex-row gap-2">
            <span className="w-24">Trade ID</span>
            <span>: {trade?.id}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Account</span>
            <span className="">: {trade?.account}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Ticker</span>
            <span className="text-left">: {trade.ticker}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Notes</span>
            <span>: {trade.notes}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Start Date</span>
            <span className="text-nowrap">: {trade.startDate.toLocaleString()}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Direction</span>
            <span>: {trade.direction}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Volume</span>
            <span>: {trade.volume}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Open Position</span>
            <span>: {trade.openPosition}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Average Price</span>
            <span>: {trade.averagePrice.toFixed(2)}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Commission</span>
            <span>: {trade.commission.toFixed(2)}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Fees</span>
            <span>: {trade.fees.toFixed(2)}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">PnL</span>
            <span>: {trade.pnl.toFixed(2)}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">End Date</span>
            <span className="text-nowrap">: {trade.endDate?.toLocaleString()}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Result</span>
            <span>: {trade.result}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Execution Time</span>
            <span>: {trade.executionTime} sec</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Status</span>
            <span>: {trade.status}</span>
          </div>
          <div className="flex flex-row gap-2">
            <span className="w-24">Type</span>
            <span>: {trade.type}</span>
          </div>
        </div>
        <div className="flex flex-col"></div>
        <div className="rounded-md border w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Scaling Action</TableHead>
                <TableHead>PnL</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Commissions</TableHead>
                <TableHead>Liquidity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trade.executions?.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>{execution.id}</TableCell>
                  <TableCell>{execution.date.toLocaleString()}</TableCell>
                  <TableCell>{execution.ticker}</TableCell>
                  <TableCell>{execution.quantity}</TableCell>
                  <TableCell>{execution.price.toFixed(2)}</TableCell>
                  <TableCell>{execution.action}</TableCell>
                  <TableCell>{execution.amount.toFixed(2)}</TableCell>
                  <TableCell>{execution.tradePosition}</TableCell>
                  <TableCell>{execution.avgPrice.toFixed(2)}</TableCell>
                  <TableCell>{execution.scalingAction}</TableCell>
                  <TableCell>{execution.pnl.toFixed(2)}</TableCell>
                  <TableCell>{execution.fees?.toFixed(2)}</TableCell>
                  <TableCell>{execution.commission?.toFixed(2)}</TableCell>
                  <TableCell>{execution.addLiquidity ? "+" : "-"}</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};