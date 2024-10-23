import { z } from "zod";
import { ExecutionInputSchema } from "./schemas";
import { Prisma } from "@prisma/client";

// Types
export type ExecutionInput = z.infer<typeof ExecutionInputSchema>;
export type TradeWithExecutions = Prisma.TradeGetPayload<{
  include: {
    executions: true;
  };
}>;
