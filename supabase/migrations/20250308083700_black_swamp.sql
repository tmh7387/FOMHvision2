/*
  # Create risk assessment tables
  
  1. New Tables
    - `risk_assessments`
      - `id` (uuid, primary key)
      - `hazard` (text)
      - `description` (text)
      - `consequences` (text array)
      - `category` (text)
      - `inherent_likelihood` (integer)
      - `inherent_severity` (integer)
      - `inherent_risk` (text)
      - `residual_likelihood` (integer)
      - `residual_severity` (integer)
      - `residual_risk` (text)
      - `responsible_person` (text)
      - `monitoring_method` (text)
    
    - `risk_controls`
      - `id` (uuid, primary key)
      - `risk_assessment_id` (uuid, foreign key)
      - `description` (text)
      - `order` (integer)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all tables
*/

-- Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard text NOT NULL,
  description text,
  consequences text[] DEFAULT '{}',
  category text NOT NULL,
  inherent_likelihood integer NOT NULL CHECK (inherent_likelihood BETWEEN 1 AND 5),
  inherent_severity integer NOT NULL CHECK (inherent_severity BETWEEN 1 AND 5),
  inherent_risk text NOT NULL,
  residual_likelihood integer NOT NULL CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_severity integer NOT NULL CHECK (residual_severity BETWEEN 1 AND 5),
  residual_risk text NOT NULL,
  responsible_person text NOT NULL,
  monitoring_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Risk assessments are viewable by authenticated users"
  ON risk_assessments
  FOR SELECT
  TO authenticated
  USING (true);

-- Risk Controls
CREATE TABLE IF NOT EXISTS risk_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_assessment_id uuid NOT NULL REFERENCES risk_assessments(id),
  description text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE risk_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Risk controls are viewable by authenticated users"
  ON risk_controls
  FOR SELECT
  TO authenticated
  USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_risk_assessments_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_controls_updated_at
  BEFORE UPDATE ON risk_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();