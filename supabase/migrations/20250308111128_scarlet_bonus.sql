/*
  # Create employees table with RLS

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `title` (text, required)
      - `department` (text, required)
      - `location` (text, required)
      - `manager_id` (uuid, foreign key)
      - `email` (text)
      - `phone` (text)
      - `bio` (text)
      - `image_url` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on employees table
    - Add policies for authenticated users to:
      - Read all employees
      - Insert new employees
      - Update employees
      - Delete employees
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  department text NOT NULL,
  location text NOT NULL,
  manager_id uuid REFERENCES public.employees(id),
  email text,
  phone text,
  bio text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow read access for authenticated users" 
ON public.employees FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert access for authenticated users" 
ON public.employees FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow update access for authenticated users" 
ON public.employees FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete access for authenticated users" 
ON public.employees FOR DELETE 
TO authenticated 
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();