# Carrossel de lançamento — Instagram @patinha.app

Os 6 quadros estão em `docs/instagram-carrossel-assets/` (1080×1350, já com
texto). Marina e Toró nos quadros 1, 2, 3 e 5; ícones da marca nos quadros 4 e 6.

## Conceito

**Arco narrativo:** dor (perder a conta das coisas do pet) → virada
(descobre o Patinha) → alívio/organização → funcionalidades → resultado
emocional → CTA.

**Estilo visual:** ilustração 3D "toy-like" (glossy, sombra suave, paleta
âmbar/laranja/rose) — o mesmo estilo dos ícones que o app já usa
(`public/icons/3d/`). Evita o problema de manter uma foto realista
consistente em 6 imagens diferentes, e já nasce alinhado à marca.

## Personagens (cole em todo prompt, para manter consistência)

```
A young woman named "Marina", mid-20s, wavy shoulder-length brown hair,
warm light-brown skin, wearing a mustard-yellow sweater, soft rounded 3D
toy-like illustration style (glossy material, soft studio shadows, warm
amber/orange/rose palette), with a cute medium-sized golden-brown
mixed-breed dog named "Toró". Consistent character design across all
images, Pixar-adjacent 3D render aesthetic, clean warm background, no
text, no watermark, square 1:1 composition.
```

Dica: se a ferramenta permitir (Midjourney `--cref`, ChatGPT com imagem de
referência), gere o Quadro 1 primeiro e use-o como referência visual para
os quadros 2, 3 e 5 — mantém a mesma "cara" da Marina e do Toró.

---

## Quadro 1 — Hook (a dor) ✅ gerado

Arquivo: `docs/instagram-carrossel-assets/quadro-1-hook.png`

**Texto na imagem:** "Você sabe quando foi a última vacina do seu pet?"

**Prompt:**
```
[personagens] Marina sitting cross-legged on a living room floor,
surrounded by scattered sticky notes and an open notebook, looking
confused and slightly overwhelmed while checking her phone, Toró lying
beside her looking up at her, warm cozy home background, soft afternoon
light.
```

## Quadro 2 — Aprofunda a dor ✅ gerado

Arquivo: `docs/instagram-carrossel-assets/quadro-2-dor.png`

**Texto na imagem:** "Foto no celular, post-it na geladeira, caderno
perdido... e depois não se acha nada."

**Prompt:**
```
[personagens] Close-up of Marina looking frustrated at her phone screen
full of disorganized photo thumbnails, a messy notebook and sticky notes
visible on a fridge in the background, Toró sitting patiently near her
feet, warm kitchen setting.
```

## Quadro 3 — Virada (descoberta do app) ✅ gerado

Arquivo: `docs/instagram-carrossel-assets/quadro-3-virada.png`

**Texto na imagem:** "Até que ela conheceu o Patinha."

**Prompt:**
```
[personagens] Marina's face lighting up with relief and a warm smile as
she looks at her smartphone screen showing a friendly glowing paw-shaped
app icon, Toró perking up its ears excitedly beside her, warm golden
light rays, cozy living room.
```

## Quadro 4 — Funcionalidades ✅ já construído

**Texto na imagem:** "Tudo isso, num só lugar" + lista com ícones:
🦴 Rotina · ❤️ Saúde e vacina · 📍 Serviços perto de você · 📅 Linha do tempo

Arquivo: `docs/instagram-carrossel-assets/quadro-4-funcionalidades.png`
(gerado com os ícones 3D já existentes no repo, fundo no gradiente da
marca — não precisa de gerador externo).

## Quadro 5 — Resultado emocional ✅ gerado

Arquivo: `docs/instagram-carrossel-assets/quadro-5-alivio.png`

**Texto na imagem:** "Agora ela nunca mais esquece nada — e aproveita mais
o Toró."

**Prompt:**
```
[personagens] Marina happily hugging and playing with Toró in a sunny
park, both looking joyful and relaxed, warm golden-hour lighting,
carefree and happy mood, phone nowhere in sight.
```

## Quadro 6 — CTA ✅ já construído

**Texto na imagem:** "Baixe grátis e organize a vida do seu pet." + ícone
do app + link

Arquivo: `docs/instagram-carrossel-assets/quadro-6-cta.png` (gerado
localmente com o ícone oficial do app sobre o gradiente da marca).

---

## Legenda do post (caption)

```
Ela também perdia a conta das coisas do pet — até conhecer o Patinha 🐾

Vacina, ração, aquele passeio que rendeu foto boa... tudo espalhado entre
o caderno, o post-it e a galeria de fotos. Com o Patinha, fica tudo num
só lugar: saúde, rotina, vacina e os melhores serviços pet perto de você.

Baixe grátis e comece a organizar a vida do seu melhor amigo 💛

#patinha #tutordepet #cuidadocompet #petshopbrasil #cachorro #gato
#vidadepet #appdepet
```

## Notas de produção

- Formato recomendado: 1080×1350 (4:5) para melhor espaço no feed, ou
  1080×1080 (1:1) se preferir simetria entre os 6 quadros.
- Pós-produção: adicionar o texto de cada quadro por cima da imagem
  gerada (Canva, Figma ou o editor de stories do próprio Instagram) —
  os prompts acima não pedem texto embutido de propósito, fica mais
  fácil ajustar depois.
- Antes de publicar, gerar os quadros 1, 2, 3 e 5 e revisar juntos aqui
  se a "cara" da Marina e do Toró ficou consistente entre eles.
