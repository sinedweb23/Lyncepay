import { createClient } from '@supabase/supabase-js'

// Lê no momento da chamada (runtime), não no carregamento do módulo - evita problema na Vercel
function getMasterConfig() {
  const masterUrl = process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL
  const masterServiceKey = process.env.MASTER_SUPABASE_SERVICE_ROLE_KEY
  return { masterUrl, masterServiceKey }
}

export function createMasterClient() {
  const { masterUrl, masterServiceKey } = getMasterConfig()
  if (!masterUrl || !masterServiceKey) {
    throw new Error(
      'Banco MASTER não configurado. Defina NEXT_PUBLIC_MASTER_SUPABASE_URL e MASTER_SUPABASE_SERVICE_ROLE_KEY (local: .env.local | Vercel: variáveis de ambiente do projeto).'
    )
  }
  return createClient(masterUrl, masterServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function isMasterConfigured(): boolean {
  const { masterUrl, masterServiceKey } = getMasterConfig()
  return Boolean(masterUrl && masterServiceKey)
}
