-- Create Receipe table with UUID primary key
CREATE TABLE `Receipe` (
  `id` VARCHAR(191) NOT NULL DEFAULT (uuid()),
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
