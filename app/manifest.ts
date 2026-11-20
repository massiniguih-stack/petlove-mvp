import type { MetadataRoute } from 'next';

// Permite instalar o Patinha na tela de início. No iPhone isso é obrigatório
// para receber notificações (a Apple só libera push para site instalado).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Patinha — Cuidados para o pet',
    short_name: 'Patinha',
    description: 'Ração, atividades, saúde e lembretes de vacina do seu pet.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#f97316',
    lang: 'pt-BR',
    icons: [
      { src: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png?v=2', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
