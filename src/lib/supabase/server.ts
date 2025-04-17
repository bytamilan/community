import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"


// Create a cached version of the Supabase client for Server Components
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({name, value, options}) => cookieStore.set(name, value, options))
            } catch (e) {
              console.error("Could not set all cookies.", e)
            }
          },
        },
      },
  );
};


// Check if Supabase environment variables are available
export const isSupabaseConfigured =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
