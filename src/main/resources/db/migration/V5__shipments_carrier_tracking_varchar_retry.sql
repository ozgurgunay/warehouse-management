-- Retry if V4 did not match (e.g. different information_schema rows): force varchar when columns are still BYTEA.
-- Safe to run when columns are already varchar (conditions skip).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'shipments'
      AND c.column_name = 'carrier'
      AND c.data_type = 'bytea'
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
      AND c.data_type = 'bytea'
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
