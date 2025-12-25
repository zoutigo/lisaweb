/*
  Warnings:

  - The primary key for the `Rendezvous` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SiteInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `Faq` ALTER COLUMN `id` DROP DEFAULT,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `FaqCategory` ALTER COLUMN `id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Partner` ALTER COLUMN `id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Rendezvous` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SiteInfo` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
