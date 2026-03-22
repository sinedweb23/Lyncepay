import Link from 'next/link'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center gap-6 px-4">
          <Link href="/" className="font-semibold text-slate-800">
            Painel SaaS
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/empresas" className="text-sm text-slate-600 hover:text-slate-900">
              Empresas
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
