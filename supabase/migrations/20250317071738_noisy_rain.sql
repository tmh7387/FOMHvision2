/*
  # Update Aircraft Table Schema

  1. Changes
    - Add registration field
    - Add configuration field
    - Add specifications field
    - Add maintenance field
    - Add model_url field
    - Update image handling

  2. Security
    - Maintain existing RLS policies
*/

-- Update aircraft table with all required fields
ALTER TABLE aircraft ADD COLUMN IF NOT EXISTS registration text[] DEFAULT '{}';
ALTER TABLE aircraft ADD COLUMN IF NOT EXISTS configuration text;
ALTER TABLE aircraft ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb;
ALTER TABLE aircraft ADD COLUMN IF NOT EXISTS maintenance jsonb DEFAULT '{
  "inspections": [],
  "commonIssues": []
}'::jsonb;
ALTER TABLE aircraft ADD COLUMN IF NOT EXISTS model_url text;

-- Add NOT NULL constraints where appropriate
ALTER TABLE aircraft ALTER COLUMN type SET NOT NULL;
ALTER TABLE aircraft ALTER COLUMN registration SET NOT NULL;
ALTER TABLE aircraft ALTER COLUMN configuration SET NOT NULL;
ALTER TABLE aircraft ALTER COLUMN capabilities SET NOT NULL;
ALTER TABLE aircraft ALTER COLUMN base_location SET NOT NULL;
ALTER TABLE aircraft ALTER COLUMN special_equipment SET NOT NULL;
ALTER TABLE aircraft ALTER COLUMN specifications SET NOT NULL;
ALTER TABLE aircraft ALTER COLUMN maintenance SET NOT NULL;

-- Add default demo aircraft if table is empty
INSERT INTO aircraft (
  type,
  registration,
  configuration,
  capabilities,
  base_location,
  special_equipment,
  image_url,
  specifications,
  maintenance
) 
SELECT
  'Bell 407GXi',
  ARRAY['N407HV'],
  'Single-engine helicopter configured for passenger transport with high-visibility windows and premium interior.',
  ARRAY['VFR', 'Day/Night Operations', 'Passenger Transport', 'Mountain Operations'],
  ARRAY['Main Heliport'],
  ARRAY['Wire Strike Protection', 'Enhanced Vision System', 'Satellite Tracking'],
  'https://images.unsplash.com/photo-1608236465209-6d0da8a0bc8c?auto=format&fit=crop&w=800&q=80',
  '{
    "Passenger Capacity": "6",
    "Max Takeoff Weight": "2,722 kg",
    "Max Cruise Speed": "133 kts",
    "Range": "337 nm",
    "Service Ceiling": "16,000 ft"
  }'::jsonb,
  '{
    "inspections": [
      {"type": "100-Hour Inspection", "interval": "Every 100 flight hours"},
      {"type": "Annual Inspection", "interval": "Every 12 months"}
    ],
    "commonIssues": [
      "Tail rotor bearing wear",
      "Main rotor track and balance",
      "Avionics software updates"
    ]
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM aircraft LIMIT 1);