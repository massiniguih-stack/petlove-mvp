'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const stats = [
  { value: 1000, suffix: '+', label: 'Usuarios ativos' },
  { value: 500, suffix: '+', label: 'Pets cadastrados' },
  { value: 86, suffix: '', label: 'Cidades atendidas' },
  { value: 110, suffix: '+', label: 'Racas disponiveis' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

export default function Stats() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      {/* Isometric bones background */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute left-[10%] top-[15%] opacity-15" width="70" height="70" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="sb1t" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="sb1s" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#sb1t)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#sb1s)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#sb1t)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#sb1t)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#sb1s)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#sb1t)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#sb1s)"/>
        </svg>
        <svg className="absolute right-[8%] bottom-[20%] opacity-10" width="90" height="90" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="sb2t" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="sb2s" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#sb2t)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#sb2s)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#sb2t)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#sb2t)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#sb2s)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#sb2t)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#sb2s)"/>
        </svg>
        <svg className="absolute left-[25%] bottom-[10%] opacity-8" width="55" height="55" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="sb3t" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
            <linearGradient id="sb3s" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/>
            </linearGradient>
          </defs>
          <path d="M25,38 L50,28 L75,38 L50,48 Z" fill="url(#sb3t)"/>
          <path d="M25,38 L50,48 L50,58 L25,48 Z" fill="url(#sb3s)"/>
          <path d="M75,38 L50,48 L50,58 L75,48 Z" fill="url(#sb3t)"/>
          <ellipse cx="22" cy="40" rx="12" ry="8" fill="url(#sb3t)"/>
          <ellipse cx="22" cy="44" rx="12" ry="8" fill="url(#sb3s)"/>
          <ellipse cx="78" cy="40" rx="12" ry="8" fill="url(#sb3t)"/>
          <ellipse cx="78" cy="44" rx="12" ry="8" fill="url(#sb3s)"/>
        </svg>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-center"
            >
              <div className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 md:text-5xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
