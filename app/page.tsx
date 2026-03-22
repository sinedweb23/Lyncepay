import { redirect } from 'next/navigation'
import { isMasterConfigured } from '@/lib/supabase/master'

export default function HomePage() {
  if (!isMasterConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-lg font-semibold">Banco MASTER não configurado</h1>
          <p className="mt-2 text-sm">
            Defina <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_MASTER_SUPABASE_URL</code> e{' '}
            <code className="rounded bg-amber-100 px-1">MASTER_SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis de ambiente (local: .env.local | Vercel: Project Settings → Environment Variables).
          </p>
        </div>
      </div>
    )
  }
  redirect('/dashboard')
}
