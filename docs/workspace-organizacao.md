# Organização da bancada (workspace) — 2026-07-24

Como uma despensa: o que é **comida do restaurante** (app) fica no estoque; o que é **ferramenta da cozinha** (agentes/vídeo) fica na prateleira certa; o que é **lixo de preparação** (builds, node_modules locais) não entra no prato.

## Manter no repositório (intencional)

| Pasta / arquivo | Para quê |
|-----------------|----------|
| `app/`, `components/`, `lib/`, `public/` | Produto Patinha |
| `_opensquad/` (exceto profile/logs) | Sistema Opensquad |
| `squads/` | Squads e outputs |
| `.agents/skills/`, `skills/`, `skills-lock.json` | Skills de agentes (incl. HyperFrames) |
| `AGENTS.md`, `CLAUDE.md`, `README.md` | Instruções do projeto |
| `app/conferir/` | Página interna de QA de rotas |
| `public/icons/3d/` | Ícones Soft 3D do produto |

## Ignorado pelo git (não versionar)

| Item | Motivo |
|------|--------|
| `dashboard/node_modules/`, `dashboard/dist/` | Dependências/build do painel auxiliar (~centenas de MB) |
| `.playwright-mcp/` | Estado local de browser |
| `videos/**/output.mp4`, `frame-*.jpg` | Renders pesados; fonte do projeto de vídeo pode ficar |
| `agent/` | Scratch local de agente |
| `.env*.local`, `.next/`, `node_modules/` | Já eram ignorados |

## Decisão pendente (você escolhe no próximo commit)

| Item | Opção A (recomendada) | Opção B |
|------|------------------------|---------|
| `dashboard/` (fonte, sem node_modules) | Commitar se for UI oficial do Opensquad | Deixar de fora se for só experimento |
| `videos/patinha-test-5s/` (HTML/fonte) | Commitar se quiser reusar o teste | Ignorar pasta inteira se for lixo |
| `app-home.png`, `preview-icones-full.png` | Commitar se forem refs de design | Deletar ou `.gitignore` se forem rascunho |
| Skills HyperFrames massivas | Manter (habilitam vídeo) | Remover se não for usar vídeo ainda |

## Comandos úteis

```bash
# ver o que o git ainda enxerga de “novo”
git status -sb

# não commitar node_modules do dashboard (já no .gitignore)
# se já tiver sido trackeado por engano:
# git rm -r --cached dashboard/node_modules
```
