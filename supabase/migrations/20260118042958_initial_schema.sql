-- Create Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  default_shelf_life INTEGER, -- days
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Product Barcodes Table
CREATE TABLE product_barcodes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barcode)
);

-- Create Inventory Items Table
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL NOT NULL,
  quantity_type TEXT NOT NULL CHECK (quantity_type IN ('units', 'volume', 'percentage', 'weight')),
  location TEXT NOT NULL CHECK (location IN ('pantry', 'fridge', 'freezer')),
  added_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiration_date DATE,
  opened_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Inventory History Table
CREATE TABLE inventory_history (
  id SERIAL PRIMARY KEY,
  inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  old_data JSONB, -- Previous state before change
  new_data JSONB, -- New state after change
  changed_fields TEXT[], -- Array of field names that changed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Recipes Table
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients_json JSONB NOT NULL, -- Array of {item, quantity, unit}
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Expiration Rules Table
CREATE TABLE expiration_rules (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  storage_type TEXT NOT NULL CHECK (storage_type IN ('pantry', 'fridge', 'freezer')),
  days INTEGER NOT NULL,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, storage_type)
);

-- Create User Corrections Table
CREATE TABLE user_corrections (
  id SERIAL PRIMARY KEY,
  product_type TEXT NOT NULL,
  category TEXT,
  storage_type TEXT,
  original_estimate INTEGER NOT NULL, -- days
  user_override INTEGER NOT NULL, -- days
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Updated At Triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expiration_rules_updated_at BEFORE UPDATE ON expiration_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Inventory History Trigger Function
CREATE OR REPLACE FUNCTION track_inventory_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_json JSONB;
  new_json JSONB;
  changed_fields TEXT[];
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO inventory_history (inventory_item_id, action, new_data, changed_fields)
    VALUES (NEW.id, 'created', to_jsonb(NEW), ARRAY[]::TEXT[]);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    old_json := to_jsonb(OLD);
    new_json := to_jsonb(NEW);
    -- Calculate changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(new_json)
    WHERE value IS DISTINCT FROM old_json->key;
    
    INSERT INTO inventory_history (inventory_item_id, action, old_data, new_data, changed_fields)
    VALUES (NEW.id, 'updated', old_json, new_json, changed_fields);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO inventory_history (inventory_item_id, action, old_data, changed_fields)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD), ARRAY[]::TEXT[]);
    RETURN OLD;
  END IF;
END;
$$ language 'plpgsql';

-- Apply Inventory History Trigger
CREATE TRIGGER inventory_items_history
  AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION track_inventory_changes();

-- Create Indexes for Product Barcodes
CREATE INDEX idx_product_barcodes_product_id ON product_barcodes(product_id);

-- Create Indexes for Inventory Items
CREATE INDEX idx_inventory_items_expiration ON inventory_items(expiration_date);
CREATE INDEX idx_inventory_items_location ON inventory_items(location);
CREATE INDEX idx_inventory_items_product_id ON inventory_items(product_id);
CREATE INDEX idx_inventory_items_expiration_location ON inventory_items(expiration_date, location);

-- Create Indexes for Inventory History
CREATE INDEX idx_inventory_history_item_id ON inventory_history(inventory_item_id);
CREATE INDEX idx_inventory_history_created_at ON inventory_history(created_at DESC);
CREATE INDEX idx_inventory_history_item_created ON inventory_history(inventory_item_id, created_at DESC);

-- Create Indexes for Recipes
CREATE INDEX idx_recipes_ingredients_gin ON recipes USING GIN (ingredients_json);

-- Create Indexes for Products
CREATE INDEX idx_products_category ON products(category);

-- Create Indexes for Expiration Rules
CREATE INDEX idx_expiration_rules_category ON expiration_rules(category);
CREATE INDEX idx_expiration_rules_storage ON expiration_rules(storage_type);

-- Create Indexes for User Corrections
CREATE INDEX idx_user_corrections_product_type ON user_corrections(product_type);
CREATE INDEX idx_user_corrections_category ON user_corrections(category);
CREATE INDEX idx_user_corrections_product_category ON user_corrections(product_type, category);
