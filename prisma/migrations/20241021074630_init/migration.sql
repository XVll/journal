-- CreateEnum
CREATE TYPE "TradeAction" AS ENUM ('Buy', 'Sell');

-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('Long', 'Short');

-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('Stock', 'Option', 'Future', 'Forex', 'Crypto');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('Open', 'Closed');

-- CreateEnum
CREATE TYPE "TradeResult" AS ENUM ('Win', 'Loss', 'BreakEven');

-- CreateEnum
CREATE TYPE "ScalingAction" AS ENUM ('Initial', 'ScaleIn', 'ProfitTaking', 'StopLoss');

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "ticker" TEXT NOT NULL,
    "direction" "TradeDirection" NOT NULL,
    "type" "TradeType" NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "volume" INTEGER NOT NULL,
    "buyVolume" INTEGER NOT NULL,
    "sellVolume" INTEGER NOT NULL,
    "openPosition" INTEGER NOT NULL,
    "averagePrice" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL,
    "endDate" TIMESTAMP(3),
    "result" "TradeResult",
    "executionTime" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ticker" TEXT NOT NULL,
    "action" "TradeAction" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tradePosition" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "scalingAction" "ScalingAction" NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL,
    "tradeId" TEXT NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "type" "TradeType" NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "addLiquidity" BOOLEAN NOT NULL,
    "executionHash" TEXT NOT NULL,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
