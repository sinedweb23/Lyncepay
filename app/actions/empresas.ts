'use server'

import { createMasterClient, isMasterConfigured } from '@/lib/supabase/master'
import type { EmpresaPlatformInsert, EmpresaPlatformUpdate } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function listarEmpresas() {
  if (!isMasterConfigured()) throw new Error('Banco MASTER não configurado.')
  const master = createMasterClient()
  const { data, error } = await master.from('empresas').select('*').order('nome')
  if (error) throw new Error('Erro ao carregar empresas')
  return data ?? []
}

export async function criarEmpresa(dados: EmpresaPlatformInsert) {
  if (!isMasterConfigured()) throw new Error('Banco MASTER não configurado.')
  const master = createMasterClient()
  const slug = dados.slug.trim().toLowerCase().replace(/\s+/g, '-')
  const { data, error } = await master
    .from('empresas')
    .insert({
      nome: dados.nome,
      slug,
      database_url: dados.database_url ?? null,
      supabase_url: dados.supabase_url,
      supabase_anon_key: dados.supabase_anon_key,
      supabase_service_role_key: dados.supabase_service_role_key ?? null,
      status: dados.status ?? 'ativo',
      config: dados.config ?? {},
    })
    .select()
    .single()
  if (error) throw new Error(error.message ?? 'Erro ao criar empresa')
  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/empresas')
  return data
}

export async function atualizarEmpresa(id: string, dados: EmpresaPlatformUpdate) {
  if (!isMasterConfigured()) throw new Error('Banco MASTER não configurado.')
  const master = createMasterClient()
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (dados.nome !== undefined) payload.nome = dados.nome
  if (dados.slug !== undefined) payload.slug = dados.slug.trim().toLowerCase().replace(/\s+/g, '-')
  if (dados.database_url !== undefined) payload.database_url = dados.database_url
  if (dados.supabase_url !== undefined) payload.supabase_url = dados.supabase_url
  if (dados.supabase_anon_key !== undefined && dados.supabase_anon_key !== '') {
    payload.supabase_anon_key = dados.supabase_anon_key
  }
  if (dados.supabase_service_role_key !== undefined) {
    payload.supabase_service_role_key = dados.supabase_service_role_key === '' ? null : dados.supabase_service_role_key
  }
  if (dados.status !== undefined) payload.status = dados.status
  if (dados.config !== undefined) payload.config = dados.config

  const { data, error } = await master.from('empresas').update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message ?? 'Erro ao atualizar empresa')
  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/empresas')
  return data
}

export async function desativarEmpresa(id: string) {
  return atualizarEmpresa(id, { status: 'inativo' })
}

export async function ativarEmpresa(id: string) {
  return atualizarEmpresa(id, { status: 'ativo' })
}
