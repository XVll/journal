"use client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";

export const useGetTradesQuery = () => {
    type ResponseType = InferResponseType<typeof rpc.api.trade.trades.$get>;
    type RequestType = InferRequestType<typeof rpc.api.trade.trades.$get>;
    return useQuery({
        queryKey: ["trades-get"],
        queryFn: async () => {
            const res = await rpc.api.trade.trades.$get();

            if (!res.ok) {
                return Promise.reject("Failed to fetch trades");
            }

            return await res.json();
        },
    });
};