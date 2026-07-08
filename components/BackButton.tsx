'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = 'Voltar', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`group inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-md hover:ring-slate-300/60 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
      >
        <path d="M19 12H5" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      {label}
    </button>
  )
}
