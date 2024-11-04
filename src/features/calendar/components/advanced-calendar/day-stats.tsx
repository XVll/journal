import { GiBullseye } from "react-icons/gi";

import { DayContentProps } from "react-day-picker";
import { FaShieldAlt } from "react-icons/fa";
import { UTCDate } from "@date-fns/utc";
import {Unit} from "@/features/filter/types";
import {FormatUnit} from "@/lib/helpers";
import { DailyStats, ProfitTarget } from "@/features/calendar/types";


export const DayStats = ({ date, tradeDays, calendarTargets, unit }: DayContentProps & {tradeDays: Record<string, DailyStats>, calendarTargets:ProfitTarget, unit:Unit}) => {
  return (
    <div className="flex w-full h-full">
      <div className="w-full flex flex-col">
        <div className="flex justify-between">
          <div className="text-left align-top font-bold text-sm">{date.getDate()}</div>
          {tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.pnl >= calendarTargets.dailyProfit && (
            <span className="flex items-center">
              <GiBullseye className="text-foreground-green"/>
            </span>
          )}
          {tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.pnl <= calendarTargets.dailyMaxLoss && (
            <span className="flex items-center">
              <FaShieldAlt className="text-foreground-red"/>
            </span>
          )}
        </div>
        {Object.keys(tradeDays).includes(new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()) && (
          <div className="flex flex-col">
            <div className="text-left font-semibold text-sm">{FormatUnit(tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.pnl, unit) || 0}</div>
            <div className="text-left">{tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.tradeCount || 0} Trades</div>
          </div>
        )}
      </div>
    </div>
  );
};