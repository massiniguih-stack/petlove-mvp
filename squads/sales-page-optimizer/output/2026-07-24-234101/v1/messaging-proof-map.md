# Mapa de Mensagem e Prova — re-run 2026-07-24

**Agente:** Paula Prova (🔍)  
**Passo:** step-03-message-proof  
**Run:** `2026-07-24-234101`

---

## 1. Resumo executivo

| Claim tipo | Status geral |
|------------|--------------|
| Número de usuários (“milhares”) | ✅ ausente |
| % OFF fictício parceiro | ✅ ausente |
| Preço tutor exibido | ✅ = constantes código (19,90 / 115) · ⚠️ validar LastLink real |
| Alertas vacina exclusivos PRO | ✅ removidos da tabela/metadata |
| Tiers parceiro (preço) | ✅ consistentes entre UI, convites admin, metadata |
| Features por tier parceiro | ⚠️ **zona amarela** — texto vs capacidade real |

---

## 2. Achados por página

### Tutor — claims seguros (lastreados)

| Mensagem | Onde | Prova no produto |
|----------|------|------------------|
| Grátis para começar · Premium opcional | home | Fluxo free sem cartão |
| Pets ilimitados / histórico / comparar | planos, comparar, chip hub | Gates Premium no app |
| Alertas vacina free | PlanosClient tabela | Cron não filtra Premium (EXP-02A) |
| Pagamento LastLink · cancele em Gerenciar assinatura | planos | Fluxo conta/assinatura + member URL |
| R$ 19,90 / R$ 115 | planos, comparar, dashboard | Constantes; **não** prova LastLink externa |

### Parceiro — claims seguros

| Mensagem | Onde | Prova |
|----------|------|-------|
| Listagem grátis após análise | free tier + copy sucesso | Cadastro + admin análise |
| Selo / WhatsApp / destaque | tiers pagos | Webhook partner_* |
| Preços 39,80 / 69,80 / 129,80 | premium, convites | Constantes + copy admin |
| E-mail “deve receber” + spam | sucesso cadastro | Copy defensiva (não garante Resend) |
| Análise 48h | sucesso | SLA operacional — ok se time cumpre |

### Zona amarela (validar ou suavizar)

| Mensagem | Arquivo | Risco | Ação sugerida |
|----------|---------|-------|---------------|
| “Prioridade comercial no mapa” (Pro) | PremiumClient | Vago / difícil provar ranking | “Maior prioridade na lista da cidade” se código ordena por plano |
| “Painel do parceiro (métricas)” (Pro) | PremiumClient | Existe `/parceiro/dashboard`? | Confirmar gate por plano |
| “Registro de serviços realizados” (Pro) | PremiumClient | Feature existe | Confirmar se free/basic também acessa |
| “Ideal para redes e filiais” (Enterprise) | PremiumClient | Multi-unidade pode não existir | Soften: “para operações maiores” (já parcialmente) |
| “Apareça em destaque **hoje**” upsell | CadastroClient sucesso | Depende webhook+email | Manter se fluxo funciona; senão “após pagamento confirmado” |
| Badge **-52%** anual tutor | PlanosClient | Honesto só com 19,90×12 vs 115 | Recalcular se mudar preço |

### Claims proibidos (recheck)

| Claim | Resultado 24/07 |
|-------|-----------------|
| 50% OFF | ❌ não encontrado em app/ |
| Milhares de tutores | ❌ não encontrado |
| Toggle anual cosmético parceiro | ❌ removido (só mensal tiers) |

---

## 3. Riscos e dependências

- **Prova de preço** = LastLink admin + slugs env (fora do git).  
- **Prova de ranking no mapa** = query de listagem de parceiros.  
- **Prova de gate de painel** = middleware/API do parceiro por `plan_type`.

---

## 4. Recomendações priorizadas

1. **EXP-19:** Auditoria feature×tier (Basic/Pro/Enterprise) vs código — só então manter bullets.  
2. **EXP-20:** Upsell pós-cadastro com “a partir de R$ 39,80” + link planos (sem overclaim “hoje” se webhook frágil).  
3. **EXP-18:** Preço tutor só com LastLink + recalcular -52%.  
4. Não reintroduzir prova social numérica sem fonte admin.

---

## 5. Próximos passos

Valeria: backlog com regressão checklist + novos EXPs; checkpoint só preço e claims de tier.
