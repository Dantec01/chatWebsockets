import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error(
        "[v0] Error: Variables de entorno de Supabase no configuradas",
        {
          url: url ? "✓" : "✗ NEXT_PUBLIC_SUPABASE_URL",
          key: key ? "✓" : "✗ NEXT_PUBLIC_SUPABASE_ANON_KEY",
        },
      )
      throw new Error("Supabase environment variables not configured. Please check your .env.local file or Vercel settings.")
    }

    supabaseInstance = createBrowserClient(url, key)
  }
  return supabaseInstance
}
