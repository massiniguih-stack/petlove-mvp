# Monitoramento pós-deploy — funil comercial

Como um termômetro no refrigerador: se a temperatura (conversão/erros) sair do normal, você age.

## O que olhar na 1ª semana após merge

| Sinal | Onde | Alarme se… |
|-------|------|------------|
| Checkout tutor | LastLink + Meta Pixel `InitiateCheckout` | Zero eventos com tráfego |
| Redirect login `/planos` | Meta `ViewContent` `tutor_auth_redirect_planos` | Muitos redirects + poucos logins |
| Paywall comparar | Meta `paywall_comparar_cta` | Cliques sem visitas a `/planos` |
| Cadastro parceiro | Meta `Lead` `parceiro_cadastro` | Queda abrupta vs semana anterior |
| Preço LastLink vs app | Links TUTOR mensal/anual | Valor na cobrança ≠ 29,49 / 238,80 |
| Webhook parceiro | Logs Vercel + e-mail match `partners` | Pagou e não ativou selo |

## Checklist diário rápido (2 min)

- [ ] Abrir https://patinha-mvp.vercel.app/planos → preço mensal **29,49**
- [ ] Toggle anual → **19,90**/mês eq e **238,80** no ano
- [ ] https://lastlink.com/p/C19A63EB1 e anual → valor igual ao app
- [ ] `/parceiros/premium` → sem 50% OFF / sem milhares
- [ ] Vercel Functions → erros 5xx no checkout/webhook

## Se algo quebrar

1. **Preço errado na LastLink** → corrigir produto; se precisar, reverter constantes no app.
2. **Checkout 500** → slugs vazios no Vercel env.
3. **Parceiro pagou e não ativou** → e-mail do pagamento ≠ `partners.email`.
