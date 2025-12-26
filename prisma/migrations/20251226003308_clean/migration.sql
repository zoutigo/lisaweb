-- AlterTable
ALTER TABLE `Faq` ALTER COLUMN `id` DROP DEFAULT,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `FaqCategory` ALTER COLUMN `id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Partner` ALTER COLUMN `id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Rendezvous` ALTER COLUMN `id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ServiceOffer` MODIFY `shortDescription` VARCHAR(191) NOT NULL,
    MODIFY `longDescription` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ServiceOfferStep` MODIFY `description` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ServiceOfferUseCase` MODIFY `description` VARCHAR(191) NOT NULL;
