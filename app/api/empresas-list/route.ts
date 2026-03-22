import { NextRequest, NextResponse } from 'next/server'
import { createMasterClient, isMasterConfigured } from '@/lib/supabase/master'

/**
 * API para o app da cantina listar empresas ativas (para select no login).
 * Protegida por API key (header Authorization: Bearer <SAAS_PANEL_API_KEY> ou x-api-key).
 * GET /api/empresas-list
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? request.headers.get('x-api-key')
  const expectedKey = process.env.SAAS_PANEL_API_KEY
  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isMasterConfigured()) {
    return NextResponse.json({ error: 'Master not configured' }, { status: 500 })
  }

  const master = createMasterClient()
  const { data, error } = await master
    .from('empresas')
    .select('id, nome, slug')
    .eq('status', 'ativo')
    .order('nome')

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  return NextResponse.json(data ?? [])
}
