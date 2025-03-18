/*
  # Create positions table
  
  1. New Tables
    - `positions`
      - `id` (uuid, primary key)
      - `title` (text)
      - `department_id` (uuid, foreign key)
      - `reports_to_id` (uuid, self-referencing foreign key)
      - `responsibilities` (text array)
      - `interfaces` (text array)
      - `authority_limits` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users to read positions
*/

CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department_id uuid NOT NULL REFERENCES departments(id),
  reports_to_id uuid REFERENCES positions(id),
  responsibilities text[] DEFAULT '{}',
  interfaces text[] DEFAULT '{}',
  authority_limits text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Positions are viewable by authenticated users"
  ON positions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();