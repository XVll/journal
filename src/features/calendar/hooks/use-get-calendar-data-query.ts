"use client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { z } from "zod";
import { TradeWithExecutionsSchema } from "@/features/import/schemas";
import superjson from "superjson";
import { TradeWithExecutions } from "@/features/import/types";
import { useFilterStore } from "../../filter/hooks/use-filters";
import qs from "qs";
import { Trade } from "@prisma/client";
import { DateRange } from "react-day-picker";

export const useGetCalendarDataQuery = () => {

    const filters = useFilterStore((state) => state);
    const query = qs.stringify({
        dateRange: filters.dateRange,
        pnlType: filters.pnlType,
        pnlRange: filters.pnlRange,
    });

    return useQuery<Trade[], Error>({
        staleTime: 1000 * 60 * 5,
        queryKey: ["trades-get"],
        queryFn: async () => {
            const res = await rpc.api.trade.trades.$get({
                query: {
                    query,
                },
            });

            if (!res.ok) {
                return Promise.reject("Failed to fetch trades");
            }

            const result = await res.json();
            return superjson.deserialize<Trade[]>(result);
        },
    });
};