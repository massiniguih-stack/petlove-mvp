#!/usr/bin/env python3
"""
Busca, baixa e prepara um ícone 3D do pacote gratuito 3dicons.co
(licença CC0) pronto pra usar em public/icons/.

Uso:
    python3 scripts/fetch-icon.py <termo-de-busca> [nome-de-saida] [--style clay|color|gradient|premium]

Exemplos:
    python3 scripts/fetch-icon.py target
    python3 scripts/fetch-icon.py "map-pin" location
    python3 scripts/fetch-icon.py bone --style clay

O que o script faz sozinho (o que antes era feito manualmente):
  1. Procura o termo no catálogo local (scripts/3dicons-catalog.json,
     211 ícones — regenerar com --refresh-catalog se o pacote mudar).
  2. Baixa o render em 400px no estilo escolhido (padrão: "color",
     o que mais se aproxima do visual já usado no app).
  3. Remove o fundo branco (o CDN público não serve com transparência)
     usando uma rampa de alfa por brilho + descontaminação de cor nas
     bordas, pra não deixar auréola branca.
  4. Salva em public/icons/<nome>.png.

Precisa de Pillow (`pip install Pillow`, já instalado neste projeto).
"""
import json
import os
import sys
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_PATH = os.path.join(SCRIPT_DIR, '3dicons-catalog.json')
ICONS_DIR = os.path.join(SCRIPT_DIR, '..', 'public', 'icons')
CDN_BASE = 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes'
SITEMAP_URL = 'https://3dicons.co/sitemap.xml'

LOW = 220  # brilho mínimo (0-255) considerado "ainda é ícone, não fundo"


def refresh_catalog():
    print('Baixando catálogo atualizado de', SITEMAP_URL)
    xml = _fetch(SITEMAP_URL).decode()
    import re
    ids = re.findall(r'/icons/([a-f0-9]{6}-[a-z0-9-]+)', xml)
    catalog = []
    for entry in ids:
        code, _, slug = entry.partition('-')
        catalog.append({'id': code, 'slug': slug, 'full': entry})
    with open(CATALOG_PATH, 'w') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f'{len(catalog)} ícones salvos em {CATALOG_PATH}')
    return catalog


def load_catalog():
    if not os.path.exists(CATALOG_PATH):
        return refresh_catalog()
    with open(CATALOG_PATH) as f:
        return json.load(f)


def find_matches(catalog, term):
    term = term.lower()
    # Aceita o id completo (ex: "ef4a90-bell") pra desambiguar quando dois
    # ícones têm o mesmo nome.
    full = [c for c in catalog if c['full'] == term]
    if full:
        return full
    exact = [c for c in catalog if c['slug'] == term]
    if exact:
        return exact
    return [c for c in catalog if term in c['slug']]


def _fetch(url):
    # O CDN rejeita o User-Agent padrão do urllib com 400 Bad Request.
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req).read()


def download_icon(icon_id, style, size=400):
    url = f'{CDN_BASE}/{icon_id}/dynamic/{size}/{style}.webp'
    tmp_webp = '/tmp/_fetch_icon_tmp.webp'
    with open(tmp_webp, 'wb') as f:
        f.write(_fetch(url))
    return tmp_webp


def remove_white_bg(src_path, out_path):
    from PIL import Image
    im = Image.open(src_path).convert('RGBA')
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            brightness = min(r, g, b)
            if brightness <= LOW:
                continue
            fade = (brightness - LOW) / (255 - LOW)
            alpha_frac = 1 - fade
            if alpha_frac <= 0.02:
                px[x, y] = (r, g, b, 0)
                continue
            nr = min(255, max(0, int((r - (1 - alpha_frac) * 255) / alpha_frac)))
            ng = min(255, max(0, int((g - (1 - alpha_frac) * 255) / alpha_frac)))
            nb = min(255, max(0, int((b - (1 - alpha_frac) * 255) / alpha_frac)))
            px[x, y] = (nr, ng, nb, int(a * alpha_frac))
    im.save(out_path)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    style = 'color'
    if '--style' in sys.argv:
        style = sys.argv[sys.argv.index('--style') + 1]
    if '--refresh-catalog' in sys.argv:
        refresh_catalog()
        if not args:
            return

    if not args:
        print(__doc__)
        sys.exit(1)

    term = args[0]
    out_name = args[1] if len(args) > 1 else term

    catalog = load_catalog()
    matches = find_matches(catalog, term)

    if not matches:
        print(f'Nenhum ícone encontrado pra "{term}" no catálogo local.')
        print('Rode com --refresh-catalog pra atualizar a lista, ou tente outro termo.')
        sys.exit(1)

    if len(matches) > 1:
        print(f'{len(matches)} ícones batem com "{term}":')
        for m in matches:
            print(f"  - {m['full']}")
        print('\nRode de novo usando o id completo acima (ex: fetch-icon.py ef4a90-bell).')
        sys.exit(1)

    icon = matches[0]
    print(f"Encontrado: {icon['slug']} (id: {icon['id']}) — baixando estilo '{style}'...")

    tmp_webp = download_icon(icon['full'], style)

    os.makedirs(ICONS_DIR, exist_ok=True)
    out_path = os.path.join(ICONS_DIR, f'{out_name}.png')

    # webp -> png via Pillow direto (evita depender do sips do macOS)
    from PIL import Image
    Image.open(tmp_webp).save(out_path)

    print('Removendo fundo branco...')
    remove_white_bg(out_path, out_path)

    print(f'Pronto: public/icons/{out_name}.png')


if __name__ == '__main__':
    main()
