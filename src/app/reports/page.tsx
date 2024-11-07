import DayOfWeek from "@/app/reports/_components/dayOfWeek";
import { PnlType, Unit } from "@/features/filter/types";
import db from "@/lib/db/db";
import { format } from "date-fns";

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
    const tradeDistributionByHourOfDayMap: Map<string, number> = new Map(
        Array.from({ length: 24 }, (_, i) => [i.toString(), 0])
    );
    const tradePerformancesByHourOfDayMap: Map<string, number> = new Map(
        Array.from({ length: 24 }, (_, i) => [i.toString(), 0])
    );

    const trades = await db.trade.findMany();
    trades.forEach(trade => {
        if (!trade.endDate) return;
        const dayOfWeek = format(trade.endDate, "EEEE");
        const hourOfDay = format(trade.endDate, "H");

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
        day: hourOfDay,
        count: tradeCount
    })) as { day: string, count: number }[];

    const tradePerformancesByHourOfDay = Array.from(tradePerformancesByHourOfDayMap).map(([hourOfDay, pnl]) => ({
        day: hourOfDay,
        count: pnl
    })) as { day: string, count: number }[];


    return (
        <div className={"grid grid-cols-4 gap-4 p-4 grid-rows-4"}>
            <div className={"flex col-span-4 flex-row gap-2"}>
                <DayOfWeek chartData={distributionChartData} />
                <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
                <DayOfWeek chartData={tradeDistributionByHourOfDay} />
                <DayOfWeek chartData={tradePerformancesByHourOfDay} />
            </div>
            <div className={"flex col-span-4 flex-row gap-2"}>
                <DayOfWeek chartData={distributionChartData} />
                <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
                <DayOfWeek chartData={distributionChartData} />
                <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
            </div>
            <div className={"flex col-span-4 flex-row gap-2"}>
                <DayOfWeek chartData={distributionChartData} />
                <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
                <DayOfWeek chartData={distributionChartData} />
                <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
            </div>
        </div>
    );
};
export default ReportsPage;