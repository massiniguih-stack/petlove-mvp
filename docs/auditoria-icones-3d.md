# Auditoria de ícones 3D — licença vs app comercial

**Data:** 2026-08-09 (posição de beta: 2026-08-22)  
**Contexto:** o set Soft 3D veio em grande parte do [Thiings](https://www.thiings.co). No plano **Free**, uso é **só pessoal/não comercial** + **atribuição visível**. Em **web app comercial** (Patinha), esses arquivos entram como **proibidos / a substituir** até haver licença **Indie** (~US$ 49) ou ícone **próprio**.

> Isto **não é parecer jurídico**. Confirme sempre em https://www.thiings.co/terms.

## Posição no beta (agosto 2026)

Durante o **teste público limitado** (web app em beta, sem cobrança ativa):

* Atribuição visível no rodapé: “Ícones 3D: Thiings — usados neste web app em fase de teste”, com link para https://www.thiings.co
* Texto “Patinha MVP — projeto em teste (beta)”
* **Não fecha MAS-9.** A licença Free **não autoriza uso comercial**. “Estamos testando” não substitui Indie quando o app passar a cobrar ou for loja aberta.

Fonte: https://www.thiings.co/terms — Free = personal and non-commercial use + attribution required; Indie = commercial use in apps/web.

---

## Legenda

| Status | Significado |
|--------|-------------|
| **PROIBIDO (Free)** | Arquivo Thiings (ou pack baixado como Thiings). Não usar no app pago sem licença paga ou troca. |
| **OK (próprio)** | Gerado/editado no projeto (IA da sessão / processado para Patinha). Preferível manter. |
| **Backup** | Não serve o app; só arquivo histórico. Pode apagar depois. |

---

## A) PROIBIDOS no web app (sem licença Thiings paga) — prioridade de troca

Arquivos em `public/icons/3d/` com origem **Thiings** (tamanho ~1,3–1,6 MB, pack original).

### A1 — Em uso no app (trocar primeiro)

| # | Arquivo | Uso no app (resumo) | Componente / path |
|---|---------|---------------------|-------------------|
| 1 | `calendario.png` | Linha do tempo, cards home/dashboard | ↩ restaurado Thiings 2026-08-09 |
| 2 | `racao.png` | Ração | ↩ restaurado Thiings 2026-08-09 |
| 3 | `servicos.png` | Serviços / mapa pin | ↩ restaurado Thiings 2026-08-09 |
| 4 | `perfil.png` | Editar perfil | ↩ restaurado Thiings 2026-08-09 |
| 5 | `saude.png` | Saúde / vet no mapa | `HealthIcon3D`, `tiposServico` |
| 6 | `premium.png` | Premium, destaque, planos | `PremiumIcon3D`, `StarIcon3D` |
| 7 | `dog.png` | Mascote, atividades | ↩ restaurado Thiings 2026-08-09 |
| 8 | `logo-dog.png` | Cópia do dog (mesmo asset) | ↩ restaurado Thiings 2026-08-09 |
| 9 | `chart.png` | Comparar / progresso | ↩ restaurado Thiings 2026-08-09 |
| 10 | `peso.png` | Peso / balança | `ScaleIcon3D` |
| 11 | `target.png` | Objetivo, obediência | `TargetIcon3D` |
| 12 | `search.png` | Busca | `SearchIcon3D` |
| 13 | `check.png` | Sucesso / check | `CheckIcon3D` |
| 14 | `file-text.png` | Documento | `FileTextIcon3D` |
| 15 | `bone.png` | Osso / agility | `BoneIcon3D` |
| 16 | `trophy.png` | Troféu / conquista | `TrophyIcon3D` |
| 17 | `shield.png` | Proteção / doença | `ShieldIcon3D` |
| 18 | `fire.png` | Energia | `FireIcon3D` |
| 19 | `medal.png` | Medalha | `MedalIcon3D` |
| 20 | `crown.png` | Coroa / marca ração | `CrownIcon3D` |
| 21 | `maleta.png` | Parceiro / negócio | `BriefcaseIcon3D` |
| 22 | `bolo.png` | Aniversário / nascimento | `CakeIcon3D` |
| 23 | `festa.png` | Celebração / evento | `PartyIcon3D` |
| 24 | `gato.png` | Gato | `CatIcon3D` |
| 25 | `vacina.png` | Vacina | `VaccineIcon3D` |
| 26 | `foto.png` | Foto / galeria | `CameraIcon3D` |
| 27 | `viagem.png` | Viagem | `TravelIcon3D` |
| 28 | `petshop.png` | Petshop | `PetshopIcon3D`, `tiposServico` |
| 29 | `creche.png` | Creche | `CrecheIcon3D`, `tiposServico` |
| 30 | `parque.png` | Parque | `ParqueIcon3D`, `tiposServico` |
| 31 | `hotel.png` | Hotel | `HotelIcon3D`, `tiposServico` |
| 32 | `petsitter.png` | Petsitter | `tiposServico` |
| 33 | `petdriver.png` | Petdriver | `tiposServico` |
| 34 | `paw-thiings.png` | Variante Thiings (não principal) | arquivo no disco |

**Total em uso / pack Thiings principal: ~34 arquivos**

### A2 — Dúvida / híbrido (tratar como “trocar” se for app comercial)

Estes foram baixados/ajustados no fluxo Thiings, mas o PNG atual pode ser recorte ou variante:

| Arquivo | Nota |
|---------|------|
| `atividades.png` | Tamanho menor que pack (~832 KB); se veio do Thiings e só foi processado, **ainda é Thiings** → trocar. |
| `natacao.png` | Gerado/ajustado para natação; se base for Thiings, trocar por original próprio. |
| `porte-ruler-alt.png` | Régua/trena estilo pack; **não usar no app comercial**. |

---

## B) OK no web app (próprios / gerados na sessão)

| Arquivo | Uso |
|---------|-----|
| `dashboard-paw.png` | Card Dashboard (home), foto vazia |
| `mascote-tile.png` | Tile mascote (mesmo desenho da patinha branca) |
| `patinha.png` / `paw.png` / `paw-solid.png` | Patinha com contorno (vários lugares) |
| `paw-samoyed.png` | Variante |
| `porte.png` | Porte (cão pequenino roxo) — atual no app |

**Não entram na lista de proibidos.**

---

## C) Backups / lixo de trabalho (não servem o app)

Podem ser apagados depois da substituição (não são “proibidos de uso no app” porque **não deveriam estar no bundle de produção** se não forem referenciados):

- `dashboard-paw-antes-fix.png`
- `porte-antes-corrige.png`, `porte-trena-backup.png`, `porte-dogs-alt.png`, `porte-ruler-alt.png`
- pasta `public/icons/3d/_backup_antes_thiings/`
- pasta `public/icons/3d/paw-variants/`
- pasta `public/icons/3d/thiings-replacements/`

---

## D) Checklist de substituição (futuro)

Para cada arquivo da seção **A1**:

1. [ ] Gerar PNG próprio (estilo Soft 3D, fundo transparente, 1024×1024)
2. [ ] Salvar com o **mesmo nome** em `public/icons/3d/` (drop-in, sem mudar código) **ou** novo nome + atualizar `Icons3D.tsx` / paths
3. [ ] Conferir em home, dashboard, vida, atividades, mapa, ração
4. [ ] Marcar linha como `OK` nesta auditoria
5. [ ] Apagar backup Thiings quando a troca estiver estável

### Ordem sugerida (impacto visual)

1. Hub home: `calendario`, `racao`, `servicos`, `perfil`, `chart` (+ `dog` se ainda aparecer)
2. Dashboard: `peso`, `target`
3. Mapa / serviços: `saude`, `petshop`, `creche`, `parque`, `hotel`, `petsitter`, `petdriver`
4. Vida: `vacina`, `foto`, `viagem`, `bolo`, `festa`, `trophy`, `shield`
5. Premium / marca: `premium`, `crown`
6. Restante: `search`, `check`, `file-text`, `bone`, `fire`, `medal`, `maleta`, `gato`, `paw-thiings`

---

## E) Alternativas sem gerar tudo

| Opção | Prós | Contras |
|-------|------|---------|
| Comprar **Thiings Indie** (~US$ 49 lifetime) | Resolve a lista A de uma vez | Custo + ainda “visual genérico Thiings” |
| Gerar só os ~15 mais visíveis | Mais barato em tempo | Resto ainda restrito se Free |
| Substituir 100% por gerados | Controle total, marca própria | Mais trabalho |

---

## F) Contagem rápida

| Categoria | Qtd (aprox.) |
|-----------|----------------|
| **Proibidos Free (Thiings) a trocar** | **~34** |
| OK próprios | **~6–8** em uso |
| Backups / variantes | dezenas (pastas) |

---

## G) Como marcar progresso

Quando substituir um arquivo, altere a linha na seção A1 para:

`| 1 | calendario.png | … | ✅ substituído em AAAA-MM-DD |`
