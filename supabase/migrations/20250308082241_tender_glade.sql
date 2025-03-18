/*
  # Initial Schema for HeliVenture Airways Portal

  1. New Tables
    - departments
      - id (uuid, primary key)
      - name (text)
      - color (text)
      - created_at (timestamp)
      - updated_at (timestamp)

    - positions
      - id (uuid, primary key)
      - title (text)
      - department_id (uuid, foreign key)
      - reports_to_id (uuid, foreign key)
      - responsibilities (text[])
      - interfaces (text[])
      - authority_limits (text)
      - created_at (timestamp)
      - updated_at (timestamp)

    - aircraft
      - id (uuid, primary key)
      - type (text)
      - registration (text[])
      - configuration (text)
      - capabilities (text[])
      - base_location (text[])
      - special_equipment (text[])
      - image_url (text)
      - model_url (text)
      - specifications (jsonb)
      - maintenance_info (jsonb)
      - created_at (timestamp)
      - updated_at (timestamp)

    - operational_processes
      - id (uuid, primary key)
      - operation_type (text)
      - phase (text)
      - step_name (text)
      - description (text)
      - department_id (uuid, foreign key)
      - personnel_responsible (text)
      - procedure_reference (text)
      - critical_safety_points (text[])
      - decision_authority (text)
      - tools_used (text[])
      - documentation_required (text[])
      - common_issues (text[])
      - is_safety_critical (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

    - risk_assessments
      - id (uuid, primary key)
      - hazard (text)
      - description (text)
      - consequences (text[])
      - inherent_likelihood (integer)
      - inherent_severity (integer)
      - inherent_risk (text)
      - controls (jsonb)
      - residual_likelihood (integer)
      - residual_severity (integer)
      - residual_risk (text)
      - responsible_person (text)
      - monitoring_method (text)
      - category (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
  ON departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department_id uuid REFERENCES departments(id),
  reports_to_id uuid REFERENCES positions(id),
  responsibilities text[] DEFAULT '{}',
  interfaces text[] DEFAULT '{}',
  authority_limits text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
  ON positions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  registration text[] DEFAULT '{}',
  configuration text,
  capabilities text[] DEFAULT '{}',
  base_location text[] DEFAULT '{}',
  special_equipment text[] DEFAULT '{}',
  image_url text,
  model_url text,
  specifications jsonb DEFAULT '{}'::jsonb,
  maintenance_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
  ON aircraft
  FOR SELECT
  TO authenticated
  USING (true);

-- Create operational_processes table
CREATE TABLE IF NOT EXISTS operational_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  phase text NOT NULL,
  step_name text NOT NULL,
  description text,
  department_id uuid REFERENCES departments(id),
  personnel_responsible text,
  procedure_reference text,
  critical_safety_points text[] DEFAULT '{}',
  decision_authority text,
  tools_used text[] DEFAULT '{}',
  documentation_required text[] DEFAULT '{}',
  common_issues text[] DEFAULT '{}',
  is_safety_critical boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE operational_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
  ON operational_processes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create risk_assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard text NOT NULL,
  description text,
  consequences text[] DEFAULT '{}',
  inherent_likelihood integer NOT NULL,
  inherent_severity integer NOT NULL,
  inherent_risk text NOT NULL,
  controls jsonb DEFAULT '[]'::jsonb,
  residual_likelihood integer NOT NULL,
  residual_severity integer NOT NULL,
  residual_risk text NOT NULL,
  responsible_person text,
  monitoring_method text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users"
  ON risk_assessments
  FOR SELECT
  TO authenticated
  USING (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_updated_at
  BEFORE UPDATE ON aircraft
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operational_processes_updated_at
  BEFORE UPDATE ON operational_processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();