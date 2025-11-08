-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "storeKey" TEXT NOT NULL DEFAULT 'flagship';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "storeKey" TEXT NOT NULL DEFAULT 'flagship';
