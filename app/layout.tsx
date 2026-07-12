import { AuthProvider } from '@/providers/AuthProvider'
import { DarkModeProvider } from '@/providers/DarkModeProvider'
import { SubscriptionLoader } from '@/components/SubscriptionLoader'
import { Plus_Jakarta_Sans } from 'next/font/google'
import '../styles/globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata = {
  title: 'PetLove - Cuidados para seu pet',
  description: 'Encontre os melhores serviços para seu animal de estimação. Passeios, banho, veterinário, hotel e mais.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'PetLove - Cuidados para seu pet',
    description: 'Encontre os melhores serviços para seu animal de estimação. Passeios, banho, veterinário, hotel e mais.',
    url: 'https://petlove.vercel.app',
    siteName: 'PetLove',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PetLove - Cuidados para seu pet',
    description: 'Encontre os melhores serviços para seu animal de estimação.',
  },
  metadataBase: new URL('https://petlove.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={jakarta.variable} suppressHydrationWarning>
      <body className={`${jakarta.className} antialiased`}>
        <DarkModeProvider>
          <AuthProvider>
            <SubscriptionLoader>{children}</SubscriptionLoader>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
}
