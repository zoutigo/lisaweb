-- AlterTable
ALTER TABLE `Faq` ADD COLUMN `categoryId` INTEGER NULL;

-- CreateTable
CREATE TABLE `FaqCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Faq` ADD CONSTRAINT `Faq_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `FaqCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
