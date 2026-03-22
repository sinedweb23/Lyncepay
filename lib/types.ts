export type EmpresaStatus = 'ativo' | 'inativo' | 'suspenso'

export interface EmpresaConfig {
  rede?: {
    env?: 'sandbox' | 'production'
    pv_sandbox?: string
    token_sandbox?: string
    url_sandbox?: string
    pv_production?: string
    token_production?: string
    url_production?: string
    webhook_token?: string
  }
  twilio?: {
    account_sid?: string
    auth_token?: string
    whatsapp_number?: string
    aviso_saldo_api_key?: string
  }
  google?: {
    calendar_id?: string
  }
  importacao?: {
    api_key?: string
  }
}

export interface EmpresaPlatform {
  id: string
  nome: string
  slug: string
  database_url: string | null
  supabase_url: string
  supabase_anon_key: string
  supabase_service_role_key: string | null
  status: EmpresaStatus
  config: EmpresaConfig | null
  created_at: string
  updated_at: string
}

export interface EmpresaPlatformInsert {
  nome: string
  slug: string
  database_url?: string | null
  supabase_url: string
  supabase_anon_key: string
  supabase_service_role_key?: string | null
  status?: EmpresaStatus
  config?: EmpresaConfig | null
}

export interface EmpresaPlatformUpdate {
  nome?: string
  slug?: string
  database_url?: string | null
  supabase_url?: string
  supabase_anon_key?: string
  supabase_service_role_key?: string | null
  status?: EmpresaStatus
  config?: EmpresaConfig | null
}
