/*
  # Employees Table Policies

  1. Security
    - Enable RLS on employees table
    - Add policies for authenticated users to:
      - Read all employees
      - Create/Update/Delete employees (typically would be restricted to admin roles)
*/

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert employees"
  ON public.employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update employees"
  ON public.employees
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete employees"
  ON public.employees
  FOR DELETE
  TO authenticated
  USING (true);