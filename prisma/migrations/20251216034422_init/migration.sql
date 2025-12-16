-- CreateTable
CREATE TABLE `Rendezvous` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scheduledAt` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `details` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
