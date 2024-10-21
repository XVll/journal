import { TradeResult } from "@prisma/client";
import { GiBullseye } from "react-icons/gi";

import { CalendarDayStats } from "./advanced-calendar";
import { DayContentProps } from "react-day-picker";
import { FaShieldAlt } from "react-icons/fa";
import { UTCDate } from "@date-fns/utc";


export const DayStats = ({ date, tradeDays }: DayContentProps & {tradeDays: Record<string, CalendarDayStats>}) => {
  return (
    <div className="flex w-full h-full ">
      <div className="w-full flex flex-col">
        <div className="flex justify-between">
          <div className="text-left align-top font-bold text-sm">{date.getDate()}</div>
          {tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.result === TradeResult.Win && (
            <span className="flex items-center">
              <GiBullseye className="text-foreground-green" />
            </span>
          )}
          {tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.result === TradeResult.Loss && (
            <span className="flex items-center">
              <FaShieldAlt className="text-foreground-red" />
            </span>
          )}
        </div>
        {Object.keys(tradeDays).includes(new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()) && (
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-left font-semibold text-sm">${tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.pnl.toFixed(2) || 0}</div>
            <div className="text-left">{tradeDays[new UTCDate(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString()]?.trades || 0} Trades</div>
          </div>
        )}
      </div>
    </div>
  );
};