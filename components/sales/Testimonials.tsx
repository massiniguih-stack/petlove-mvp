'use client';

import { motion, useReducedMotion } from 'motion/react';

const testimonials = [
  {
    name: 'Mariana',
    dog: 'Mae do Thor',
    text: 'Finalmente um app que entende o que eu preciso como tutora. O mapa de servicos me salvou quando precisei de um veterinario emergencial.',
    stars: 5,
  },
  {
    name: 'Pedro',
    dog: 'Pai da Luna',
    text: 'O plano alimentar fez uma diferenca enorme na saude da minha cao. Ela perdeu o peso que precisava e esta super disposta.',
    stars: 5,
  },
  {
    name: 'Ana',
    dog: 'Mae do Max e da Mel',
    text: 'Ter dois pets no premium e poder alternar entre eles e incrivel. Cada um com seu historico completo.',
    stars: 5,
  },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PawAvatar({ letter }: { letter: string }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-sm font-bold text-amber-400">
      {letter}
      <svg className="absolute -bottom-0.5 -right-0.5" width="12" height="12" viewBox="0 0 100 100">
        <ellipse cx="50" cy="78" rx="16" ry="12" fill="currentColor" className="text-amber-500/40"/>
        <ellipse cx="30" cy="55" rx="9" ry="9" fill="currentColor" className="text-amber-500/30"/>
        <ellipse cx="50" cy="48" rx="9" ry="9" fill="currentColor" className="text-amber-500/30"/>
        <ellipse cx="70" cy="55" rx="9" ry="9" fill="currentColor" className="text-amber-500/30"/>
      </svg>
    </div>
  );
}

export default function Testimonials() {
  const reduce = useReducedMotion();

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl font-black tracking-tighter md:text-4xl"
        >
          Quem usa,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            recomenda
          </span>
        </motion.h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }, (_, si) => (
                  <StarIcon key={si} filled={si < t.stars} />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-4">
                <PawAvatar letter={t.name[0]} />
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.dog}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
