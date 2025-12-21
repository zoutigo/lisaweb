/*
  Warnings:

  - A unique constraint covering the columns `[pendingToken]` on the table `Rendezvous` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Rendezvous` ADD COLUMN `pendingToken` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'CONFIRMED') NOT NULL DEFAULT 'CONFIRMED';

-- CreateIndex
CREATE UNIQUE INDEX `Rendezvous_pendingToken_key` ON `Rendezvous`(`pendingToken`);
