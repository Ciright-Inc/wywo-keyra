-- Unique sort order among active materials (soft-deleted rows may reuse numbers).
CREATE UNIQUE INDEX "AdminMaterial_active_sortOrder_key" ON "AdminMaterial"("sortOrder") WHERE "isActive" = true;
