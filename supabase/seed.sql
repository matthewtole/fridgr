-- Seed Locations (if not already seeded from migration)
INSERT INTO locations (name, display_order)
SELECT name, display_order
FROM (VALUES
  ('pantry', 1),
  ('fridge', 2),
  ('freezer', 3)
) AS v(name, display_order)
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE locations.name = v.name);

-- Seed Expiration Rules
INSERT INTO expiration_rules (category, location_id, days, confidence_level)
SELECT v.category, l.id, v.days, v.confidence_level
FROM (VALUES
  ('dairy', 'fridge', 7, 'HIGH'),
  ('meat', 'fridge', 3, 'HIGH'),
  ('produce', 'fridge', 5, 'MEDIUM'),
  ('canned', 'pantry', 365, 'HIGH'),
  ('frozen', 'freezer', 180, 'HIGH'),
  ('bread', 'pantry', 5, 'MEDIUM'),
  ('bread', 'fridge', 7, 'MEDIUM'),
  ('eggs', 'fridge', 30, 'HIGH'),
  ('cheese', 'fridge', 14, 'HIGH'),
  ('yogurt', 'fridge', 7, 'HIGH'),
  ('milk', 'fridge', 7, 'HIGH'),
  ('chicken', 'fridge', 2, 'HIGH'),
  ('beef', 'fridge', 3, 'HIGH'),
  ('pork', 'fridge', 3, 'HIGH'),
  ('fish', 'fridge', 2, 'HIGH'),
  ('lettuce', 'fridge', 7, 'MEDIUM'),
  ('tomatoes', 'pantry', 5, 'MEDIUM'),
  ('potatoes', 'pantry', 30, 'HIGH'),
  ('onions', 'pantry', 60, 'HIGH'),
  ('garlic', 'pantry', 90, 'HIGH')
) AS v(category, location_name, days, confidence_level)
JOIN locations l ON l.name = v.location_name
WHERE NOT EXISTS (
  SELECT 1 FROM expiration_rules er
  WHERE er.category = v.category AND er.location_id = l.id
);
