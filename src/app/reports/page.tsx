import DayOfWeek from "@/app/reports/_components/dayOfWeek";
import { PnlType, Unit } from "@/features/filter/types";
import db from "@/lib/db/db";
import { addHours, addMinutes, format, roundToNearestMinutes } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import HourOfDay from "@/app/reports/_components/hourOfDay";


const generateTradingHours = (interval: number): Map<string, number> => {
    const map = new Map<string, number>();
    const totalIntervals = 960 / interval; // 960 minutes for a 16-hour day

    for (let i = 0; i < totalIntervals; i++) {
        const time = format(addMinutes(new Date(1970, 0, 1), 240 + i * interval), "HH:mm");
        map.set(time, 0);
    }

    return map;
};


const ReportsPage = async () => {
    /*
          * Trade Distribution by Day of Week / Month of Year
            * Bar chart with Day of Week on x-axis and Trade Count on y-axis
            * Required data: {DayOfWeek: String, TradeCount: Int}[]
    */
    const unit = Unit.Currency;
    const pnlType = PnlType.Net;

    const tradeDistributionByDayOfWeekMap: Map<string, number> = new Map(
        Array.from({ length: 7 }, (_, i) => [format(new Date(0, 0, i), "EEEE"), 0])
    );
    const tradePerformancesByDayOfWeekMap: Map<string, number> = new Map(
        Array.from({ length: 7 }, (_, i) => [format(new Date(0, 0, i), "EEEE"), 0])
    );
    // 16  * 60 = 960
    const tradeDistributionByHourOfDayMap: Map<string, number> = generateTradingHours(30);
    const tradePerformancesByHourOfDayMap: Map<string, number> = generateTradingHours(30);

    const trades = await db.trade.findMany();
    trades.forEach(trade => {
        if (!trade.endDate) return;
        const dayOfWeek = format(trade.endDate, "EEEE");
        const roundedDate = roundToNearestMinutes(trade.endDate, { nearestTo: 30 });
        const hourOfDay = format(toZonedTime(roundedDate, "America/New_York"), "HH:mm");

        if (tradeDistributionByDayOfWeekMap.has(dayOfWeek)) {
            tradeDistributionByDayOfWeekMap.set(dayOfWeek, (tradeDistributionByDayOfWeekMap.get(dayOfWeek) || 0) + 1);
            tradePerformancesByDayOfWeekMap.set(dayOfWeek, (tradePerformancesByDayOfWeekMap.get(dayOfWeek) || 0) + (pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross));
            tradeDistributionByHourOfDayMap.set(hourOfDay, (tradeDistributionByHourOfDayMap.get(hourOfDay) || 0) + 1);
            tradePerformancesByHourOfDayMap.set(hourOfDay, (tradePerformancesByHourOfDayMap.get(hourOfDay) || 0) + (pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross));
        } else {
        }
    });
    trades.forEach(trade => {
        /*
      * Trade Distribution by Hour of Day
        * Bar chart with Hour of Day on x-axis and Trade Count on y-axis. Hours will be in 24-hour format and 1 hour interval
        * Required data: {HourOfDay: Int, TradeCount: Int}[]
         */
        if (!trade.endDate) return;
        const hourOfDay = format(trade.endDate, "H");


    });

    const distributionChartData = Array.from(tradeDistributionByDayOfWeekMap).map(([dayOfWeek, tradeCount]) => ({
        day: dayOfWeek,
        count: tradeCount
    })) as { day: string, count: number }[];

    const tradePerformancesByDayOfWeek = Array.from(tradePerformancesByDayOfWeekMap).map(([dayOfWeek, pnl]) => ({
        day: dayOfWeek,
        count: pnl
    })) as { day: string, count: number }[];

    const tradeDistributionByHourOfDay = Array.from(tradeDistributionByHourOfDayMap).map(([hourOfDay, tradeCount]) => ({
        hour: hourOfDay,
        count: tradeCount
    })) as { hour: string, count: number }[];

    const tradePerformancesByHourOfDay = Array.from(tradePerformancesByHourOfDayMap).map(([hourOfDay, pnl]) => ({
        hour: hourOfDay,
        count: pnl
    })) as { hour: string, count: number }[];


    return (
        <div className={"grid grid-cols-4 gap-4 p-4 grid-rows-4"}>
            <div className={"flex col-span-4 flex-row gap-2"}>
                <DayOfWeek chartData={distributionChartData} />
                <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
            </div>
            <div className={"flex col-span-4 flex-row gap-2"}>
                <HourOfDay chartData={tradeDistributionByHourOfDay} />
                <HourOfDay chartData={tradePerformancesByHourOfDay} />
            </div>
        </div>
    );
};
export default ReportsPage;