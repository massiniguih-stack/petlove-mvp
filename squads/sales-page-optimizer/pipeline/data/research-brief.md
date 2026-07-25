# Research Brief — Sales Page Optimizer

## Produto
Patinha é um app para tutores acompanharem cuidados do pet e uma rede de parceiros locais no mapa.

## Páginas comerciais no escopo
- `app/page.tsx`: porta de entrada, estado deslogado/logado/sem pet, CTAs para tutor e parceiro.
- `app/cadastro/page.tsx`: cadastro tutor.
- `app/planos/page.tsx` e `app/planos/PlanosClient.tsx`: assinatura Premium tutor via LastLink.
- `app/comparar/page.tsx`: bloqueio Premium contextual para comparar pets.
- `app/parceiros/cadastro/page.tsx` e `app/parceiros/cadastro/CadastroClient.tsx`: cadastro B2B de parceiros.
- `app/parceiros/premium/page.tsx` e `app/parceiros/premium/PremiumClient.tsx`: plano premium parceiro via LastLink.

## Estado comercial atual observado
- Tutor Premium: R$ 19,90/mês ou R$ 115/ano.
- Parceiro Premium: plano único com destaque, selo, topo da busca e WhatsApp direto.
- Checkout usa `/api/lastlink/checkout`.
- A página de parceiro premium exige usuário autenticado antes de checkout.

## Objetivo do squad
Gerar diagnóstico, copy alternativa, prova/confiança e backlog de experimentos para aumentar conversão sem quebrar o MVP.
