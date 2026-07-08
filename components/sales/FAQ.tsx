'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const faqs = [
  {
    q: 'O PetLove e gratuito?',
    a: 'Sim! Voce pode usar as funcionalidades basicas gratuitamente. Para desbloquear tudo, assine o Premium por R$ 19,90/mes.',
  },
  {
    q: 'Como funciona o plano Premium?',
    a: 'O Premium desbloqueia multi-pets, graficos avancados, plano alimentar, exercicios, alertas de vacinas, relatorios de saude e suporte prioritario.',
  },
  {
    q: 'Posso cadastrar quantos pets?',
    a: 'No plano gratuito, voce pode cadastrar 1 pet. No Premium, o cadastro e ilimitado.',
  },
  {
    q: 'Meus dados estao seguros?',
    a: 'Sim! Seguimos a LGPD rigorosamente e usamos criptografia em todos os dados. Consulte nossa Politica de Privacidade.',
  },
  {
    q: 'Como cancelo a assinatura?',
    a: 'A qualquer momento, sem burocracia. Basta acessar suas configuracoes e cancelar. Voce continua com acesso ate o fim do periodo.',
  },
  {
    q: 'Tem app mobile?',
    a: 'Estamos desenvolvendo! Por enquanto, acesse pelo navegador do celular, o app e 100% responsivo.',
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl font-black tracking-tighter md:text-4xl"
        >
          Perguntas frequentes
        </motion.h2>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03]"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-bold text-white">{f.q}</span>
                <ChevronIcon open={open === i} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
