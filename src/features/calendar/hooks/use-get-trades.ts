"use client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { z } from "zod";
import { TradeWithExecutionsSchema } from "@/features/import/schemas";
import superjson from "superjson";
import { TradeWithExecutions } from "@/features/import/types";
import { useFilterStore } from "./use-filters";
import qs from "qs";

export const useGetTradesQuery = (date:Date) => {

    const filters = useFilterStore((state) => state);
    const query = qs.stringify({
        dateRange: filters.dateRange,
        pnlType: filters.pnlType,
        pnlRange: filters.pnlRange,
        selectedCalendarDate: date
    });

    type ResponseType = InferResponseType<typeof rpc.api.trade.trades.$get>;
    return useQuery<TradeWithExecutions[], Error>({
        staleTime: 1000 * 60 * 5,
        queryKey: ["trades-get", date],
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
            return superjson.deserialize<TradeWithExecutions[]>(result);
        },
    });
};