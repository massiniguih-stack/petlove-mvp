import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-500">
        <p>PetLove MVP - Projeto em construção</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/politica-de-privacidade" className="text-slate-500 underline transition hover:text-amber-600">
            Política de Privacidade
          </Link>
        </div>
        <p className="mt-2">Em caso de emergência, procure um veterinário.</p>
      </div>
    </footer>
  );
}
