/*
  # Import HelistarFleet Data

  1. Changes
    - Insert HelistarFleet data into existing aircraft table
    - Transform data to match current schema
    - Ensure all required fields are populated
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
  ARRAY['Scenic/charter flights', 'medevac', 'light utility operations'],
  ARRAY['Previously based in Cambodia'],
  ARRAY['Standard configuration'],
  'https://images.unsplash.com/photo-1608236465209-6d0da8a0bc8c?auto=format&fit=crop&w=800&q=80',
  '{
    "Passenger Capacity": "4",
    "Configuration": "Light utility",
    "Status": "Deregistered for return to Australia"
  }'::jsonb,
  '{
    "inspections": [
      {"type": "100-Hour Inspection", "interval": "Every 100 flight hours"},
      {"type": "Annual Inspection", "interval": "Every 12 months"}
    ],
    "commonIssues": []
  }'::jsonb
),
(
  'AS350B2 Ecureuil',
  ARRAY['XU-188'],
  'Light, high-performance helicopter with seating for up to 5 passengers; modern avionics and comfortable cabin',
  ARRAY['Scenic tours', 'charter services', 'medevac'],
  ARRAY['Phnom Penh', 'Siem Reap', 'Cambodia'],
  ARRAY['Air conditioning', 'enhanced avionics'],
  'https://images.unsplash.com/photo-1608236465209-6d0da8a0bc8c?auto=format&fit=crop&w=800&q=80',
  '{
    "Passenger Capacity": "5",
    "Registration Status": "to be re-registered as HB-ZPF",
    "Configuration": "High-performance light helicopter"
  }'::jsonb,
  '{
    "inspections": [
      {"type": "100-Hour Inspection", "interval": "Every 100 flight hours"},
      {"type": "Annual Inspection", "interval": "Every 12 months"}
    ],
    "commonIssues": []
  }'::jsonb
),
(
  'AS350B3 Ecureuil',
  ARRAY['XU-189'],
  'Similar to the B2 with updated systems; optimized for reliability and passenger comfort',
  ARRAY['Charter flights', 'sightseeing', 'general utility operations'],
  ARRAY['Phnom Penh', 'Siem Reap', 'Cambodia'],
  ARRAY['Enhanced tourist interior'],
  'https://images.unsplash.com/photo-1608236465209-6d0da8a0bc8c?auto=format&fit=crop&w=800&q=80',
  '{
    "Passenger Capacity": "5",
    "Configuration": "Updated B2 with enhanced systems"
  }'::jsonb,
  '{
    "inspections": [
      {"type": "100-Hour Inspection", "interval": "Every 100 flight hours"},
      {"type": "Annual Inspection", "interval": "Every 12 months"}
    ],
    "commonIssues": []
  }'::jsonb
),
(
  'H125',
  ARRAY['XU-288'],
  'Single-engine helicopter designed for hot & high operations; seating for up to 5 passengers with a robust airframe',
  ARRAY['Versatile for scenic tours', 'medevac', 'charter missions'],
  ARRAY['Phnom Penh', 'Siem Reap', 'Cambodia'],
  ARRAY['Air-conditioned cabin', 'modern avionics'],
  'https://images.unsplash.com/photo-1608236465209-6d0da8a0bc8c?auto=format&fit=crop&w=800&q=80',
  '{
    "Passenger Capacity": "5",
    "Configuration": "Hot & high operations optimized",
    "Airframe": "Robust design"
  }'::jsonb,
  '{
    "inspections": [
      {"type": "100-Hour Inspection", "interval": "Every 100 flight hours"},
      {"type": "Annual Inspection", "interval": "Every 12 months"}
    ],
    "commonIssues": []
  }'::jsonb
)
ON CONFLICT (type) DO NOTHING;