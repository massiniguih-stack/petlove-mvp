export function isOpenAccess(): boolean {
  const vercelEnv = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === 'production') return false;
  return (
    process.env.OPEN_ACCESS === 'true' ||
    process.env.NEXT_PUBLIC_OPEN_ACCESS === 'true'
  );
}
