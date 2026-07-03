import Link from 'next/link'

export function EmailVerification() {
  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">📧</div>
      <h2 className="text-2xl font-bold text-gray-800">Verifique seu email</h2>
      <p className="text-gray-600">
        Enviamos um link de verificação para o seu email.
        <br />
        Clique no link para ativar sua conta.
      </p>
      <p className="text-sm text-gray-500">
        Não recebeu? Verifique sua caixa de spam.
      </p>
      <Link
        href="/login"
        className="inline-block text-orange-500 hover:underline"
      >
        Voltar para o login
      </Link>
    </div>
  )
}
