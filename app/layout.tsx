import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Painel SaaS | Lyncepay',
  description: 'Gerenciamento de clientes da plataforma',
  icons: {
    icon: '/icon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  )
}
