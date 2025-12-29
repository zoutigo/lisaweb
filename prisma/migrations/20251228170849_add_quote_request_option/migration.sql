/*
  Warnings:

  - You are about to drop the `_OfferOptionToQuoteRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_OfferOptionToQuoteRequest` DROP FOREIGN KEY `_OfferOptionToQuoteRequest_A_fkey`;

-- DropForeignKey
ALTER TABLE `_OfferOptionToQuoteRequest` DROP FOREIGN KEY `_OfferOptionToQuoteRequest_B_fkey`;

-- DropTable
DROP TABLE `_OfferOptionToQuoteRequest`;

-- CreateTable
CREATE TABLE `QuoteRequestOption` (
    `id` VARCHAR(191) NOT NULL,
    `quoteRequestId` VARCHAR(191) NOT NULL,
    `offerOptionId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuoteRequestOption` ADD CONSTRAINT `QuoteRequestOption_quoteRequestId_fkey` FOREIGN KEY (`quoteRequestId`) REFERENCES `QuoteRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteRequestOption` ADD CONSTRAINT `QuoteRequestOption_offerOptionId_fkey` FOREIGN KEY (`offerOptionId`) REFERENCES `OfferOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
