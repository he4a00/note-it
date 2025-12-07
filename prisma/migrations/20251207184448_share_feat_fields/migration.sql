-- AlterEnum
ALTER TYPE "Visibility" ADD VALUE 'PUBLIC';

-- AlterTable
ALTER TABLE "note" ADD COLUMN     "shareId" TEXT;
