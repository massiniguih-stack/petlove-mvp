import { ForgotPassword } from '@/components/auth/ForgotPassword'

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🐕 PetLove</h1>
          <p className="text-gray-600 mt-2">Redefina sua senha</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <ForgotPassword />
        </div>
      </div>
    </div>
  )
}
