/*
  Warnings:

  - You are about to drop the column `userId` on the `Address` table. All the data in the column will be lost.
  - Added the required column `userID` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "userId",
ADD COLUMN     "userID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
