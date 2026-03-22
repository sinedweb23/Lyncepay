import { NextRequest, NextResponse } from 'next/server'
import { createMasterClient, isMasterConfigured } from '@/lib/supabase/master'

/**
 * API para o app da cantina obter credenciais do tenant por slug.
 * Protegida por API key (header Authorization: Bearer <SAAS_PANEL_API_KEY> ou x-api-key).
 * GET /api/tenant-credentials?slug=escola-msul
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
    .select('supabase_url, supabase_anon_key')
    .eq('slug', slug)
    .eq('status', 'ativo')
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Empresa not found or inactive' }, { status: 404 })

  return NextResponse.json({
    supabase_url: data.supabase_url,
    supabase_anon_key: data.supabase_anon_key,
  })
}
