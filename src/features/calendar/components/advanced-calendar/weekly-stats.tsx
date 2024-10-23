import { cn } from "@/lib/utils";
import { CalendarWeekStats } from "./advanced-calendar";
interface WeeklyStatsProps {
  weeklyStats: CalendarWeekStats;
}

export const WeeklyStats = ({weeklyStats}:WeeklyStatsProps ) => {
  return (
      <div className="h-20">
          <div
              className={cn( "h-full whitespace-nowrap rounded-sm bg-accent px-2",
                  weeklyStats.pnl > 0
                      ? "bg-background-green text-foreground-green"
                      : weeklyStats.pnl < 0
                        ? "bg-background-red text-foreground-red"
                        : "bg-background-bt1 text-foreground-ft2",
              )}
          >
              <div className="text-left text-sm font-bold">{weeklyStats.weekNumber}</div>
              <div className="mt-2 flex flex-col gap-1">
                  <div className="text-left text-sm font-semibold">${weeklyStats.pnl.toFixed(2) || 0}</div>
                  <div className="text-left">
                      {weeklyStats.trades || 0} {weeklyStats.trades > 0 ? "Trades" : "Trade"}
                  </div>
              </div>
          </div>
      </div>
  );
};