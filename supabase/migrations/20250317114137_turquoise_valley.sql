/*
  # Add unique constraint to aircraft type

  1. Changes
    - Add unique constraint to type column in aircraft table
    - Ensure no duplicate types exist before adding constraint
*/

-- Remove any duplicate aircraft types before adding unique constraint
WITH duplicates AS (
  SELECT type,
         ROW_NUMBER() OVER (PARTITION BY type ORDER BY created_at) as rnum
  FROM aircraft
)
DELETE FROM aircraft
WHERE id IN (
  SELECT a.id
  FROM aircraft a
  JOIN duplicates d ON a.type = d.type
  WHERE d.rnum > 1
);

-- Add unique constraint to type column
ALTER TABLE aircraft ADD CONSTRAINT aircraft_type_unique UNIQUE (type);