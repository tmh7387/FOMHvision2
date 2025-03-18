/*
  # Add Additional Helicopter-Specific Options

  1. Changes
    - Add more helicopter-specific capabilities
    - Add specialized helicopter equipment options
    - Add helicopter-specific base locations
*/

-- Add more capability options
INSERT INTO dropdown_options (category, value) VALUES
  ('capability', 'Confined Area Operations'),
  ('capability', 'High Altitude Operations'),
  ('capability', 'Hot & High Operations'),
  ('capability', 'Winching Operations'),
  ('capability', 'Sling Load Operations'),
  ('capability', 'Water Operations'),
  ('capability', 'Snow/Ice Operations'),
  ('capability', 'HEMS Operations'),
  ('capability', 'Multi-Aircraft Operations'),
  ('capability', 'Special Events Support'),
  ('capability', 'Aerial Survey'),
  ('capability', 'Power Line Inspection')
ON CONFLICT (category, value) DO NOTHING;

-- Add more specialized equipment options
INSERT INTO dropdown_options (category, value) VALUES
  ('equipment', 'Terrain Awareness System'),
  ('equipment', 'Traffic Collision Avoidance'),
  ('equipment', 'Multi-Mission Equipment Rack'),
  ('equipment', 'Fast Rope System'),
  ('equipment', 'Rappelling Kit'),
  ('equipment', 'Bubble Windows'),
  ('equipment', 'Camera/Sensor Turret'),
  ('equipment', 'Search Light'),
  ('equipment', 'Snow Skis/Pads'),
  ('equipment', 'Inlet Barrier Filter'),
  ('equipment', 'Engine Particle Separator'),
  ('equipment', 'Blade De-Ice System'),
  ('equipment', 'Life Rafts'),
  ('equipment', 'Crew/Passenger Survival Kit'),
  ('equipment', 'Tactical Radio System')
ON CONFLICT (category, value) DO NOTHING;

-- Add more base location options
INSERT INTO dropdown_options (category, value) VALUES
  ('location', 'Hospital Helipad'),
  ('location', 'Police Air Support Unit'),
  ('location', 'Fire Service Base'),
  ('location', 'Forest Service Base'),
  ('location', 'Alpine Operations Base'),
  ('location', 'Desert Operations Base'),
  ('location', 'Arctic Operations Base'),
  ('location', 'Island Operations Hub'),
  ('location', 'Mobile Operations Center'),
  ('location', 'Forward Operating Base'),
  ('location', 'Seasonal Operations Base'),
  ('location', 'Cross-Border Operations Base')
ON CONFLICT (category, value) DO NOTHING;