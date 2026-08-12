import { AuthProvider } from '@/providers/AuthProvider'
import { DarkModeProvider } from '@/providers/DarkModeProvider'
import { SubscriptionLoader } from '@/components/SubscriptionLoader'
import { UtmCapture } from '@/components/UtmCapture'
import { MetaPixel } from '@/components/MetaPixel'
import { Plus_Jakarta_Sans } from 'next/font/google'
import '../styles/globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata = {
  title: 'Patinha - Cuidados para seu pet',
  description: 'Encontre os melhores serviços para seu animal de estimação. Passeios, banho, veterinário, hotel e mais.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Patinha - Cuidados para seu pet',
    description: 'Encontre os melhores serviços para seu animal de estimação. Passeios, banho, veterinário, hotel e mais.',
    url: 'https://patinha-mvp.vercel.app',
    siteName: 'Patinha',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Patinha - Cuidados para seu pet' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patinha - Cuidados para seu pet',
    description: 'Encontre os melhores serviços para seu animal de estimação.',
    images: ['/og-image.png'],
  },
  metadataBase: new URL('https://patinha-mvp.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={jakarta.variable} suppressHydrationWarning>
      <body className={`${jakarta.className} antialiased`}>
        <MetaPixel />
        <UtmCapture />
        <DarkModeProvider>
          <AuthProvider>
            <SubscriptionLoader>{children}</SubscriptionLoader>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
}
