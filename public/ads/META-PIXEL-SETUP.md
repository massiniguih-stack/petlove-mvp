# Meta Pixel + Business — passo a passo (Patinha)

O código do pixel **já está no app** (`components/MetaPixel.tsx`).  
Só ativa se existir a variável de ambiente.

---

## 1) Conta Meta Business

1. Acesse [business.facebook.com](https://business.facebook.com)  
2. Crie/use a conta da **Patinha**  
3. Conecte a **Página do Facebook** e o **Instagram** (Business)  
4. Vá em **Configurações do negócio → Contas de anúncios** e crie uma conta de anúncios  

---

## 2) Criar o Pixel

1. **Gerenciador de Eventos** → **Conectar dados** → **Web** → **Pixel da Meta**  
2. Nome: `Patinha Web`  
3. Copie o **ID do pixel** (só números, ex.: `123456789012345`)  

---

## 3) Colocar no Vercel (produção)

1. [vercel.com](https://vercel.com) → projeto **patinha-mvp**  
2. **Settings → Environment Variables**  
3. Adicione:

| Nome | Valor | Ambientes |
|------|--------|-----------|
| `NEXT_PUBLIC_META_PIXEL_ID` | `seu_id_numerico` | Production (+ Preview se quiser) |

4. **Redeploy** (Deployments → ⋮ → Redeploy)  
   Sem redeploy a variável não entra no build.  

5. Local (opcional): no `.env.local`

```bash
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

---

## 4) Eventos que o app já dispara

| Evento Meta | Quando |
|-------------|--------|
| `PageView` | Toda página (automático) |
| `CompleteRegistration` | Tutor se cadastra (`/cadastro`) |
| `Lead` | Parceiro envia cadastro (`/parceiros/cadastro`) |
| `InitiateCheckout` | Clica assinar plano em `/parceiros/premium` |

No Gerenciador de Eventos → **Testar eventos** (com a extensão Meta Pixel Helper) para validar.

---

## 5) Criar a campanha (resumo)

### Campanha Tutor
- Objetivo: **Tráfego** ou **Conversões** (CompleteRegistration)  
- Público: interesses pet / Brasil ou cidade piloto  
- Criativos: `tutor-01`, `tutor-02`, `tutor-03` + story  
- URL: `https://patinha-mvp.vercel.app/cadastro`  
- Orçamento teste: R$ 20–40/dia, 7 dias  

### Campanha Parceiro
- Objetivo: **Tráfego** ou **Conversões** (Lead)  
- Público: pet shop, vet, hotel pet  
- Criativos: `parceiro-01`, `parceiro-02`, `parceiro-03` + story  
- URL: `https://patinha-mvp.vercel.app/parceiros/premium`  
- Orçamento teste: R$ 20–40/dia, 7 dias  

**Não misture** tutor e parceiro na mesma campanha.

---

## 6) Checklist final

- [ ] Pixel ID no Vercel + redeploy  
- [ ] Pixel Helper mostra PageView no site  
- [ ] Teste cadastro tutor → CompleteRegistration  
- [ ] Teste cadastro parceiro → Lead  
- [ ] Upload dos 6 feeds + 2 stories no Gerenciador de Anúncios  
- [ ] Copy de `COPY.md` colada nos anúncios  
- [ ] WhatsApp admin com mensagem atualizada (sem 50% OFF falso)  

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Pixel não carrega | Falta `NEXT_PUBLIC_` no nome da var ou sem redeploy |
| Evento não aparece | Teste em aba anônima; desative bloqueador |
| Conversão não otimiza | Precisa de volume; comece com Tráfego 7 dias |
