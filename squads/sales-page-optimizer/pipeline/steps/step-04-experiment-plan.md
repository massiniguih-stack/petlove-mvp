---
execution: subagent
agent: valeria-validacao
inputFile: squads/sales-page-optimizer/output/messaging-proof-map.md
outputFile: squads/sales-page-optimizer/output/experiment-backlog.md
model_tier: powerful
---

## Context Loading
- Leia `squads/sales-page-optimizer/squad.yaml`.
- Leia `squads/sales-page-optimizer/squad-party.csv`.
- Leia `_opensquad/_memory/company.md` e `_opensquad/_memory/preferences.md`.
- Respeite as páginas listadas no `squad.yaml`.

## Instructions
- Trabalhe em português do Brasil.
- Não invente dados, métricas ou prova social.
- Cite caminhos de arquivo e seções quando fizer recomendações.
- Separe fatos vistos no código de hipóteses comerciais.

## Output Format
Use markdown com estes blocos:
1. Resumo executivo
2. Achados por página
3. Riscos e dependências
4. Recomendações priorizadas
5. Próximos passos

## Output Example
```md
### app/planos/PlanosClient.tsx
- Achado: CTA genérico perto do preço.
- Impacto: usuário entende menos o benefício premium.
- Recomendação: testar CTA orientado a benefício.
- Critério: manter `handleCheckout` e planType existentes.
```

## Veto Conditions
- Se precisar alterar preço ou planType, envie para checkpoint.
- Se a recomendação depender de feature inexistente, marque como dependência.
- Se o arquivo citado não existir, não conclua.

## Quality Criteria
- Saída curta, priorizada e implementável.
- Cada recomendação tem impacto, esforço e critério de aceite.
- Nada de promessas sem lastro no código ou negócio.

## Step-Specific Task
Transforme achados em backlog de experimentos e tarefas seguras de implementação.
