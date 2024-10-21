-- DropForeignKey
ALTER TABLE "Execution" DROP CONSTRAINT "Execution_tradeId_fkey";

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
