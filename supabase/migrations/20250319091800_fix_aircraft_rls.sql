/*
  # Fix Aircraft Table RLS Policies

  1. Changes
    - Add INSERT, UPDATE, and DELETE policies for authenticated users
    - Allow complete management of aircraft data for authenticated users
*/

-- Create INSERT policy for aircraft table
CREATE POLICY "Allow insert access to authenticated users"
  ON aircraft
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create UPDATE policy for aircraft table
CREATE POLICY "Allow update access to authenticated users"
  ON aircraft
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create DELETE policy for aircraft table
CREATE POLICY "Allow delete access to authenticated users"
  ON aircraft
  FOR DELETE
  TO authenticated
  USING (true);
