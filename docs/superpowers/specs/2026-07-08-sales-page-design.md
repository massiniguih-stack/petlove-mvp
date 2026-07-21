# Design Spec: Pagina de Vendas `/app`

## Visao Geral

Pagina de vendas separada da landing page existente, focada em converter visitantes em usuarios do app. Estilo dark mode, bold, com animacoes impactantes.

- **Rota**: `/app`
- **Estilo**: Dark mode, moderno, ousado
- **Publico**: Novos usuarios (B2C)
- **Objetivo**: Convencer o visitante a criar conta gratuita

---

## Paleta de Cores

| Elemento | Cor |
|----------|-----|
| Fundo principal | `#0a0a0f` |
| Fundo cards | `rgba(255,255,255,0.05)` com `backdrop-blur` |
| Borda cards | `rgba(255,255,255,0.1)` |
| Texto principal | `#ffffff` |
| Texto secundario | `#94a3b8` (slate-400) |
| CTA principal | Gradiente `from-amber-500 to-orange-500` |
| CTA glow | `shadow-amber-500/50` |
| Accent purple | `from-purple-500 to-pink-500` |
| Accent rose | `from-rose-500 to-pink-500` |

---

## Secoes

### 1. Hero

**Layout**: Full-screen, conteudo centralizado

**Conteudo**:
- Titulo: "Seu pet merece o melhor." (font-black, 5xl md:7xl, branco)
- Subtitulo: "Saude, nutricao, atividades e servicos — tudo em um so lugar." (slate-400, max-w-lg)
- CTA principal: "Comecar agora" (botao gradiente amber→orange, rounded-full, py-4 px-8, glow ring, pulsacao sutil com keyframe)
- CTA secundario: "Ja tem conta? Entrar" (link slate-500, hover slate-300)
- Mockup: iPhone frame flutuando com screenshot do dashboard, sombra neon amber, animacao float (translateY oscillation 3s infinite)

**Animacoes**:
- Titulo: fade-in + slide-up (0.6s ease-out)
- Mockup: float animation (translateY -10px to 10px)
- CTA: pulse ring animation

---

### 2. Funcionalidades (Grid Bento)

**Layout**: Grid 3 colunas (md:grid-cols-3), gap-4

**Titulo**: "Tudo que voce precisa" (branco, font-black, 3xl)

**Cards** (6 items):
1. **Dashboard** — icone PawIcon3D — "Acompanhe peso, vacinas e saude do seu pet"
2. **Linha do Tempo** — icone CalendarIcon3D — "Marcos, conquistas e fotos"
3. **Atividades** — icone ActivityIcon3D — "Exercicios e dicas personalizadas"
4. **Racao** — icone BowlIcon3D — "Marcas, porcoes e nutricao ideal"
5. **Mapa** — icone PinIcon3D — "Veterinarios, parques e pet shops"
6. **Multi-pets** — icone PawIcon3D — "Gerencie todos os seus pets"

**Estilo do card**:
- `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6`
- Hover: `border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.02]`
- Transicao: `transition-all duration-300`

---

### 3. Demonstracao Visual

**Layout**: Carousel horizontal com scroll snap

**Titulo**: "Veja como funciona" (branco, font-black, 3xl)

**Conteudo**:
- 4-5 screenshots do app em frames de celular
- Fundo: gradiente sutil `from-purple-500/10 to-pink-500/10`
- Cada screenshot: frame iPhone com sombra, leve rotacao (-2deg a 2deg)
- Scroll snap no mobile, dots de navegacao no desktop

**Screenshots**:
1. Dashboard (peso + vacinas)
2. Mapa de servicos
3. Racao / nutricao
4. Linha do tempo
5. Atividades

---

### 4. Numeros (Contadores Animados)

**Layout**: 4 colunas (md:grid-cols-4), centralizado

**Fundo**: `#0a0a0f` com grid de pontos sutil (opacity 0.05)

**Metricas**:
1. "1.000+" — "Usuarios ativos"
2. "500+" — "Pets cadastrados"
3. "86" — "Cidades atendidas"
4. "110+" — "Racas disponiveis"

**Estilo**:
- Numeros: gradiente `from-amber-500 to-orange-500`, font-black, 4xl
- Labels: slate-400, text-sm, font-medium
- Animacao: contadores de 0 ao valor final, scroll-triggered (IntersectionObserver)

---

### 5. Free vs Premium

**Layout**: 2 colunas (md:grid-cols-2), gap-6

**Titulo**: "Comece gratis, evolua quando quiser" (branco, font-black, 3xl)

**Card Gratis**:
- `bg-white/5 border border-white/10 rounded-3xl p-8`
- Titulo: "Gratuito" (branco, font-bold,-xl)
- Lista com checks cinza (slate-400)
- Funcionalidades: 1 pet, peso basico, linha do tempo, mapa

**Card Premium**:
- `bg-white/5 border-2 border-amber-500 rounded-3xl p-8 relative`
- Badge "POPULAR" (absolute, top -3, right -3, gradiente amber→orange, py-1 px-3, rounded-full, text-xs font-bold)
- Titulo: "Premium" (branco, font-bold, xl)
- Lista com checks dourados (amber-400)
- Funcionalidades: multi-pets, graficos, plano alimentar, exercicios, alertas, relatorios, suporte
- CTA: botao gradiente amber→orange

---

### 6. Depoimentos

**Layout**: 3 colunas (md:grid-cols-3), gap-6

**Fundo**: gradiente sutil `from-pink-500/10 to-rose-500/10`

**Titulo**: "Quem usa, recomenda" (branco, font-black, 3xl)

**Cards** (3-4 items):
- Avatar (circulo, 48px, gradiente)
- Nome (branco, font-bold)
- Texto (slate-300, text-sm, italic)
- Estrelas (5x icone estrela dourada)

**Mobile**: scroll horizontal com snap

---

### 7. FAQ

**Layout**: Coluna unica, max-w-3xl centralizado

**Titulo**: "Perguntas frequentes" (branco, font-black, 3xl)

**Perguntas** (6 items):
1. "O Patinha e gratuito?" — "Sim! Voce pode usar as funcionalidades basicas gratuitamente."
2. "Como funciona o plano Premium?" — "Por R$19,90/mes, voce desbloqueia todas as funcionalidades."
3. "Posso cadastrar quantos pets?" — "Gratis: 1 pet. Premium: ilimitado."
4. "Meus dados estao seguros?" — "Sim! Seguimos a LGPD e usamos criptografia."
5. "Como cancelo a assinatura?" — "A qualquer momento, sem burocracia."
6. "Tem app mobile?" — "Estamos desenvolvendo! Por enquanto, acesse pelo navegador."

**Estilo**:
- Cada item: `bg-white/5 border border-white/10 rounded-2xl`
- Accordion com animacao de expand/collapse
- Seta girando 180deg no toggle

---

### 8. CTA Final

**Layout**: Full-width, centralizado

**Fundo**: Gradiente bold `from-amber-500 via-orange-500 to-pink-500`

**Conteudo**:
- Titulo: "Pronto para cuidar do seu pet?" (branco, font-black, 4xl md:5xl)
- Botao: "Criar conta gratis" (branco, font-bold, bg-white, text-amber-600, rounded-full, py-4 px-10, hover:scale-105, pulsacao)
- Texto: "Sem cartao de credito. Cancele quando quiser." (white/80, text-sm)

---

## Elementos Globais

### Navbar
- Logo Patinha (esquerdo)
- Links: Funcionalidades, Planos, FAQ (centro, desktop only)
- Botoes: "Entrar" (fantasma) + "Comecar" (gradiente amber→orange)
- Fixo no topo, transparente → `bg-black/80 backdrop-blur` no scroll

### Footer
- Logo + descricao curta
- Links: Funcionalidades, Planos, FAQ, Privacidade, Termos
- Redes sociais (placeholder)
- Copyright: "2026 Patinha. Todos os direitos reservados."

### Animacoes
- **Scroll-reveal**: fade-up com translateY(20px) → 0, opacidade 0→1, 0.6s ease-out
- **Float**: mockup do hero com translateY oscillation
- **Glow**: CTA com box-shadow pulsation
- **Contadores**: number counting animation (requestAnimationFrame)

### Responsivo
- Mobile-first
- Grids: 1 coluna no mobile, 2-3 colunas no desktop
- Navbar: hamburger menu no mobile
- Carousel: scroll snap no mobile
- FAQ: mesmo layout (coluna unica)

---

## Tecnicas

- **Framework**: Next.js 14 (app router)
- **Estilo**: Tailwind CSS
- **Componentes**: Reutiliza Icons3D existentes
- **Animacoes**: CSS keyframes + IntersectionObserver (sem lib extra)
- **Imagens**: Screenshots mockadas em frames de celular (CSS puro ou SVG)
- **Estado**: Sem estado global necessario (pagina estatica)
- **Rota**: `app/app/page.tsx` (client component)

---

## Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `app/app/page.tsx` | Pagina principal |
| `components/sales/Hero.tsx` | Secao hero |
| `components/sales/Features.tsx` | Grid de funcionalidades |
| `components/sales/Demo.tsx` | Carousel de screenshots |
| `components/sales/Stats.tsx` | Contadores animados |
| `components/sales/Pricing.tsx` | Free vs Premium |
| `components/sales/Testimonials.tsx` | Depoimentos |
| `components/sales/FAQ.tsx` | Perguntas frequentes |
| `components/sales/CTAFinal.tsx` | CTA final |
| `components/sales/Navbar.tsx` | Navbar da pagina de vendas |
| `components/sales/Footer.tsx` | Footer da pagina de vendas |

---

## Sucesso

- Pagina carrega em < 3s
- Score Lighthouse > 90
- Taxa de click no CTA > 5%
- Responsivo em todos os breakpoints
- Animacoes suaves a 60fps
