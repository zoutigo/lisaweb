-- Add flag to choose the single customer case featured on landing page
ALTER TABLE `CustomerCase`
  ADD COLUMN `isOnLandingPage` BOOLEAN NOT NULL DEFAULT false;
