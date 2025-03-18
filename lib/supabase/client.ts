import { createClient } from '@supabase/supabase-js';

// Helper function to validate URL
const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate configuration
const isValidConfig = 
  supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl);

// Create client or set to null if invalid config
export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isValidConfig) {
  console.error('Invalid or missing Supabase configuration:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing',
    isValidUrl: supabaseUrl ? isValidUrl(supabaseUrl) : false
  });
}

// Add connection status check
export const checkConnection = async () => {
  if (!supabase) {
    console.error('Supabase client not initialized - missing or invalid configuration');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('aircraft')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};