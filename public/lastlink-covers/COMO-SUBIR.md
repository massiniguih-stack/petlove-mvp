# Como subir as capas na LastLink

Arquivos em esta pasta: **1200×1200**, fundo preto, só ícone Soft 3D, sem sombra extra.

## Checklist por produto

| Arquivo | Produto na LastLink | Plano no app |
|---------|---------------------|--------------|
| `01-parceiro-gratis.jpg` | (opcional) material grátis / landing | Cadastro grátis |
| `02-parceiro-basico.jpg` | Parceiro Básico | `partner_basic` · R$ 39,80 |
| `03-parceiro-profissional.jpg` | Parceiro Profissional | `partner_pro` · R$ 69,80 |
| `04-parceiro-empresarial.jpg` | Parceiro Empresarial | `partner_enterprise` · R$ 129,80 |
| `05-tutor-mensal.jpg` | Tutor Premium mensal | `tutor_monthly` |
| `06-tutor-anual.jpg` | Tutor Premium anual | `tutor_annual` |

Use `.jpg` (mais leve) ou `.png` (mais nítido).

## Passos na LastLink

1. Entre em [lastlink.com](https://lastlink.com) → seus produtos  
2. Abra o produto (ex.: Parceiro Básico)  
3. Editar → **capa / imagem do produto**  
4. Envie o arquivo da tabela  
5. Salve  
6. Confira se o **link de checkout** (slug) bate com o env no Vercel:
   - `LASTLINK_PARTNER_BASIC_SLUG`
   - `LASTLINK_PARTNER_PRO_SLUG`
   - `LASTLINK_PARTNER_ENTERPRISE_SLUG`
   - `LASTLINK_TUTOR_MONTHLY_SLUG`
   - `LASTLINK_TUTOR_ANNUAL_SLUG`

## Conferência rápida

Depois de salvar, abra:

`https://lastlink.com/p/{SEU_SLUG}`

A capa nova deve aparecer na página de compra.
