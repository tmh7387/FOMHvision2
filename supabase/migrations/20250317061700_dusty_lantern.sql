/*
  # Create dropdown options table and add initial data
  
  1. New Tables
    - `dropdown_options`
      - `id` (uuid, primary key)
      - `category` (text)
      - `value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create dropdown_options table
CREATE TABLE IF NOT EXISTS dropdown_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category, value)
);

-- Enable RLS
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users"
  ON dropdown_options
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON dropdown_options
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_dropdown_options_updated_at
  BEFORE UPDATE ON dropdown_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial capability options
INSERT INTO dropdown_options (category, value) VALUES
  ('capability', 'VFR Operations'),
  ('capability', 'IFR Operations'),
  ('capability', 'Night Operations'),
  ('capability', 'Mountain Operations'),
  ('capability', 'Offshore Operations'),
  ('capability', 'External Load Operations'),
  ('capability', 'Passenger Transport'),
  ('capability', 'EMS Operations'),
  ('capability', 'Search and Rescue'),
  ('capability', 'Firefighting'),
  ('capability', 'Agricultural Operations'),
  ('capability', 'Photography/Filming')
ON CONFLICT (category, value) DO NOTHING;

-- Insert initial special equipment options
INSERT INTO dropdown_options (category, value) VALUES
  ('equipment', 'Wire Strike Protection'),
  ('equipment', 'Enhanced Vision System'),
  ('equipment', 'Weather Radar'),
  ('equipment', 'External Cargo Hook'),
  ('equipment', 'Rescue Hoist'),
  ('equipment', 'Emergency Floats'),
  ('equipment', 'Night Vision Imaging System'),
  ('equipment', 'Satellite Tracking System'),
  ('equipment', 'Air Conditioning'),
  ('equipment', 'Auxiliary Fuel System'),
  ('equipment', 'Medical Equipment'),
  ('equipment', 'Firefighting Tank')
ON CONFLICT (category, value) DO NOTHING;

-- Insert initial base location options
INSERT INTO dropdown_options (category, value) VALUES
  ('location', 'Main Heliport'),
  ('location', 'Downtown Helipad'),
  ('location', 'Airport Base'),
  ('location', 'Mountain Base'),
  ('location', 'Coastal Base'),
  ('location', 'Offshore Platform'),
  ('location', 'Remote Operations Base'),
  ('location', 'Maintenance Facility'),
  ('location', 'Training Center'),
  ('location', 'Emergency Response Center')
ON CONFLICT (category, value) DO NOTHING;