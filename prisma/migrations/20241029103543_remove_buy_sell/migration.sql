/*
  Warnings:

  - You are about to drop the column `buyVolume` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `sellVolume` on the `Trade` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "buyVolume",
DROP COLUMN "sellVolume";
