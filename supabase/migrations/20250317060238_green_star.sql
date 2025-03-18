/*
  # Create storage bucket for aircraft images

  1. Storage
    - Create bucket for aircraft images
    - Set public access policy
*/

-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "extensions";

-- Create storage bucket for aircraft images
INSERT INTO storage.buckets (id, name, public)
VALUES ('aircraft-images', 'aircraft-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload aircraft images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'aircraft-images');

-- Create storage policy to allow public access to aircraft images
CREATE POLICY "Allow public access to aircraft images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'aircraft-images');