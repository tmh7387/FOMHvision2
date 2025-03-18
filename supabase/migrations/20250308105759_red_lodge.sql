/*
  # Update employees table RLS policies

  1. Changes
    - Drop existing RLS policies
    - Create new comprehensive RLS policies for all operations
    - Ensure proper authentication checks
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Read all employees
      - Insert new employees
      - Update employees
      - Delete employees
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON employees;

-- Create new policies
CREATE POLICY "Allow select for all authenticated users"
ON employees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert for authenticated users"
ON employees FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
ON employees FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users"
ON employees FOR DELETE
TO authenticated
USING (true);