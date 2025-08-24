// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Get these values from your Supabase project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase config:", { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey 
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Since we're using Firebase for auth
  }
})
