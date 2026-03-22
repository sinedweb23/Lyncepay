import { isMasterConfigured } from '@/lib/supabase/master'
import { listarEmpresas } from '@/app/actions/empresas'
import Link from 'next/link'

export default async function DashboardPage() {
  if (!isMasterConfigured()) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
        Configure o banco MASTER para ver o dashboard.
      </div>
    )
  }

  const empresas = await listarEmpresas()
  const ativas = empresas.filter((e: { status: string }) => e.status === 'ativo')
  const inativas = empresas.filter((e: { status: string }) => e.status === 'inativo')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-slate-600">Visão geral da plataforma SaaS</p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total de empresas</p>
          <p className="text-3xl font-bold">{empresas.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ativas</p>
          <p className="text-3xl font-bold text-green-600">{ativas.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Inativas</p>
          <p className="text-3xl font-bold text-slate-500">{inativas.length}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Empresas</h2>
        <p className="text-sm text-slate-500">Clientes cadastrados</p>
        {empresas.length === 0 ? (
          <p className="mt-4 text-slate-500">Nenhuma empresa cadastrada.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {empresas.slice(0, 10).map((e: { id: string; nome: string; slug: string; status: string }) => (
              <li key={e.id} className="flex justify-between rounded border p-2 text-sm">
                <span className="font-medium">{e.nome}</span>
                <span className="text-slate-500">{e.slug} · {e.status}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <Link
            href="/empresas"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver todas
          </Link>
        </div>
      </div>
    </div>
  )
}
