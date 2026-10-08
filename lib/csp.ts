export function buildCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://connect.facebook.net https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.supabase.co https://*.mapbox.com https://maps.gstatic.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://www.facebook.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://viacep.com.br https://*.mapbox.com https://router.project-osrm.org https://firebaseinstallations.googleapis.com https://fcm.googleapis.com https://firebase.googleapis.com https://*.googleapis.com https://www.facebook.com https://connect.facebook.net https://lastlink.com https://*.lastlink.com",
    "worker-src 'self' blob:",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
