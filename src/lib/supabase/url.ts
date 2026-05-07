export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
}
