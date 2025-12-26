-- Ensure UUID defaults on key tables to prevent drift prompts
ALTER TABLE `Faq`
  MODIFY `id` VARCHAR(191) NOT NULL DEFAULT (uuid());

ALTER TABLE `FaqCategory`
  MODIFY `id` VARCHAR(191) NOT NULL DEFAULT (uuid());

ALTER TABLE `Partner`
  MODIFY `id` VARCHAR(191) NOT NULL DEFAULT (uuid());

ALTER TABLE `Rendezvous`
  MODIFY `id` VARCHAR(191) NOT NULL DEFAULT (uuid());
