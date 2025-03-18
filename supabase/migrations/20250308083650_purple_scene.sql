/*
  # Create operational processes tables
  
  1. New Tables
    - `operation_types`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
    
    - `process_phases`
      - `id` (uuid, primary key)
      - `operation_type_id` (uuid, foreign key)
      - `name` (text)
      - `order` (integer)
    
    - `process_steps`
      - `id` (uuid, primary key)
      - `phase_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `department_id` (uuid, foreign key)
      - `personnel_responsible` (text)
      - `procedure_reference` (text)
      - `critical_safety_points` (text array)
      - `decision_authority` (text)
      - `tools_used` (text array)
      - `documentation_required` (text array)
      - `common_issues` (text array)
      - `icon` (text)
      - `is_safety_critical` (boolean)
      - `order` (integer)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all tables
*/

-- Operation Types
CREATE TABLE IF NOT EXISTS operation_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE operation_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operation types are viewable by authenticated users"
  ON operation_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Process Phases
CREATE TABLE IF NOT EXISTS process_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type_id uuid NOT NULL REFERENCES operation_types(id),
  name text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE process_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Process phases are viewable by authenticated users"
  ON process_phases
  FOR SELECT
  TO authenticated
  USING (true);

-- Process Steps
CREATE TABLE IF NOT EXISTS process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES process_phases(id),
  name text NOT NULL,
  description text,
  department_id uuid NOT NULL REFERENCES departments(id),
  personnel_responsible text NOT NULL,
  procedure_reference text,
  critical_safety_points text[] DEFAULT '{}',
  decision_authority text,
  tools_used text[] DEFAULT '{}',
  documentation_required text[] DEFAULT '{}',
  common_issues text[] DEFAULT '{}',
  icon text NOT NULL,
  is_safety_critical boolean DEFAULT false,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Process steps are viewable by authenticated users"
  ON process_steps
  FOR SELECT
  TO authenticated
  USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_operation_types_updated_at
  BEFORE UPDATE ON operation_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_phases_updated_at
  BEFORE UPDATE ON process_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_steps_updated_at
  BEFORE UPDATE ON process_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();