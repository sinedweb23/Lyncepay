import { NextRequest, NextResponse } from 'next/server'
import { createMasterClient, isMasterConfigured } from '@/lib/supabase/master'

function checkAuth(request: NextRequest): boolean {
  const apiKey = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? request.headers.get('x-api-key')
  const expectedKey = process.env.SAAS_PANEL_API_KEY
  return Boolean(expectedKey && apiKey === expectedKey)
}

/**
 * Registra mapeamento gateway_id -> tenant_slug (para webhook multi-tenant).
 * POST /api/gateway-tenant
 * Body: { gateway_id: string, tenant_slug: string }
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isMasterConfigured()) {
    return NextResponse.json({ error: 'Master not configured' }, { status: 500 })
  }

  let body: { gateway_id?: string; tenant_slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const gatewayId = String(body.gateway_id ?? '').trim()
  const tenantSlug = String(body.tenant_slug ?? '').trim().toLowerCase()

  if (!gatewayId || !tenantSlug) {
    return NextResponse.json({ error: 'gateway_id e tenant_slug obrigatórios' }, { status: 400 })
  }

  const master = createMasterClient()
  const { error } = await master
    .from('gateway_tenant_mapping')
    .upsert({ gateway_id: gatewayId, tenant_slug: tenantSlug }, { onConflict: 'gateway_id' })

  if (error) {
    console.error('[gateway-tenant] Erro ao registrar:', error)
    return NextResponse.json({ error: 'Erro ao registrar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

/**
 * Busca tenant_slug por gateway_id (para webhook rotear ao banco correto).
 * GET /api/gateway-tenant?gateway_id=xxx
 */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isMasterConfigured()) {
    return NextResponse.json({ error: 'Master not configured' }, { status: 500 })
  }

  const gatewayId = request.nextUrl.searchParams.get('gateway_id')?.trim()
  if (!gatewayId) {
    return NextResponse.json({ error: 'gateway_id obrigatório' }, { status: 400 })
  }

  const master = createMasterClient()
  const { data, error } = await master
    .from('gateway_tenant_mapping')
    .select('tenant_slug')
    .eq('gateway_id', gatewayId)
    .maybeSingle()

  if (error) {
    console.error('[gateway-tenant] Erro ao buscar:', error)
    return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ tenant_slug: data.tenant_slug })
}
