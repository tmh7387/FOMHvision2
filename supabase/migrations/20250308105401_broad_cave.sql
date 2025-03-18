/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `title` (text, not null) 
      - `department` (text, not null)
      - `location` (text)
      - `manager_id` (uuid, references employees)
      - `email` (text)
      - `phone` (text)
      - `bio` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on employees table
    - Add policies for authenticated users to perform CRUD operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  title text NOT NULL,
  department text NOT NULL,
  location text,
  manager_id uuid REFERENCES employees(id),
  email text,
  phone text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow select for authenticated users" ON employees;
  DROP POLICY IF EXISTS "Allow insert for authenticated users" ON employees;
  DROP POLICY IF EXISTS "Allow update for authenticated users" ON employees;
  DROP POLICY IF EXISTS "Allow delete for authenticated users" ON employees;
END $$;

-- Create policies
CREATE POLICY "Allow select for authenticated users" ON employees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated users" ON employees
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON employees
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete for authenticated users" ON employees
  FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS employees_updated_at ON employees;

-- Create trigger
CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();