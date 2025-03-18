/*
  # Import HelistarFleet Data

  1. Changes
    - Import data from HelistarFleet into aircraft table
    - Transform data to match current schema
    - Add default values for required fields
*/

-- Insert HelistarFleet data into aircraft table
INSERT INTO aircraft (
  type,
  registration,
  configuration,
  capabilities,
  base_location,
  special_equipment,
  image_url,
  specifications,
  maintenance
) VALUES 
(
  'EC120B',
  ARRAY['XU-168'],
  'Single-engine, light utility helicopter – typically configured for 4 passengers',
  ARRAY['Scenic/charter flights', 'Medevac', 'Light utility operations'],
  ARRAY['Cambodia'],
  ARRAY['Standard configuration'],
  'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=800&q=80',
  jsonb_build_object(
    'Passenger Capacity', '4',
    'Status', 'Deregistered for return to Australia',
    'Type', 'Light utility helicopter'
  ),
  jsonb_build_object(
    'inspections', jsonb_build_array(
      jsonb_build_object(
        'type', '100-Hour Inspection',
        'interval', 'Every 100 flight hours'
      ),
      jsonb_build_object(
        'type', 'Annual Inspection',
        'interval', 'Every 12 months'
      )
    ),
    'commonIssues', jsonb_build_array()
  )
),
(
  'AS350B2 Ecureuil',
  ARRAY['XU-188'],
  'Light, high-performance helicopter with seating for up to 5 passengers; modern avionics and comfortable cabin',
  ARRAY['Scenic tours', 'Charter services', 'Medevac'],
  ARRAY['Phnom Penh', 'Siem Reap'],
  ARRAY['Air conditioning', 'Enhanced avionics'],
  'https://images.unsplash.com/photo-1586533293449-dedbe9901f44?auto=format&fit=crop&w=800&q=80',
  jsonb_build_object(
    'Passenger Capacity', '5',
    'Registration Status', 'To be re-registered as HB-ZPF',
    'Type', 'Light utility helicopter',
    'Features', 'Modern avionics, Comfortable cabin'
  ),
  jsonb_build_object(
    'inspections', jsonb_build_array(
      jsonb_build_object(
        'type', '100-Hour Inspection',
        'interval', 'Every 100 flight hours'
      ),
      jsonb_build_object(
        'type', 'Annual Inspection',
        'interval', 'Every 12 months'
      )
    ),
    'commonIssues', jsonb_build_array()
  )
),
(
  'AS350B3 Ecureuil',
  ARRAY['XU-189'],
  'Similar to the B2 with updated systems; optimized for reliability and passenger comfort',
  ARRAY['Charter flights', 'Sightseeing', 'General utility operations'],
  ARRAY['Phnom Penh', 'Siem Reap'],
  ARRAY['Enhanced tourist interior'],
  'https://images.unsplash.com/photo-1599156830144-7c2f0b9b6b66?auto=format&fit=crop&w=800&q=80',
  jsonb_build_object(
    'Passenger Capacity', '5',
    'Type', 'Light utility helicopter',
    'Features', 'Updated systems, Enhanced reliability'
  ),
  jsonb_build_object(
    'inspections', jsonb_build_array(
      jsonb_build_object(
        'type', '100-Hour Inspection',
        'interval', 'Every 100 flight hours'
      ),
      jsonb_build_object(
        'type', 'Annual Inspection',
        'interval', 'Every 12 months'
      )
    ),
    'commonIssues', jsonb_build_array()
  )
),
(
  'H125',
  ARRAY['XU-288'],
  'Single-engine helicopter designed for hot & high operations; seating for up to 5 passengers with a robust airframe',
  ARRAY['Scenic tours', 'Medevac', 'Charter missions'],
  ARRAY['Phnom Penh', 'Siem Reap'],
  ARRAY['Air-conditioned cabin', 'Modern avionics'],
  'https://images.unsplash.com/photo-1593198805047-6e53c82f8e9b?auto=format&fit=crop&w=800&q=80',
  jsonb_build_object(
    'Passenger Capacity', '5',
    'Type', 'Single-engine helicopter',
    'Features', 'Hot & high operations optimized, Robust airframe'
  ),
  jsonb_build_object(
    'inspections', jsonb_build_array(
      jsonb_build_object(
        'type', '100-Hour Inspection',
        'interval', 'Every 100 flight hours'
      ),
      jsonb_build_object(
        'type', 'Annual Inspection',
        'interval', 'Every 12 months'
      )
    ),
    'commonIssues', jsonb_build_array()
  )
);