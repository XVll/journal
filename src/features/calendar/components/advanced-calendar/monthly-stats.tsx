import { cn } from "@/lib/utils";
import {Unit} from "@/features/filter/types";
import {FormatUnit} from "@/lib/helpers";
import { CalendarMonthStats } from "@/features/calendar/types";
interface MonthlyStatsProps {
  monthlyStats: CalendarMonthStats;
  unit: Unit;
}

export const MonthlyStats = ({monthlyStats, unit}:MonthlyStatsProps ) => {
  return (
    <div className=" mb-[1px] ">
        <div className={cn("h-full bg-accent py-1 px-2 whitespace-nowrap rounded-sm",
          monthlyStats.pnl > 0 ? "text-foreground-green bg-background-green" : monthlyStats.pnl < 0 ? "text-foreground-red bg-background-red" : "text-foreground-f1 bg-background-b0"
        )}>
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-left font-semibold text-sm">${FormatUnit(monthlyStats.pnl,unit) || 0}</div>
            <div className="text-left">
              {monthlyStats.trades || 0} {monthlyStats.trades > 0 ? "Trades" : "Trade"}
            </div>
          </div>
      </div>
    </div>
  );
};