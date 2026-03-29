-- Some databases had carrier / tracking_number created as BYTEA, which breaks LOWER() in JPQL (PostgreSQL: lower(bytea) does not exist).
-- Normalize to varchar so case-insensitive filters work.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'shipments'
      AND c.column_name = 'carrier'
      AND c.udt_name = 'bytea'
  ) THEN
    ALTER TABLE shipments
      ALTER COLUMN carrier TYPE varchar(255)
      USING (
        CASE
          WHEN carrier IS NULL THEN NULL
          ELSE convert_from(carrier, 'UTF8')
        END
      );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'shipments'
      AND c.column_name = 'tracking_number'
      AND c.udt_name = 'bytea'
  ) THEN
    ALTER TABLE shipments
      ALTER COLUMN tracking_number TYPE varchar(255)
      USING (
        CASE
          WHEN tracking_number IS NULL THEN NULL
          ELSE convert_from(tracking_number, 'UTF8')
        END
      );
  END IF;
END $$;
