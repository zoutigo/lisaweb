-- CreateTable
CREATE TABLE `CustomerCase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `result1` VARCHAR(191) NULL,
    `result2` VARCHAR(191) NULL,
    `result3` VARCHAR(191) NULL,
    `result4` VARCHAR(191) NULL,
    `result5` VARCHAR(191) NULL,
    `feature1` VARCHAR(191) NULL,
    `feature2` VARCHAR(191) NULL,
    `feature3` VARCHAR(191) NULL,
    `feature4` VARCHAR(191) NULL,
    `feature5` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
