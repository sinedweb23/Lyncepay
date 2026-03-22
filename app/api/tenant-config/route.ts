import { NextRequest, NextResponse } from 'next/server'
import { createMasterClient, isMasterConfigured } from '@/lib/supabase/master'

/**
 * API para as cantinas obterem TODAS as variáveis/config por slug.
 * Retorna: supabase, rede, twilio, google, importacao.
 * Protegida por API key.
 * GET /api/tenant-config?slug=escola-msul
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? request.headers.get('x-api-key')
  const expectedKey = process.env.SAAS_PANEL_API_KEY
  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get('slug')?.trim().toLowerCase()
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  if (!isMasterConfigured()) {
    return NextResponse.json({ error: 'Master not configured' }, { status: 500 })
  }

  const master = createMasterClient()
  const { data, error } = await master
    .from('empresas')
    .select('supabase_url, supabase_anon_key, supabase_service_role_key, config')
    .eq('slug', slug)
    .eq('status', 'ativo')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Empresa not found or inactive' }, { status: 404 })
  }

  const config = (data.config as Record<string, unknown>) ?? {}
  const rede = (config.rede as Record<string, string>) ?? {}
  const twilio = (config.twilio as Record<string, string>) ?? {}
  const google = (config.google as Record<string, string>) ?? {}
  const importacao = (config.importacao as Record<string, string>) ?? {}

  return NextResponse.json({
    supabase_url: data.supabase_url,
    supabase_anon_key: data.supabase_anon_key,
    supabase_service_role_key: data.supabase_service_role_key ?? null,
    rede: {
      env: rede.env || 'sandbox',
      pv_sandbox: rede.pv_sandbox || '',
      token_sandbox: rede.token_sandbox || '',
      url_sandbox: rede.url_sandbox || 'https://sandbox-erede.useredecloud.com.br/v1/transactions',
      pv_production: rede.pv_production || '',
      token_production: rede.token_production || '',
      url_production: rede.url_production || 'https://api.userede.com.br/erede/v1/transactions',
      webhook_token: rede.webhook_token || '',
    },
    twilio: {
      account_sid: twilio.account_sid || '',
      auth_token: twilio.auth_token || '',
      whatsapp_number: twilio.whatsapp_number || '',
      aviso_saldo_api_key: twilio.aviso_saldo_api_key || '',
    },
    google: {
      calendar_id: google.calendar_id || '',
    },
    importacao: {
      api_key: importacao.api_key || '',
    },
  })
}
