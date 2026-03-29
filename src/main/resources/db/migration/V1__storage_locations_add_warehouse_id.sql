-- Adds storage_locations.warehouse_id for WMS model (location belongs to one warehouse).
-- If the table does not exist yet, this script does nothing (Hibernate will create the full table on startup).

DO $$
DECLARE
    default_wh BIGINT;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'storage_locations'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'storage_locations'
          AND column_name = 'warehouse_id'
    ) THEN
        ALTER TABLE storage_locations ADD COLUMN warehouse_id BIGINT;

        -- Prefer warehouse from existing inventory rows pointing at this location
        UPDATE storage_locations sl
        SET warehouse_id = sub.wh_id
        FROM (
            SELECT DISTINCT ON (sl2.id) sl2.id AS loc_id, i.warehouse_id AS wh_id
            FROM storage_locations sl2
                     INNER JOIN inventories i ON i.location_id = sl2.id
            ORDER BY sl2.id, i.warehouse_id
        ) AS sub
        WHERE sl.id = sub.loc_id;

        -- Remaining rows: attach to first warehouse (legacy / dev)
        SELECT id INTO default_wh FROM warehouses ORDER BY id LIMIT 1;
        IF default_wh IS NOT NULL THEN
            UPDATE storage_locations
            SET warehouse_id = default_wh
            WHERE warehouse_id IS NULL;
        END IF;

        IF EXISTS (SELECT 1 FROM storage_locations WHERE warehouse_id IS NULL) THEN
            RAISE EXCEPTION 'storage_locations: cannot set warehouse_id — add at least one row to warehouses, or link locations via inventories.';
        END IF;

        ALTER TABLE storage_locations ALTER COLUMN warehouse_id SET NOT NULL;

        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
              AND table_name = 'storage_locations'
              AND constraint_name = 'fk_storage_locations_warehouse'
        ) THEN
            ALTER TABLE storage_locations
                ADD CONSTRAINT fk_storage_locations_warehouse
                    FOREIGN KEY (warehouse_id) REFERENCES warehouses (id);
        END IF;

        -- Old global unique on location_code (if present). Per-warehouse uniqueness comes from JPA @UniqueConstraint on startup.
        ALTER TABLE storage_locations DROP CONSTRAINT IF EXISTS storage_locations_location_code_key;
    END IF;
END $$;
