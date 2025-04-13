import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- REMOVED DEBUGGING LINES ---
// console.log("DEBUG: VITE_SUPABASE_URL read as:", supabaseUrl);
// console.log("DEBUG: VITE_SUPABASE_ANON_KEY read as:", supabaseAnonKey);
// ---

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);