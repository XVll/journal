import { cn } from "@/lib/utils";
import {FormatUnit} from "@/lib/helpers";
import {Unit} from "@/features/filter/types";
import { CalendarWeekStats } from "@/features/calendar/types";
interface WeeklyStatsProps {
  weeklyStats: CalendarWeekStats;
  unit : Unit;
}

export const WeeklyStats = ({weeklyStats, unit}:WeeklyStatsProps ) => {
  return (
      <div className="h-16">
          <div
              className={cn( "h-full whitespace-nowrap rounded-sm bg-accent px-2 py-1",
                  weeklyStats.pnl > 0
                      ? "bg-background-green text-foreground-green"
                      : weeklyStats.pnl < 0
                        ? "bg-background-red text-foreground-red"
                        : "bg-background-bt1 text-foreground-ft2",
              )}
          >
              <div className="text-left text-sm font-bold">{weeklyStats.weekNumber}</div>
              <div className="flex flex-col">
                  <div className="text-left text-sm font-semibold">{FormatUnit(weeklyStats.pnl, unit) || 0}</div>
                  <div className="text-left text-xs">
                      {weeklyStats.trades || 0} {weeklyStats.trades > 0 ? "Trades" : "Trade"}
                  </div>
              </div>
          </div>
      </div>
  );
};