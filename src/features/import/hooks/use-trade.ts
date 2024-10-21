"use client"
import { useMutation } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";

export const useImportTrades = () => {
    // const queryClient = useQueryClient();
    type ResponseType = InferResponseType<typeof rpc.api.trade.import.$post>;
    type RequestType = InferRequestType<typeof rpc.api.trade.import.$post>;
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            return await rpc.api.trade.import.$post({json});
        },
        onSuccess: () => {
            // queryClient.invalidateQueries("trades");
        },
        onError: (error) => {
            console.error(error);
        }
    });
};
