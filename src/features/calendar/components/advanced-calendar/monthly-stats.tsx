import { cn } from "@/lib/utils";
import { CalendarMonthStats } from "./advanced-calendar";
interface MonthlyStatsProps {
  monthlyStats: CalendarMonthStats;
}

export const MonthlyStats = ({monthlyStats}:MonthlyStatsProps ) => {
  return (
    <div className=" mb-[1px] ">
        <div className={cn("h-full bg-accent py-1 px-2 whitespace-nowrap rounded-sm",
          monthlyStats.pnl > 0 ? "text-foreground-green bg-background-green" : monthlyStats.pnl < 0 ? "text-foreground-red bg-background-red" : "text-foreground-f1 bg-background-b0"
        )}>
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-left font-semibold text-sm">${monthlyStats.pnl.toFixed(2) || 0}</div>
            <div className="text-left">
              {monthlyStats.trades || 0} {monthlyStats.trades > 0 ? "Trades" : "Trade"}
            </div>
          </div>
      </div>
    </div>
  );
};