-- Create tables for service offers and related details
CREATE TABLE `ServiceOffer` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `subtitle` VARCHAR(191) NULL,
  `shortDescription` TEXT NOT NULL,
  `longDescription` TEXT NOT NULL,
  `targetAudience` VARCHAR(191) NOT NULL,
  `priceLabel` VARCHAR(191) NOT NULL,
  `durationLabel` VARCHAR(191) NOT NULL,
  `engagementLabel` VARCHAR(191) NOT NULL,
  `isFeatured` BOOLEAN NOT NULL DEFAULT false,
  `order` INTEGER NOT NULL DEFAULT 0,
  `ctaLabel` VARCHAR(191) NOT NULL,
  `ctaLink` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ServiceOffer_slug_key`(`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ServiceOfferFeature` (
  `id` VARCHAR(191) NOT NULL,
  `offerId` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `icon` VARCHAR(191) NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `ServiceOfferFeature_offerId_idx`(`offerId`),
  CONSTRAINT `ServiceOfferFeature_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `ServiceOffer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ServiceOfferStep` (
  `id` VARCHAR(191) NOT NULL,
  `offerId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `ServiceOfferStep_offerId_idx`(`offerId`),
  CONSTRAINT `ServiceOfferStep_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `ServiceOffer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ServiceOfferUseCase` (
  `id` VARCHAR(191) NOT NULL,
  `offerId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ServiceOfferUseCase_offerId_idx`(`offerId`),
  CONSTRAINT `ServiceOfferUseCase_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `ServiceOffer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
