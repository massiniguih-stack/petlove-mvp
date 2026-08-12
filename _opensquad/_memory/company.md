# Company Context — Patinha

## Overview

- **Name:** Patinha
- **Website:** https://patinha-mvp.vercel.app/
- **Tagline:** Cuidados premium para o seu pet
- **Sector:** Pet tech (app de cuidado do pet + mapa de serviços locais)
- **Stage:** MVP em produção (deploy na Vercel)
- **Language:** Português (Brasil)

## Description

Patinha é um app para tutores acompanharem a vida do pet no dia a dia — saúde, peso, ração, vacinas, atividades e serviços perto de casa. Também conecta parceiros pet (clínicas, pet shops, hotéis, creches e serviços locais) a esses tutores, com opção de destaque pago no mapa.

## Products & Services

### Para tutores (B2C)
- Acompanhamento de saúde e peso
- Sugestões de ração por raça e objetivo
- Linha do tempo (vacinas, marcos, conquistas)
- Atividades e dicas de exercício
- Mapa de serviços próximos (vet, parque, hotel, etc.)
- Dashboard do pet
- Plano **Patinha Premium**: **R$ 29,49/mês** ou **R$ 238,80/ano** (equiv. R$ 19,90/mês). Pets ilimitados, histórico completo, comparação entre pets. Alertas de vacina também existem no free. **Ops:** produtos na LastLink devem cobrar exatamente esses valores.

### Para parceiros pet (B2B)
- Cadastro de clínicas, pet shops, hotéis e serviços
- Destaque no mapa / selo de credibilidade
- Planos premium de visibilidade para parceiros

### Interno
- Painel admin (staff) para gestão de parceiros, convites e operação

## Target Audience

### Primary
Tutores de cães e gatos no Brasil que querem organizar o cuidado do pet (peso, vacina, alimentação, atividades) em um só lugar.

### Secondary
Negócios pet locais (clínicas veterinárias, pet shops, hotéis, creches, passeadores e afins) que querem aparecer no mapa para tutores ativos.

## Tone of Voice

- Amigável, próximo e acolhedor — fala com o tutor, não “para o mercado”
- Claro e direto; CTAs simples (“Começar grátis”, “Cadastrar meu pet”)
- Visual quente (âmbar/laranja/rose), premium sem ser frio ou corporativo
- Evitar jargão técnico e tom hospitalar distante
- Pode usar emojis pet com moderação em canais informais

## Brand Notes

- Nome do produto: **Patinha**
- Meta title: “Patinha - Cuidados para seu pet”
- Meta description: serviços e cuidados para o animal de estimação (passeios, banho, veterinário, hotel e mais)
- Footer do site: “Patinha MVP - Projeto em construção”

## Social / Presence

- **Web app:** https://patinha-mvp.vercel.app/
- **Instagram / LinkedIn / TikTok:** não cadastrados ainda no perfil Opensquad
- **Instagram oficial:** ticket Linear [MAS-20](https://linear.app/massini/issue/MAS-20)

## Go-live / operação (Linear PetLove)

- **Tutor + geral:** [MAS-5](https://linear.app/massini/issue/MAS-5) (In Progress)
- **Parceiro B2B:** [MAS-35](https://linear.app/massini/issue/MAS-35) (In Progress)
- **Admin staff:** [MAS-43](https://linear.app/massini/issue/MAS-43) + seção Admin em `docs/go-live-beta-checklist.md`
- **Checklist no repo:** `docs/go-live-beta-checklist.md` (tutor + parceiro + admin)
- **Ícones / licença:** `docs/auditoria-icones-3d.md`
- **Rotas internas:** `/conferir`, `/preview-icones` — só OPEN_ACCESS local ou `ADMIN_EMAILS`

## Tech context (for squads working on the product)

- Next.js 14 (App Router) + Supabase
- Pagamentos via LastLink (webhook)
- Email via Resend
- Push via Firebase Cloud Messaging
- Rotas tutor na raiz; admin em `/admin/**`; APIs em `/api/**`

## Notes for agents

- Sempre escrever em português do Brasil, salvo pedido explícito em outro idioma
- Distinguir mensagens para **tutor** vs **parceiro pet** vs **staff admin**
- Ao otimizar páginas de venda, lembrar dos dois funis: assinatura Premium do tutor e premium de parceiros no mapa
- Preferir linguagem de benefício (“nunca mais esquecer a vacina”) em vez de feature dump
