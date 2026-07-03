import { AuthProvider } from '@/providers/AuthProvider'
import './globals.css'

export const metadata = {
  title: 'PetLove - Cuidados para seu pet',
  description: 'Encontre os melhores serviços para seu animal de estimação',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
