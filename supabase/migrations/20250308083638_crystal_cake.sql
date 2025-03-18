/*
  # Create aircraft types and related tables
  
  1. New Tables
    - `aircraft_types`
      - `id` (uuid, primary key)
      - `type` (text, unique)
      - `configuration` (text)
      - `capabilities` (text array)
      - `special_equipment` (text array)
      - `image_url` (text)
      - `model_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `aircraft_specifications`
      - `id` (uuid, primary key)
      - `aircraft_type_id` (uuid, foreign key)
      - `key` (text)
      - `value` (text)
    
    - `aircraft_maintenance_schedules`
      - `id` (uuid, primary key)
      - `aircraft_type_id` (uuid, foreign key)
      - `inspection_type` (text)
      - `interval` (text)
    
    - `aircraft_common_issues`
      - `id` (uuid, primary key)
      - `aircraft_type_id` (uuid, foreign key)
      - `description` (text)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all tables
*/

-- Aircraft Types
CREATE TABLE IF NOT EXISTS aircraft_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text UNIQUE NOT NULL,
  configuration text,
  capabilities text[] DEFAULT '{}',
  special_equipment text[] DEFAULT '{}',
  image_url text,
  model_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE aircraft_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aircraft types are viewable by authenticated users"
  ON aircraft_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Aircraft Specifications
CREATE TABLE IF NOT EXISTS aircraft_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_type_id uuid NOT NULL REFERENCES aircraft_types(id),
  key text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE aircraft_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aircraft specifications are viewable by authenticated users"
  ON aircraft_specifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Aircraft Maintenance Schedules
CREATE TABLE IF NOT EXISTS aircraft_maintenance_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_type_id uuid NOT NULL REFERENCES aircraft_types(id),
  inspection_type text NOT NULL,
  interval text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE aircraft_maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aircraft maintenance schedules are viewable by authenticated users"
  ON aircraft_maintenance_schedules
  FOR SELECT
  TO authenticated
  USING (true);

-- Aircraft Common Issues
CREATE TABLE IF NOT EXISTS aircraft_common_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_type_id uuid NOT NULL REFERENCES aircraft_types(id),
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE aircraft_common_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aircraft common issues are viewable by authenticated users"
  ON aircraft_common_issues
  FOR SELECT
  TO authenticated
  USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_aircraft_types_updated_at
  BEFORE UPDATE ON aircraft_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_specifications_updated_at
  BEFORE UPDATE ON aircraft_specifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_maintenance_schedules_updated_at
  BEFORE UPDATE ON aircraft_maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_common_issues_updated_at
  BEFORE UPDATE ON aircraft_common_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();