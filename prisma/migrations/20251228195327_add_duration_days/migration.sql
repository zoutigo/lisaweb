-- AlterTable
ALTER TABLE `OfferOption` ADD COLUMN `durationDays` INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE `ServiceOffer` ADD COLUMN `durationDays` INTEGER NOT NULL DEFAULT 0;
