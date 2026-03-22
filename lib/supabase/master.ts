import { createClient } from '@supabase/supabase-js'

const masterUrl = process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL
const masterServiceKey = process.env.MASTER_SUPABASE_SERVICE_ROLE_KEY

export function createMasterClient() {
  if (!masterUrl || !masterServiceKey) {
    throw new Error(
      'Banco MASTER não configurado. Defina NEXT_PUBLIC_MASTER_SUPABASE_URL e MASTER_SUPABASE_SERVICE_ROLE_KEY.'
    )
  }
  return createClient(masterUrl, masterServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function isMasterConfigured(): boolean {
  return Boolean(masterUrl && masterServiceKey)
}
