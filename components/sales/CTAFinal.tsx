'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

export default function CTAFinal() {
  const reduce = useReducedMotion();

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-transparent p-12 text-center md:p-16"
        >
          <div className="pointer-events-none absolute inset-0">
            <svg className="absolute left-4 top-4 opacity-15" width="40" height="40" viewBox="0 0 100 100">
              <ellipse cx="50" cy="78" rx="16" ry="12" fill="#fbbf24"/>
              <ellipse cx="30" cy="55" rx="9" ry="9" fill="#fbbf24"/>
              <ellipse cx="50" cy="48" rx="9" ry="9" fill="#fbbf24"/>
              <ellipse cx="70" cy="55" rx="9" ry="9" fill="#fbbf24"/>
            </svg>
            <svg className="absolute bottom-6 right-6 opacity-10" width="50" height="50" viewBox="0 0 100 100">
              <ellipse cx="50" cy="78" rx="16" ry="12" fill="#fbbf24"/>
              <ellipse cx="30" cy="55" rx="9" ry="9" fill="#fbbf24"/>
              <ellipse cx="50" cy="48" rx="9" ry="9" fill="#fbbf24"/>
              <ellipse cx="70" cy="55" rx="9" ry="9" fill="#fbbf24"/>
            </svg>
          </div>

          <h2 className="relative text-3xl font-black tracking-tighter md:text-4xl">
            Seu cachorro merece o{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              melhor cuidado
            </span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-400">
            Comece agora mesmo. e gratuito pra sempre, ou assine o premium e desbloqueie todo o potencial do PetLove.
          </p>
          <Link
            href="/cadastro"
            className="relative mt-8 inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30 active:scale-[0.98]"
          >
            Comecar agora
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
