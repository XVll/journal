"use client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { z } from "zod";
import { TradeWithExecutionsSchema } from "@/features/import/schemas";
import superjson from "superjson";
import { TradeWithExecutions } from "@/features/import/types";

export const useGetTradesQuery = (year:number, month:number) => {
    return useQuery({
        queryKey: ["trades-get"],
        queryFn: async () => {
            const res = await rpc.api.trade.trades.$get({
                query: {
                    year,
                    month,
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