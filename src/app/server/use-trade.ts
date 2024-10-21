import { useMutation } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";

export const useImportTrades = () => {
    // const queryClient = useQueryClient();
    type ResponseType = InferResponseType<typeof rpc.api.trade.api.trades.$post>;
    type RequestType = InferRequestType<typeof rpc.api.trade.api.trades.$post>;
    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ( data: RequestType) => {
            return rpc.api.trade.api.trades.$post(data);
        },
        onSuccess: () => {
            // queryClient.invalidateQueries("trades");
        }
    });
};
