-- Create Locations Table
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default locations
INSERT INTO locations (name, display_order) VALUES
  ('pantry', 1),
  ('fridge', 2),
  ('freezer', 3);

-- Add location_id column to inventory_items
ALTER TABLE inventory_items
  ADD COLUMN location_id INTEGER REFERENCES locations(id) ON DELETE RESTRICT;

-- Migrate existing data: map location text to location_id
UPDATE inventory_items
SET location_id = (
  SELECT id FROM locations WHERE name = inventory_items.location
)
WHERE location IS NOT NULL;

-- Make location_id NOT NULL after data migration
ALTER TABLE inventory_items
  ALTER COLUMN location_id SET NOT NULL;

-- Drop old location column
ALTER TABLE inventory_items
  DROP COLUMN location;

-- Add location_id column to expiration_rules
ALTER TABLE expiration_rules
  ADD COLUMN location_id INTEGER REFERENCES locations(id) ON DELETE RESTRICT;

-- Migrate existing data: map storage_type text to location_id
UPDATE expiration_rules
SET location_id = (
  SELECT id FROM locations WHERE name = expiration_rules.storage_type
)
WHERE storage_type IS NOT NULL;

-- Make location_id NOT NULL after data migration
ALTER TABLE expiration_rules
  ALTER COLUMN location_id SET NOT NULL;

-- Drop old storage_type column
ALTER TABLE expiration_rules
  DROP COLUMN storage_type;

-- Update unique constraint on expiration_rules
ALTER TABLE expiration_rules
  DROP CONSTRAINT IF EXISTS expiration_rules_category_storage_type_key;

ALTER TABLE expiration_rules
  ADD CONSTRAINT expiration_rules_category_location_id_key UNIQUE (category, location_id);

-- Update indexes
DROP INDEX IF EXISTS idx_inventory_items_location;
DROP INDEX IF EXISTS idx_inventory_items_expiration_location;
DROP INDEX IF EXISTS idx_expiration_rules_storage;

CREATE INDEX idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX idx_inventory_items_expiration_location ON inventory_items(expiration_date, location_id);
CREATE INDEX idx_expiration_rules_location_id ON expiration_rules(location_id);

-- Add updated_at trigger to locations table
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
