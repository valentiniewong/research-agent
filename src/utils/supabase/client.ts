import { createBrowserClient } from "@supabase/ssr";
import { createClient as createLegacyClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Browser client creator for Supabase SSR
export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

// Legacy singleton instance for backward compatibility with existing code
let supabaseInstance: any = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseInstance = createLegacyClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

if (!supabaseInstance) {
  console.warn("Supabase credentials missing or invalid. Dashboard items will show fallback data.");
  supabaseInstance = {
    from: () => ({
      select: async () => ({
        data: [],
        error: { message: "Supabase credentials missing." }
      })
    })
  };
}

export const supabase = supabaseInstance;
