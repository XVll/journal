import DayOfWeek from "@/app/reports/_components/dayOfWeek";
import { PnlType, Unit } from "@/features/filter/types";
import db from "@/lib/db/db";
import { addHours, addMinutes, format, roundToNearestMinutes } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import HourOfDay from "@/app/reports/_components/hourOfDay";
import Duration from "@/app/reports/_components/duration";
import Price from "@/app/reports/_components/price";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Volume from "@/app/reports/_components/volume";


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
const generateVolumeRanges = (): Map<string, number> => {
    const map = new Map<string, number>();
    const volumeRanges = ["< 100", "100 - 499", "500 - 999", "1000 - 2499", "2500 - 4999", "5000 - 9999", "10000 - 24999", "25000 - 49999", "50000 - 99999", "> 100000"];
    volumeRanges.forEach(volumeRange => {
        map.set(volumeRange.toString(), 0);
    });

    return map;
}

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

    const tradeDistributionByVolumeMap: Map<string, number> = generateVolumeRanges();
    const tradePerformancesByVolumeMap: Map<string, number> = generateVolumeRanges();

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

        // Volume
        const volume = trade.volume || 0;
        const volumeRange = volume < 100 ? "< 100" : volume < 500 ? "100 - 499" : volume < 1000 ? "500 - 999" : volume < 2500 ? "1000 - 2499" : volume < 5000 ? "2500 - 4999" : volume < 10000 ? "5000 - 9999" : volume < 25000 ? "10000 - 24999" : volume < 50000 ? "25000 - 49999" : volume < 100000 ? "50000 - 99999" : "> 100000";
        if (tradeDistributionByVolumeMap.has(volumeRange)) {
            tradeDistributionByVolumeMap.set(volumeRange, (tradeDistributionByVolumeMap.get(volumeRange) || 0) + 1);
            tradePerformancesByVolumeMap.set(volumeRange, (tradePerformancesByVolumeMap.get(volumeRange) || 0) + (pnlType === PnlType.Net ? trade.pnlNet : trade.pnlGross));
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

    const tradeDistributionByVolume = Array.from(tradeDistributionByVolumeMap).map(([volumeRange, tradeCount]) => ({
        volume: volumeRange,
        count: tradeCount
    })) as { volume: string, count: number }[];
    const tradePerformancesByVolume = Array.from(tradePerformancesByVolumeMap).map(([volumeRange, pnl]) => ({
        volume: volumeRange,
        count: pnl
    })) as { volume: string, count: number }[];


    return (
        <div className={"w-full"}>
            <Tabs defaultValue="account" className={"p-4"}>
                <TabsList className={"mb-4"}>
                    <TabsTrigger value="dayOfWeek">Day Of Week</TabsTrigger>
                    <TabsTrigger value="duration">Duration</TabsTrigger>
                    <TabsTrigger value="hourOfDay">Hour Of Day</TabsTrigger>
                    <TabsTrigger value="priceRange">Price Range</TabsTrigger>
                    <TabsTrigger value="volume">Volume</TabsTrigger>
                </TabsList>
                <TabsContent value="dayOfWeek" className={"flex space-x-4"}>
                    <DayOfWeek chartData={distributionChartData} />
                    <DayOfWeek chartData={tradePerformancesByDayOfWeek} />
                </TabsContent>
                <TabsContent value="hourOfDay" className={"flex space-x-4"}>
                    <HourOfDay chartData={tradeDistributionByHourOfDay} />
                    <HourOfDay chartData={tradePerformancesByHourOfDay} />
                </TabsContent>
                <TabsContent value="duration" className={"flex space-x-4"}>
                    <Duration chartData={tradeDistributionByDuration} />
                    <Duration chartData={tradePerformancesByDuration} />
                </TabsContent>
                <TabsContent value="priceRange" className={"flex space-x-4"}>
                    <Price chartData={tradeDistributionByPriceRange} />
                    <Price chartData={tradePerformancesByPriceRange} />
                </TabsContent>
                <TabsContent value="volume" className={"flex space-x-4"}>
                    <Volume chartData={tradeDistributionByVolume} />
                    <Volume chartData={tradePerformancesByVolume} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReportsPage;