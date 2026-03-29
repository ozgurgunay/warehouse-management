-- Optional catalog / detail fields for products (UI: technical specs, thresholds, image).

ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions_text VARCHAR(128);
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg DOUBLE PRECISION;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(128);
ALTER TABLE products ADD COLUMN IF NOT EXISTS operating_temp_range VARCHAR(64);
ALTER TABLE products ADD COLUMN IF NOT EXISTS ip_rating VARCHAR(32);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(1024);
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER;
