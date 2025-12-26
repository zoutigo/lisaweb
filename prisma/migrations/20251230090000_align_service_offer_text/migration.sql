-- Align ServiceOffer text columns to long text types
ALTER TABLE `ServiceOffer`
  MODIFY `shortDescription` TEXT NOT NULL,
  MODIFY `longDescription` TEXT NOT NULL;

ALTER TABLE `ServiceOfferStep`
  MODIFY `description` TEXT NOT NULL;

ALTER TABLE `ServiceOfferUseCase`
  MODIFY `description` TEXT NOT NULL;
