-- Clean UUID migration for Partner, Faq, FaqCategory

-- Partner: switch id to VARCHAR UUID (table empty on reset)
-- Reset Partner / Faq / FaqCategory tables to UUID string IDs

DROP TABLE IF EXISTS `Faq`;
DROP TABLE IF EXISTS `FaqCategory`;
DROP TABLE IF EXISTS `Partner`;

CREATE TABLE `Partner` (
  `id` VARCHAR(191) NOT NULL DEFAULT (uuid()),
  `name` VARCHAR(191) NOT NULL,
  `logoUrl` VARCHAR(191) NULL,
  `url` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FaqCategory` (
  `id` VARCHAR(191) NOT NULL DEFAULT (uuid()),
  `name` VARCHAR(191) NOT NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Faq` (
  `id` VARCHAR(191) NOT NULL DEFAULT (uuid()),
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `categoryId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Faq_categoryId_idx`(`categoryId`),
  CONSTRAINT `Faq_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `FaqCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
