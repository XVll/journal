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

export const useGetTradeQuery = (id:string | undefined) => {

    return useQuery<TradeWithExecutions, Error>({
        staleTime: 1000 * 60 * 5,
        queryKey: ["trade-get", id],
        queryFn: async () => {
            const res = await rpc.api.trade.trade[':id'].$get({
                param:{
                    id
                }
            });

            if (!res.ok) {
                return Promise.reject("Failed to fetch trades");
            }

            const result = await res.json();
            return result as TradeWithExecutions;
        },
        enabled: !!id
    });
};
