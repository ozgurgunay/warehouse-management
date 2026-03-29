-- Category status + audit (safe if table missing until Hibernate creates it)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'categories'
  ) THEN
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
    UPDATE categories SET created_at = COALESCE(created_at, NOW()) WHERE created_at IS NULL;
    UPDATE categories SET updated_at = COALESCE(updated_at, NOW()) WHERE updated_at IS NULL;
  END IF;
END $$;
