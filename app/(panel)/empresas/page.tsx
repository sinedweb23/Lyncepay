'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  listarEmpresas,
  criarEmpresa,
  atualizarEmpresa,
  ativarEmpresa,
  desativarEmpresa,
} from '@/app/actions/empresas'
import type { EmpresaConfig } from '@/lib/types'

type EmpresaRow = {
  id: string
  nome: string
  slug: string
  supabase_url: string
  supabase_service_role_key?: string | null
  database_url?: string | null
  status: string
  config?: EmpresaConfig | null
}

const defaultConfig: EmpresaConfig = {
  rede: {},
  twilio: {},
  google: {},
  importacao: {},
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<EmpresaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'supabase' | 'rede' | 'twilio' | 'google' | 'importacao'>('supabase')
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    supabase_url: '',
    supabase_anon_key: '',
    supabase_service_role_key: '',
    database_url: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'suspenso',
    config: { ...defaultConfig } as EmpresaConfig,
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const data = await listarEmpresas()
      setEmpresas(data as EmpresaRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm({
      nome: '',
      slug: '',
      supabase_url: '',
      supabase_anon_key: '',
      supabase_service_role_key: '',
      database_url: '',
      status: 'ativo',
      config: { ...defaultConfig },
    })
    setActiveTab('supabase')
    setModalOpen(true)
  }

  function openEdit(e: EmpresaRow) {
    setEditingId(e.id)
    const cfg = e.config ?? {}
    setForm({
      nome: e.nome,
      slug: e.slug,
      supabase_url: e.supabase_url,
      supabase_anon_key: '',
      supabase_service_role_key: '',
      database_url: e.database_url ?? '',
      status: e.status as 'ativo' | 'inativo' | 'suspenso',
      config: {
        rede: cfg.rede ?? {},
        twilio: cfg.twilio ?? {},
        google: cfg.google ?? {},
        importacao: cfg.importacao ?? {},
      },
    })
    setActiveTab('supabase')
    setModalOpen(true)
  }

  async function submit() {
    try {
      setError(null)
      const anonKey = form.supabase_anon_key?.trim()
      const serviceRoleKey = form.supabase_service_role_key?.trim()
      const payload: Record<string, unknown> = {
        nome: form.nome,
        slug: form.slug,
        supabase_url: form.supabase_url,
        database_url: form.database_url || null,
        status: form.status,
        config: form.config,
      }
      if (anonKey) payload.supabase_anon_key = anonKey
      if (serviceRoleKey) payload.supabase_service_role_key = serviceRoleKey
      if (editingId) {
        await atualizarEmpresa(editingId, payload)
      } else {
        if (!anonKey) throw new Error('Chave anon é obrigatória para nova empresa.')
        await criarEmpresa({ ...payload, supabase_anon_key: anonKey } as Parameters<typeof criarEmpresa>[0])
      }
      setModalOpen(false)
      setError(null)
      setSuccess('Salvo com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
      load()
    } catch (e) {
      setSuccess(null)
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  async function toggleStatus(e: EmpresaRow) {
    try {
      if (e.status === 'ativo') await desativarEmpresa(e.id)
      else await ativarEmpresa(e.id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao alterar status')
    }
  }

  const tabs = [
    { id: 'supabase' as const, label: 'Supabase' },
    { id: 'rede' as const, label: 'Rede (e.Rede)' },
    { id: 'twilio' as const, label: 'Twilio' },
    { id: 'google' as const, label: 'Google' },
    { id: 'importacao' as const, label: 'Importação' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-slate-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-slate-500">Configure cada escola (Supabase, Rede, Twilio, etc.)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Dashboard
          </Link>
          <button type="button" onClick={openCreate} className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Nova empresa
          </button>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold">Lista de empresas</h2>
          <p className="text-sm text-slate-500">As cantinas consultam as configs via API</p>
        </div>
        <div className="p-4">
          {empresas.length === 0 ? (
            <p className="py-8 text-center text-slate-500">Nenhuma empresa cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {empresas.map((e) => (
                <div key={e.id} className="flex justify-between items-center rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{e.nome}</p>
                    <p className="text-sm text-slate-500">{e.slug} · {e.supabase_url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                      {e.status}
                    </span>
                    <button type="button" onClick={() => openEdit(e)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50">Editar</button>
                    <button type="button" onClick={() => toggleStatus(e)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50">
                      {e.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-white shadow-lg flex flex-col">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Editar empresa' : 'Nova empresa'}</h2>
              <p className="text-sm text-slate-500">Variáveis que as cantinas consultam</p>
            </div>
            <div className="flex border-b">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === t.id ? 'border-b-2 border-slate-800 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'supabase' && (
                <>
                  <div><label className="block text-sm font-medium text-slate-700">Nome</label><input type="text" value={form.nome} onChange={(ev) => setForm((f) => ({ ...f, nome: ev.target.value }))} placeholder="Escola Exemplo" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Slug (único)</label><input type="text" value={form.slug} onChange={(ev) => setForm((f) => ({ ...f, slug: ev.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="escola-exemplo" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Supabase URL</label><input type="url" value={form.supabase_url} onChange={(ev) => setForm((f) => ({ ...f, supabase_url: ev.target.value }))} placeholder="https://xxx.supabase.co" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Supabase Anon Key {editingId && '(vazio = não alterar)'}</label><input type="password" autoComplete="new-password" value={form.supabase_anon_key} onChange={(ev) => setForm((f) => ({ ...f, supabase_anon_key: ev.target.value }))} placeholder={editingId ? '•••••••• (salvo — digite para alterar)' : 'eyJ...'} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Supabase Service Role Key {editingId && '(vazio = não alterar)'}</label><input type="password" autoComplete="new-password" value={form.supabase_service_role_key} onChange={(ev) => setForm((f) => ({ ...f, supabase_service_role_key: ev.target.value }))} placeholder={editingId ? '•••••••• (salvo — digite para alterar)' : 'eyJ...'} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /><p className="mt-0.5 text-xs text-slate-500">Necessário para operações admin nas cantinas (server-side apenas)</p></div>
                  <div><label className="block text-sm font-medium text-slate-700">Database URL (opcional)</label><input type="text" value={form.database_url} onChange={(ev) => setForm((f) => ({ ...f, database_url: ev.target.value }))} placeholder="postgresql://..." className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  {editingId && <div><label className="block text-sm font-medium text-slate-700">Status</label><select value={form.status} onChange={(ev) => setForm((f) => ({ ...f, status: ev.target.value as 'ativo' | 'inativo' | 'suspenso' }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"><option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="suspenso">Suspenso</option></select></div>}
                </>
              )}
              {activeTab === 'rede' && (
                <>
                  <div><label className="block text-sm font-medium text-slate-700">Ambiente</label><select value={form.config.rede?.env || 'sandbox'} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, env: ev.target.value as 'sandbox' | 'production' } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"><option value="sandbox">Sandbox</option><option value="production">Production</option></select></div>
                  <div><label className="block text-sm font-medium text-slate-700">PV Sandbox</label><input type="text" value={form.config.rede?.pv_sandbox || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, pv_sandbox: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Token Sandbox</label><input type="password" value={form.config.rede?.token_sandbox || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, token_sandbox: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">URL Sandbox</label><input type="text" value={form.config.rede?.url_sandbox || 'https://sandbox-erede.useredecloud.com.br/v1/transactions'} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, url_sandbox: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">PV Production</label><input type="text" value={form.config.rede?.pv_production || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, pv_production: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Token Production</label><input type="password" value={form.config.rede?.token_production || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, token_production: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">URL Production</label><input type="text" value={form.config.rede?.url_production || 'https://api.userede.com.br/erede/v1/transactions'} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, url_production: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Webhook Token</label><input type="text" value={form.config.rede?.webhook_token || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, rede: { ...f.config.rede, webhook_token: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                </>
              )}
              {activeTab === 'twilio' && (
                <>
                  <div><label className="block text-sm font-medium text-slate-700">Account SID</label><input type="text" value={form.config.twilio?.account_sid || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, twilio: { ...f.config.twilio, account_sid: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Auth Token</label><input type="password" value={form.config.twilio?.auth_token || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, twilio: { ...f.config.twilio, auth_token: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">WhatsApp Number</label><input type="text" value={form.config.twilio?.whatsapp_number || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, twilio: { ...f.config.twilio, whatsapp_number: ev.target.value } } }))} placeholder="whatsapp:+5511999999999" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-slate-700">Aviso Saldo API Key</label><input type="text" value={form.config.twilio?.aviso_saldo_api_key || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, twilio: { ...f.config.twilio, aviso_saldo_api_key: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
                </>
              )}
              {activeTab === 'google' && (
                <div><label className="block text-sm font-medium text-slate-700">Calendar ID</label><input type="text" value={form.config.google?.calendar_id || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, google: { ...f.config.google, calendar_id: ev.target.value } } }))} placeholder="primary ou email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
              )}
              {activeTab === 'importacao' && (
                <div><label className="block text-sm font-medium text-slate-700">API Key</label><input type="text" value={form.config.importacao?.api_key || ''} onChange={(ev) => setForm((f) => ({ ...f, config: { ...f.config, importacao: { ...f.config.importacao, api_key: ev.target.value } } }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></div>
              )}
            </div>
            <div className="border-t p-4 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={submit} className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">{editingId ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
