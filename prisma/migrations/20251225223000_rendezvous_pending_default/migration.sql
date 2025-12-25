-- Align Rendezvous table with UUID PK and pending default status

ALTER TABLE `Rendezvous`
  MODIFY `id` VARCHAR(191) NOT NULL DEFAULT (uuid()),
  MODIFY `status` ENUM('PENDING','CONFIRMED') NOT NULL DEFAULT 'PENDING';

