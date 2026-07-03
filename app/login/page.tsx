import { LoginForm } from '@/components/auth/LoginForm'
import { GoogleButton } from '@/components/auth/GoogleButton'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🐕 PetLove</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <LoginForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <GoogleButton />

          <p className="text-center mt-6 text-sm text-gray-600">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-orange-500 hover:underline font-medium">
              Cadastrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
