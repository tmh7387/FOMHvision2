/*
  # Initial Schema Setup for HeliVenture Airways

  1. New Tables
    - aircraft: Stores fleet information
    - departments: Stores organizational departments
    - positions: Stores organizational positions
    - operational_processes: Stores process workflows
    - risk_assessments: Stores safety risk data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Aircraft table
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

ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to aircraft"
  ON aircraft
  FOR SELECT
  TO public
  USING (true);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to departments"
  ON departments
  FOR SELECT
  TO public
  USING (true);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id),
  name text NOT NULL,
  title text NOT NULL,
  responsibilities text[] NOT NULL,
  reports_to uuid REFERENCES positions(id),
  interfaces text[],
  authority_limits text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to positions"
  ON positions
  FOR SELECT
  TO public
  USING (true);

-- Operational Processes table
CREATE TABLE IF NOT EXISTS operational_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL,
  phases jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operational_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to operational_processes"
  ON operational_processes
  FOR SELECT
  TO public
  USING (true);

-- Risk Assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard text NOT NULL,
  description text NOT NULL,
  consequences text[] NOT NULL,
  inherent_likelihood integer NOT NULL,
  inherent_severity integer NOT NULL,
  inherent_risk text NOT NULL,
  controls jsonb NOT NULL,
  residual_likelihood integer NOT NULL,
  residual_severity integer NOT NULL,
  residual_risk text NOT NULL,
  responsible_person text NOT NULL,
  monitoring_method text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to risk_assessments"
  ON risk_assessments
  FOR SELECT
  TO public
  USING (true);