/*
  # Configure storage for aircraft images
  
  1. Storage Setup
    - Create bucket for aircraft images
    - Set up policies for access control
    
  Note: The storage extension must be enabled in the Supabase dashboard
*/

-- Create storage bucket for aircraft images if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('aircraft-images', 'aircraft-images', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create storage policy to allow authenticated users to upload images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Allow authenticated users to upload aircraft images'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload aircraft images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'aircraft-images');
  END IF;

  -- Create storage policy to allow public access to aircraft images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Allow public access to aircraft images'
  ) THEN
    CREATE POLICY "Allow public access to aircraft images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'aircraft-images');
  END IF;
END $$;