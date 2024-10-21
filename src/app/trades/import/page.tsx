"use client";
import { useImportTrades } from "@/app/server/use-trade";
import { testTradeData } from "@/helpers/test-data";

export const Page = () => {
  const account = "TRIB14396";
  const {mutateAsync} = useImportTrades();

  mutateAsync({account,tradeData:testTradeData});

  // This is trade import page. We will require a text are which user can paste their trades and import them.
    return (
        <div>
        </div>
    );
};