import Link from 'next/link'

export function EmailVerification() {
  return (
    <div className="animate-fade-in text-center space-y-4">
      <div className="animate-bounce-gentle text-6xl">📧</div>
      <h2 className="animate-slide-up text-2xl font-bold text-slate-900">Verifique seu email</h2>
      <p className="animate-slide-up-delay-1 text-slate-600">
        Enviamos um link de verificação para o seu email.
        <br />
        Clique no link para ativar sua conta.
      </p>
      <p className="animate-slide-up-delay-2 text-sm text-slate-500">
        Não recebeu? Verifique sua caixa de spam.
      </p>
      <div className="animate-slide-up-delay-3">
        <Link
          href="/login"
          className="inline-block font-semibold text-amber-600 hover:text-amber-700 transition-colors duration-200"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
