'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

const freeFeatures = [
  'Perfil do pet',
  'Cadastro de 1 pet',
  'Controle de peso basico',
  'Linha do tempo',
  'Mapa de servicos',
];

const premiumFeatures = [
  'Tudo do plano gratis',
  'Cadastro ilimitado de pets',
  'Controle de peso com graficos',
  'Plano alimentar personalizado',
  'Plano de exercicios completo',
  'Alertas de vacinas e consultas',
  'Relatorios de saude',
  'Suporte prioritario',
];

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Pricing() {
  const reduce = useReducedMotion();

  return (
    <section id="planos" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl font-black tracking-tighter md:text-4xl"
        >
          Comece gratis,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            evolua quando quiser
          </span>
        </motion.h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Free plan */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gratuito</h3>
                <p className="text-xs text-slate-500">Para comecar</p>
              </div>
            </div>
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <ul className="space-y-3">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckIcon className="text-slate-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/cadastro"
              className="mt-8 block w-full rounded-full border border-white/10 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.06] active:scale-[0.98]"
            >
              Criar conta gratis
            </Link>
          </motion.div>

          {/* Premium plan */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] to-transparent p-8"
          >
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Premium</h3>
                <p className="text-xs text-amber-400/80">R$ 19,90/mes</p>
              </div>
            </div>
            <div className="mt-6 border-t border-amber-500/20 pt-6">
              <ul className="space-y-3">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckIcon className="text-amber-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/cadastro"
              className="mt-8 block w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30 active:scale-[0.98]"
            >
              Assinar Premium
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
