# Sales Page `/app` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dark-mode sales page at `/app` with 8 sections, bold animations, and scroll-triggered effects to convert visitors into users.

**Architecture:** Client-side React page with CSS keyframe animations and IntersectionObserver for scroll triggers. No new dependencies needed — reuses existing Icons3D components and Tailwind CSS.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, CSS keyframes, IntersectionObserver API

## Global Constraints

- Dark mode palette: `#0a0a0f` background, `rgba(255,255,255,0.05)` cards, `rgba(255,255,255,0.1)` borders
- CTA gradient: `from-amber-500 to-orange-500`
- All animations at 60fps, mobile-first responsive
- Reuse existing `Icons3D` components from `components/Icons3D.tsx`
- Font sizes: titles `font-black`, body `text-slate-400`

---

### Task 1: Create base page and animations CSS

**Files:**
- Create: `app/app/page.tsx`
- Create: `app/app/globals.css` (animation keyframes)
- Modify: `next.config.js` (add `app` to any relevant config if needed)

**Interfaces:**
- Consumes: None
- Produces: Page shell with all 8 sections as placeholders, animation utility classes

- [ ] **Step 1: Create the page file with section placeholders**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Sections will be added in subsequent tasks */}
      <div className="py-20 text-center text-slate-500">Pagina em construcao...</div>
    </div>
  );
}
```

- [ ] **Step 2: Run build to verify no errors**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/app/page.tsx
git commit -m "feat: scaffold sales page at /app"
```

---

### Task 2: Navbar component

**Files:**
- Create: `components/sales/Navbar.tsx`
- Modify: `app/app/page.tsx` (import Navbar)

**Interfaces:**
- Consumes: None
- Produces: `<Navbar />` component with logo, links, CTA buttons

- [ ] **Step 1: Create Navbar component**

```tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Pet</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Love</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#funcionalidades" className="text-sm text-slate-400 hover:text-white transition">Funcionalidades</a>
          <a href="#planos" className="text-sm text-slate-400 hover:text-white transition">Planos</a>
          <a href="#faq" className="text-sm text-slate-400 hover:text-white transition">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition"
          >
            Comecar
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add Navbar to page**

Edit `app/app/page.tsx` to import and render Navbar:

```tsx
import Navbar from '@/components/sales/Navbar';

// Inside the return:
<Navbar />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/sales/Navbar.tsx app/app/page.tsx
git commit -m "feat: add sales page navbar with scroll effect"
```

---

### Task 3: Hero section

**Files:**
- Create: `components/sales/Hero.tsx`
- Modify: `app/app/page.tsx` (import Hero)
- Create: `styles/sales-animations.css` (keyframes)

**Interfaces:**
- Consumes: None
- Produces: `<Hero />` with title, subtitle, CTAs, floating mockup

- [ ] **Step 1: Create animation keyframes file**

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-ring {
  animation: pulse-ring 2s infinite;
}
```

- [ ] **Step 2: Import animations in layout or page**

Add to `app/app/page.tsx` or `app/layout.tsx`:
```tsx
import '@/styles/sales-animations.css';
```

- [ ] **Step 3: Create Hero component**

```tsx
'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          Seu pet merece{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            o melhor.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-slate-400">
          Saude, nutricao, atividades e servicos — tudo em um so lugar.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/cadastro"
            className="animate-pulse-ring rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-amber-500/25 transition hover:scale-105"
          >
            Comecar agora
          </Link>
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition">
            Ja tem conta? Entrar
          </Link>
        </div>
      </div>

      {/* Floating mockup */}
      <div className="relative z-10 mt-16 animate-float">
        <div className="rounded-[2.5rem] border-4 border-slate-700 bg-slate-800 p-2 shadow-2xl shadow-amber-500/10">
          <div className="flex h-[400px] w-[220px] items-center justify-center rounded-[2rem] bg-gradient-to-b from-slate-700 to-slate-800">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white">PetLove</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add Hero to page**

```tsx
import Hero from '@/components/sales/Hero';

// Inside return:
<Navbar />
<Hero />
```

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add components/sales/Hero.tsx styles/sales-animations.css app/app/page.tsx
git commit -m "feat: add hero section with floating mockup and animations"
```

---

### Task 4: Features section (Grid Bento)

**Files:**
- Create: `components/sales/Features.tsx`
- Modify: `app/app/page.tsx` (import Features)

**Interfaces:**
- Consumes: `useScrollReveal` hook (from page)
- Produces: `<Features />` with 6 cards in grid

- [ ] **Step 1: Create Features component**

```tsx
'use client';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582" />
      </svg>
    ),
    title: 'Dashboard',
    description: 'Acompanhe peso, vacinas e saude do seu pet',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    title: 'Linha do Tempo',
    description: 'Marcos, conquistas e fotos',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: 'Atividades',
    description: 'Exercicios e dicas personalizadas',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M20.66 7A10 10 0 0 0 14 2.05" />
      </svg>
    ),
    title: 'Racao',
    description: 'Marcas, porcoes e nutricao ideal',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Mapa',
    description: 'Veterinarios, parques e pet shops',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Multi-pets',
    description: 'Gerencie todos os seus pets',
  },
];

export default function Features() {
  return (
    <section id="funcionalidades" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-black md:text-4xl">Tudo que voce precisa</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-[1.02]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-amber-400 transition group-hover:bg-amber-500/20">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Features to page**

```tsx
import Features from '@/components/sales/Features';

// After Hero:
<Features />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/sales/Features.tsx app/app/page.tsx
git commit -m "feat: add features grid bento section"
```

---

### Task 5: Demo section (Carousel)

**Files:**
- Create: `components/sales/Demo.tsx`
- Modify: `app/app/page.tsx` (import Demo)

**Interfaces:**
- Consumes: None
- Produces: `<Demo />` with horizontal scroll carousel

- [ ] **Step 1: Create Demo component**

```tsx
'use client';

const screenshots = [
  { title: 'Dashboard', color: 'from-amber-500 to-orange-500' },
  { title: 'Mapa de Servicos', color: 'from-rose-500 to-pink-500' },
  { title: 'Racao', color: 'from-emerald-500 to-teal-500' },
  { title: 'Linha do Tempo', color: 'from-purple-500 to-pink-500' },
  { title: 'Atividades', color: 'from-blue-500 to-cyan-500' },
];

export default function Demo() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-black md:text-4xl">Veja como funciona</h2>
        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {screenshots.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-center"
              style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
            >
              <div className="rounded-[2rem] border-4 border-slate-700 bg-slate-800 p-2 shadow-2xl">
                <div className={`flex h-[350px] w-[200px] items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${s.color}`}>
                  <div className="text-center">
                    <p className="text-lg font-black text-white">{s.title}</p>
                    <p className="mt-1 text-xs text-white/70">PetLove</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Demo to page**

```tsx
import Demo from '@/components/sales/Demo';

// After Features:
<Demo />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/sales/Demo.tsx app/app/page.tsx
git commit -m "feat: add demo carousel section"
```

---

### Task 6: Stats section (Animated counters)

**Files:**
- Create: `components/sales/Stats.tsx`
- Modify: `app/app/page.tsx` (import Stats)

**Interfaces:**
- Consumes: None
- Produces: `<Stats />` with scroll-triggered counters

- [ ] **Step 1: Create Stats component**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

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

          function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          }

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
  return (
    <section className="relative px-6 py-24">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 md:text-5xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Stats to page**

```tsx
import Stats from '@/components/sales/Stats';

// After Demo:
<Stats />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/sales/Stats.tsx app/app/page.tsx
git commit -m "feat: add animated stats counters section"
```

---

### Task 7: Pricing section (Free vs Premium)

**Files:**
- Create: `components/sales/Pricing.tsx`
- Modify: `app/app/page.tsx` (import Pricing)

**Interfaces:**
- Consumes: None
- Produces: `<Pricing />` with two comparison cards

- [ ] **Step 1: Create Pricing component**

```tsx
'use client';

import Link from 'next/link';

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

export default function Pricing() {
  return (
    <section id="planos" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-black md:text-4xl">
          Comece gratis,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            evolua quando quiser
          </span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-xl font-bold text-white">Gratuito</h3>
            <p className="mt-1 text-sm text-slate-400">Para comecar</p>
            <ul className="mt-6 space-y-3">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/cadastro"
              className="mt-8 block w-full rounded-full border border-white/20 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
            >
              Criar conta gratis
            </Link>
          </div>

          {/* Premium */}
          <div className="relative rounded-3xl border-2 border-amber-500 bg-white/5 p-8">
            <div className="absolute -right-3 -top-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
              POPULAR
            </div>
            <h3 className="text-xl font-bold text-white">Premium</h3>
            <p className="mt-1 text-sm text-slate-400">R$ 19,90/mes</p>
            <ul className="mt-6 space-y-3">
              {premiumFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/cadastro"
              className="mt-8 block w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/40"
            >
              Assinar Premium
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Pricing to page**

```tsx
import Pricing from '@/components/sales/Pricing';

// After Stats:
<Pricing />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/sales/Pricing.tsx app/app/page.tsx
git commit -m "feat: add free vs premium pricing section"
```

---

### Task 8: Testimonials section

**Files:**
- Create: `components/sales/Testimonials.tsx`
- Modify: `app/app/page.tsx` (import Testimonials)

**Interfaces:**
- Consumes: None
- Produces: `<Testimonials />` with 3 review cards

- [ ] **Step 1: Create Testimonials component**

```tsx
'use client';

const testimonials = [
  {
    name: 'Ana Carolina',
    text: 'O PetLove mudou como eu cuido do meu Golden. O controle de peso e vacinas e incrivel!',
    stars: 5,
    initials: 'AC',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Marcos Silva',
    text: 'Encontrei um veterinario otimo pelo mapa. Super pratique e o app e muito facil de usar.',
    stars: 5,
    initials: 'MS',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Juliana Costa',
    text: 'Tenho 3 cachorros e o plano premium vale cada centavo. Recomendo demais!',
    stars: 5,
    initials: 'JC',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-black md:text-4xl">Quem usa, recomenda</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Testimonials to page**

```tsx
import Testimonials from '@/components/sales/Testimonials';

// After Pricing:
<Testimonials />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/sales/Testimonials.tsx app/app/page.tsx
git commit -m "feat: add testimonials section"
```

---

### Task 9: FAQ section

**Files:**
- Create: `components/sales/FAQ.tsx`
- Modify: `app/app/page.tsx` (import FAQ)

**Interfaces:**
- Consumes: None
- Produces: `<FAQ />` with accordion items

- [ ] **Step 1: Create FAQ component**

```tsx
'use client';

import { useState } from 'react';

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
    a: 'Estamos desenvolvendo! Por enquanto, acesse pelo navegador do celular — o app e 100% responsivo.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-black md:text-4xl">Perguntas frequentes</h2>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="font-bold text-white">{f.q}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? 'max-h-40 pb-5' : 'max-h-0'
                }`}
              >
                <p className="px-5 text-sm text-slate-400">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add FAQ to page**

```tsx
import FAQ from '@/components/sales/FAQ';

// After Testimonials:
<FAQ />
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/sales/FAQ.tsx app/app/page.tsx
git commit -m "feat: add FAQ accordion section"
```

---

### Task 10: CTA Final and Footer

**Files:**
- Create: `components/sales/CTAFinal.tsx`
- Create: `components/sales/Footer.tsx`
- Modify: `app/app/page.tsx` (import CTAFinal, Footer)

**Interfaces:**
- Consumes: None
- Produces: `<CTAFinal />` and `<Footer />`

- [ ] **Step 1: Create CTAFinal component**

```tsx
'use client';

import Link from 'next/link';

export default function CTAFinal() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 px-8 py-16 text-center">
        <h2 className="text-3xl font-black text-white md:text-5xl">
          Pronto para cuidar do seu pet?
        </h2>
        <Link
          href="/cadastro"
          className="mt-8 inline-block animate-pulse-ring rounded-full bg-white px-10 py-4 text-lg font-bold text-amber-600 shadow-xl transition hover:scale-105"
        >
          Criar conta gratis
        </Link>
        <p className="mt-4 text-sm text-white/80">Sem cartao de credito. Cancele quando quiser.</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Footer component**

```tsx
import Link from 'next/link';

const links = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacidade', href: '/politica-de-privacidade' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <span className="text-xl font-black">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Pet</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Love</span>
            </span>
            <p className="mt-1 text-sm text-slate-500">Cuidados premium para seu melhor amigo.</p>
          </div>
          <div className="flex gap-6">
            {links.map((l, i) => (
              <Link key={i} href={l.href} className="text-sm text-slate-500 hover:text-white transition">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-600">
          &copy; 2026 PetLove. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Add CTAFinal and Footer to page**

```tsx
import CTAFinal from '@/components/sales/CTAFinal';
import Footer from '@/components/sales/Footer';

// After FAQ:
<CTAFinal />
<Footer />
```

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/sales/CTAFinal.tsx components/sales/Footer.tsx app/app/page.tsx
git commit -m "feat: add CTA final and footer sections"
```

---

### Task 11: Scroll reveal integration and final polish

**Files:**
- Modify: `app/app/page.tsx` (add scroll reveal to all sections)
- Modify: `styles/sales-animations.css` (ensure all keyframes are present)

**Interfaces:**
- Consumes: All components from previous tasks
- Produces: Fully animated page with scroll reveals

- [ ] **Step 1: Wrap sections with scroll-reveal divs**

Update `app/app/page.tsx` to wrap each section:

```tsx
<section className="scroll-reveal">
  <Features />
</section>
```

Apply to: Features, Demo, Stats, Pricing, Testimonials, FAQ, CTAFinal

- [ ] **Step 2: Verify animations in browser**

Run: `npm run dev`
Open: `http://localhost:3000/app`
Check: Scroll through page, verify all sections animate in

- [ ] **Step 3: Run Lighthouse audit**

Run: `npx lighthouse http://localhost:3000/app --view`
Expected: Performance > 90, Accessibility > 90

- [ ] **Step 4: Commit**

```bash
git add app/app/page.tsx styles/sales-animations.css
git commit -m "feat: integrate scroll reveal animations across all sections"
```

---

### Task 12: Deploy to production

**Files:**
- None (deployment only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Live page at https://petlove-mvp.vercel.app/app

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds, 0 errors

- [ ] **Step 2: Deploy**

Run: `vercel --prod --yes`
Expected: Deployment succeeds

- [ ] **Step 3: Verify in production**

Open: `https://petlove-mvp.vercel.app/app`
Check: All sections render, animations work, links function

- [ ] **Step 4: Update docs/links.md**

Add to `docs/links.md`:
```markdown
- Pagina de vendas: https://petlove-mvp.vercel.app/app
```

- [ ] **Step 5: Commit**

```bash
git add docs/links.md
git commit -m "docs: add sales page link to docs"
```
