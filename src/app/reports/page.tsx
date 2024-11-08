import DayOfWeek from "@/app/reports/_components/dayOfWeek";
import { PnlType, Unit } from "@/features/filter/types";
import db from "@/lib/db/db";
import { addHours, addMinutes, format, roundToNearestMinutes } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import HourOfDay from "@/app/reports/_components/hourOfDay";
import Duration from "@/app/reports/_components/duration";
import Price from "@/app/reports/_components/price";


const generateTradingHours = (interval: number): Map<string, number> => {
    const map = new Map<string, number>();
    const totalIntervals = 960 / interval; // 960 minutes for a 16-hour day

    for (let i = 0; i < totalIntervals; i++) {
        const time = format(addMinutes(new Date(1970, 0, 1), 240 + i * interval), "HH:mm");
        map.set(time, 0);
    }

    return map;
};
const generateDaysOfWeek = (): Map<string, number> => {
    return new Map(
        Array.from({ length: 7 }, (_, i) => [format(new Date(0, 0, i), "EEEE"), 0])
    );
};

/*
      * Trade Distribution by Duration
        * Bar chart with Duration on x-axis and Trade Count on y-axis. Duration will be in minutes like Under 1min, 1-2, 2-5, 5-10 , 10-30 ...
        * Required data: {Duration: Int, TradeCount: Int}[]
      * Performance by Duration
        * Bar chart with Duration on x-axis and PnL on y-axis. Duration will be in minutes like Under 1min, 1-2, 2-5, 5-10 , 10-30 ...
        * Required data: {Duration: Int, PnL: Float}[]
* */
const generateDurations = (): Map<string, number> => {
    const map = new Map<string, number>();
    const durations = ["< 00:15", "00:15 - 00:30", "00:30 - 00:45", "00:45 - 00:59", "01:00 - 02:00", "02:00 - 05:00", "05:00 - 10:00", "10:00 - 30:00", "30:00 - 60:00", "> 60:00"];
    durations.forEach(duration => {
        map.set(duration.toString(), 0);
    });

    return map;
};
/*
[ ] Trade Distribution by Price Range
* Bar chart with Price Range on x-axis and Trade Count on y-axis. Price Range will be in range like < 1.00, 1.00 - 2.00, 2.00 - 5.00, 5.00 - 10.00, 10.00 - 20.00, > 20.00
* Required data: {PriceRange: Int, TradeCount: Int}[]
    [ ] Performance by Price Range
* Bar chart with Price Range on x-axis and PnL on y-axis. Price Range will be in range like < 1.00, 1.00 - 2.00, 2.00 - 5.00, 5.00 - 10.00, 10.00 - 20.00, > 20.00
* Required data: {PriceRange: Int, PnL: Float}[]
 */
const generatePriceRanges = (): Map<string, number> => {
    const map = new Map<string, number>();
    const priceRanges = ["< 1.00", "1.00 - 2.00", "2.00 - 5.00", "5.00 - 10.00", "10.00 - 20.00", "> 20.00"];
    priceRanges.forEach(priceRange => {
        map.set(priceRange.toString(), 0);
    });

    return map;
};

const ReportsPage = async () => {
    const unit = Unit.Currency;
    const pnlType = PnlType.Net;

    // Day Of the Week
    const tradeDistributionByDayOfWeekMap: Map<string, number> = generateDaysOfWeek();
    const tradePerformancesByDayOfWeekMap: Map<string, number> = generateDaysOfWeek();
    // Hour Of Day
    const tradeDistributionByHourOfDayMap: Map<string, number> = generateTradingHours(30);
    const tradePerformancesByHourOfDayMap: Map<string, number> = generateTradingHours(30);
    // Duration
    const tradeDistributionByDurationMap: Map<string, number> = generateDurations();
    const tradePerformancesByDurationMap: Map<string, number> = generateDurations();
    // Price Range
    const tradeDistributionByPriceRangeMap: Map<string, number> = generatePriceRanges();
    const tradePerformancesByPriceRangeMap: Map<string, number> = generatePriceRanges();

    const trades = await db.trade.findMany();

    trades.forEach(trade => {
        if (!trade.endDate) return;
        // Day Of the Week
        const dayOfWeek = format(trade.endDate, "EEEE");
        // Hour Of Day
        const roundedDate = roundToNearestMinutes(trade.endDate, { nearestTo: 30 });
        const hourOfDay = format(toZonedTime(roundedDate, "America/New_York"), "HH:mm");

        // Day Of the Week
        if (tradeDistributionByDayOfWeekMap.has(dayOfWeek)) {
            tradeDistributionByDayOfWeekMap.set(dayOfWeek, (tradeDistributionByDayOfWeekMap.get(dayOfWeek) || 0) + 1);
            tradePerformancesByDayOfWeekMap.set(dayOfWeek, (tradePerformancesByDayOfWeekMap.get(dayOfWeek) || 0) + (pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross));
        }
        // Hour Of Day
        if (tradeDistributionByHourOfDayMap.has(hourOfDay)) {
            tradeDistributionByHourOfDayMap.set(hourOfDay, (tradeDistributionByHourOfDayMap.get(hourOfDay) || 0) + 1);
            tradePerformancesByHourOfDayMap.set(hourOfDay, (tradePerformancesByHourOfDayMap.get(hourOfDay) || 0) + (pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross));
        }
        // Duration
        const duration = trade.executionTime || 0;
        const durationInMinutesRounded = duration < 15 ? "< 00:15" : duration < 30 ? "00:15 - 00:30" : duration < 45 ? "00:30 - 00:45" : duration < 60 ? "00:45 - 00:59" : duration < 120 ? "01:00 - 02:00" : duration < 300 ? "02:00 - 05:00" : duration < 600 ? "05:00 - 10:00" : duration < 1800 ? "10:00 - 30:00" : duration < 3600 ? "30:00 - 60:00" : "> 60:00";
        if (tradeDistributionByDurationMap.has(durationInMinutesRounded)) {
            tradeDistributionByDurationMap.set(durationInMinutesRounded, (tradeDistributionByDurationMap.get(durationInMinutesRounded) || 0) + 1);
            tradePerformancesByDurationMap.set(durationInMinutesRounded, (tradePerformancesByDurationMap.get(durationInMinutesRounded) || 0) + (pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross));
        }
        // Price Range
        const priceRange = trade.averagePrice || 0;
        const priceRangeRounded = priceRange < 1 ? "< 1.00" : priceRange < 2 ? "1.00 - 2.00" : priceRange < 5 ? "2.00 - 5.00" : priceRange < 10 ? "5.00 - 10.00" : priceRange < 20 ? "10.00 - 20.00" : "> 20.00";
        if (tradeDistributionByPriceRangeMap.has(priceRangeRounded)) {
            tradeDistributionByPriceRangeMap.set(priceRangeRounded, (tradeDistributionByPriceRangeMap.get(priceRangeRounded) || 0) + 1);
            tradePerformancesByPriceRangeMap.set(priceRangeRounded, (tradePerformancesByPriceRangeMap.get(priceRangeRounded) || 0) + (pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross));
        }

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

    const tradeDistributionByDuration = Array.from(tradeDistributionByDurationMap).map(([duration, tradeCount]) => ({
        duration: duration,
        count: tradeCount
    })) as { duration: string, count: number }[];

    const tradePerformancesByDuration = Array.from(tradePerformancesByDurationMap).map(([duration, pnl]) => ({
        duration: duration,
        count: pnl
    })) as { duration: string, count: number }[];

    const tradeDistributionByPriceRange = Array.from(tradeDistributionByPriceRangeMap).map(([priceRange, tradeCount]) => ({
        price: priceRange,
        count: tradeCount
    })) as { price: string, count: number }[];

    const tradePerformancesByPriceRange = Array.from(tradePerformancesByPriceRangeMap).map(([priceRange, pnl]) => ({
        price: priceRange,
        count: pnl
    })) as { price: string, count: number }[];


    return (
        <div className={"grid grid-cols-2 grid-rows-4 gap-4 p-4  h-[calc(100vh-0rem)]"}>
            <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Make changes to your account here.</TabsContent>
                <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>
            <div className={"flex gap-4 col-span-2 row-span-1"}>
                <DayOfWeek chartData={distributionChartData} />
                <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
            </div>
            <div className={"flex gap-4 col-span-2 row-span-1"}>
                <Duration chartData={tradeDistributionByDuration} />
                <Duration chartData={tradePerformancesByDuration} />
            </div>
            <div className={"flex gap-4"}>
                <HourOfDay chartData={tradeDistributionByHourOfDay} />
                <HourOfDay chartData={tradePerformancesByHourOfDay} />
            </div>
            <div className={"flex gap-4"}>
                <Price chartData={tradeDistributionByPriceRange} />
                <Price chartData={tradePerformancesByPriceRange} />
            </div>
        </div>
    );
};

export default ReportsPage;