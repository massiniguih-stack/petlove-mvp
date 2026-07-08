'use client';

import { motion, useReducedMotion } from 'motion/react';

const screenshots = [
  {
    title: 'Dashboard',
    description: 'Peso, vacinas e saude',
    color: 'from-amber-500 to-orange-500',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
      </svg>
    ),
    stats: ['4.2 kg', '3 vacinas', '12 meses'],
  },
  {
    title: 'Mapa de Servicos',
    description: 'Encontre perto de voce',
    color: 'from-rose-500 to-pink-500',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    stats: ['86 cidades', '150+ servicos', '4.8 avaliacao'],
  },
  {
    title: 'Racao',
    description: 'Nutricao ideal',
    color: 'from-emerald-500 to-teal-500',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
    stats: ['32 marcas', 'Porcao diaria', 'Suplementacao'],
  },
  {
    title: 'Linha do Tempo',
    description: 'Marcos e conquistas',
    color: 'from-purple-500 to-violet-500',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    stats: ['15 marcos', '8 fotos', 'Vacinas ok'],
  },
  {
    title: 'Atividades',
    description: 'Exercicios diarios',
    color: 'from-blue-500 to-cyan-500',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    stats: ['12 exercicios', '30 min/dia', 'Nivel medio'],
  },
];

export default function Demo() {
  const reduce = useReducedMotion();

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl font-black tracking-tighter md:text-4xl"
        >
          Veja como funciona
        </motion.h2>

        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {screenshots.map((s, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex-shrink-0 snap-center"
            >
              {/* Phone frame */}
              <div className="relative rounded-[2rem] border-4 border-slate-700 bg-slate-800 p-2 shadow-2xl">
                {/* Screen */}
                <div className="flex h-[360px] w-[200px] flex-col rounded-[1.5rem] bg-gradient-to-b from-slate-900 to-slate-950 sm:h-[420px] sm:w-[240px]">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-4 pt-3">
                    <span className="text-[10px] font-medium text-slate-400">9:41</span>
                    <div className="flex gap-1">
                      <div className="h-2 w-3 rounded-sm bg-slate-500" />
                      <div className="h-2 w-3 rounded-sm bg-slate-500" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col items-center justify-center px-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}>
                      {s.icon}
                    </div>
                    <p className="mt-4 text-center text-sm font-bold text-white">{s.title}</p>
                    <p className="mt-1 text-center text-[11px] text-slate-400">{s.description}</p>

                    {/* Stats pills */}
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {s.stats.map((stat, j) => (
                        <span key={j} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-medium text-slate-300">
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom nav */}
                  <div className="flex items-center justify-around border-t border-white/[0.06] px-4 py-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-4 w-4 rounded bg-amber-500/30" />
                      <span className="text-[8px] text-amber-400">Inicio</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-4 w-4 rounded bg-white/10" />
                      <span className="text-[8px] text-slate-500">Mapa</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-4 w-4 rounded bg-white/10" />
                      <span className="text-[8px] text-slate-500">Racao</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-4 w-4 rounded bg-white/10" />
                      <span className="text-[8px] text-slate-500">Mais</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Label below phone */}
              <p className="mt-4 text-center text-sm font-bold text-white">{s.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
