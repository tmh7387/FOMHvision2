/*
  # Create aircraft and operational processes tables

  1. New Tables
    - `aircraft`
      - `id` (uuid, primary key)
      - `type` (text)
      - `registration` (text[])
      - `configuration` (text)
      - `capabilities` (text[])
      - `base_location` (text[])
      - `special_equipment` (text[])
      - `image_url` (text)
      - `model_url` (text, nullable)
      - `specifications` (jsonb)
      - `maintenance` (jsonb)
      - `created_at` (timestamptz)

    - `operational_processes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phases` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
*/

-- Create aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  registration text[] NOT NULL,
  configuration text NOT NULL,
  capabilities text[] NOT NULL,
  base_location text[] NOT NULL,
  special_equipment text[] NOT NULL,
  image_url text NOT NULL,
  model_url text,
  specifications jsonb NOT NULL,
  maintenance jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create operational processes table
CREATE TABLE IF NOT EXISTS operational_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phases jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_processes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to aircraft"
  ON aircraft
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to operational processes"
  ON operational_processes
  FOR SELECT
  TO public
  USING (true);