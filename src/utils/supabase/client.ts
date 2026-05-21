import { createClient } from "@supabase/supabase-js";

// Try to read both Vite and Next.js style env variables if exposed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabaseInstance: any = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

if (!supabaseInstance) {
  console.warn("Supabase credentials missing or invalid. Campaign Launch Checklist will show empty.");
  // Provide a safe mock to prevent uncaught exceptions when calling .from().select()
  supabaseInstance = {
    from: () => ({
      select: async () => ({
        data: [],
        error: { message: "Supabase credentials missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project environment variables." }
      })
    })
  };
}

export const supabase = supabaseInstance;

