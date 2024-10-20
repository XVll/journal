import { cn } from "@/lib/utils";
import { CalendarWeekStats } from "./advanced-calendar";
interface WeeklyStatsProps {
  weeklyStats: CalendarWeekStats;
}

export const WeeklyStats = ({weeklyStats}:WeeklyStatsProps ) => {
  return (
    <div className=" w-32">
        <div className={cn("bg-accent py-[.37rem] px-2 whitespace-nowrap rounded-sm",
          weeklyStats.pnl > 0 ? "text-foreground-green bg-background-green" : weeklyStats.pnl < 0 ? "text-foreground-red bg-background-red" : "text-foreground-f1 bg-background-b0"
        )}>
          <div className="text-left font-bold text-sm">Week {weeklyStats.weekNumber}</div>
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-left font-semibold text-sm">${weeklyStats.pnl.toFixed(2) || 0}</div>
            <div className="text-left">
              {weeklyStats.trades || 0} {weeklyStats.trades > 0 ? "Trades" : "Trade"}
            </div>
          </div>
      </div>
    </div>
  );
};