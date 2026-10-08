#!/usr/bin/env python3
"""Gera as 3 primeiras artes de feed (1080x1350) com texto exato."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
W, H = 1080, 1350
FONT = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
ORANGE_TOP = (255, 168, 46)
ORANGE_BOT = (234, 88, 12)
INK = (45, 28, 18)
WHITE = (255, 255, 255)
SCENE = Path(
    "/Users/guilhermemassini/.grok/sessions/"
    "%2FUsers%2Fguilhermemassini%2Forca%2Fworkspaces%2Fpetlove-mvp"
    "%2Fmas-5-patinha-mvp-o-que-ainda-precisa-da-aten-o/"
    "01a0b15f-a2c9-75b0-a77b-56e3c92be9b0/images/1.jpg"
)
ICONS = ROOT / "public" / "icons" / "3d"


def font(size, regular=False):
    return ImageFont.truetype(FONT_REG if regular else FONT, size)


def gradient():
    img = Image.new("RGB", (W, H), ORANGE_BOT)
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        r = int(ORANGE_TOP[0] * (1 - t) + ORANGE_BOT[0] * t)
        g = int(ORANGE_TOP[1] * (1 - t) + ORANGE_BOT[1] * t)
        b = int(ORANGE_TOP[2] * (1 - t) + ORANGE_BOT[2] * t)
        for x in range(W):
            px[x, y] = (r, g, b)
    return img


def rounded_rect(draw, box, radius, fill, shadow=False, base=None):
    x0, y0, x1, y1 = box
    if shadow and base is not None:
        sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        sd.rounded_rectangle((x0 + 6, y0 + 10, x1 + 6, y1 + 10), radius=radius, fill=(0, 0, 0, 40))
        sh = sh.filter(ImageFilter.GaussianBlur(8))
        base.alpha_composite(sh)
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def draw_multiline_center(draw, lines, y, fnt, fill, stroke_fill=None, stroke=0, gap=8):
    sizes = [draw.textbbox((0, 0), line, font=fnt) for line in lines]
    heights = [b[3] - b[1] for b in sizes]
    total = sum(heights) + gap * (len(lines) - 1)
    cy = y
    for line, h in zip(lines, heights):
        draw.text(
            (W / 2, cy + h / 2),
            line,
            font=fnt,
            fill=fill,
            stroke_width=stroke,
            stroke_fill=stroke_fill,
            anchor="mm",
        )
        cy += h + gap
    return total


def post1():
    scene = Image.open(SCENE).convert("RGBA")
    scene = scene.resize((W, H), Image.Resampling.LANCZOS)
    d = ImageDraw.Draw(scene)
    fnt = font(64)
    draw_multiline_center(
        d,
        ["Você sabe quando foi", "a última vacina", "do seu pet?"],
        y=48,
        fnt=fnt,
        fill=WHITE,
        stroke_fill=INK,
        stroke=8,
        gap=6,
    )
    out = scene.convert("RGB")
    path = OUT / "01-dor-vacina.png"
    out.save(path, "PNG", optimize=True)
    return path


def circle_icon(name, size=92):
    im = Image.open(ICONS / name).convert("RGBA")
    im = im.resize((size, size), Image.Resampling.LANCZOS)
    return im


def post2():
    base = gradient().convert("RGBA")
    d = ImageDraw.Draw(base)
    title = font(62)
    draw_multiline_center(
        d,
        ["Tudo isso,", "num só lugar"],
        y=88,
        fnt=title,
        fill=WHITE,
        stroke_fill=INK,
        stroke=6,
        gap=4,
    )
    rows = [
        ("bone.png", "Rotina do pet"),
        ("vacina.png", "Saúde e vacina"),
        ("servicos.png", "Serviços perto de você"),
        ("calendario.png", "Linha do tempo"),
    ]
    card_h = 168
    gap = 28
    x0, x1 = 72, W - 72
    y = 360
    label_font = font(40)
    for icon_name, label in rows:
        box = (x0, y, x1, y + card_h)
        rounded_rect(d, box, 36, WHITE, shadow=True, base=base)
        d.rounded_rectangle(box, radius=36, fill=WHITE)
        icon = circle_icon(icon_name, 96)
        ix, iy = x0 + 36, y + (card_h - 96) // 2
        base.alpha_composite(icon, (ix, iy))
        d = ImageDraw.Draw(base)
        d.text((ix + 96 + 28, y + card_h / 2), label, font=label_font, fill=INK, anchor="lm")
        y += card_h + gap
    path = OUT / "02-tudo-num-so-lugar.png"
    base.convert("RGB").save(path, "PNG", optimize=True)
    return path


def post3():
    base = gradient().convert("RGBA")
    d = ImageDraw.Draw(base)
    # GRÁTIS pill
    pill = "GRÁTIS"
    pf = font(28)
    bb = d.textbbox((0, 0), pill, font=pf)
    pw, ph = bb[2] - bb[0] + 56, bb[3] - bb[1] + 28
    px0 = (W - pw) // 2
    py0 = 88
    d.rounded_rectangle((px0, py0, px0 + pw, py0 + ph), radius=ph // 2, fill=WHITE)
    d.text((W / 2, py0 + ph / 2), pill, font=pf, fill=ORANGE_BOT, anchor="mm")

    paw = Image.open(ICONS / "patinha.png").convert("RGBA").resize((420, 420), Image.Resampling.LANCZOS)
    # app-icon plate
    plate = Image.new("RGBA", (460, 460), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle((0, 0, 460, 460), radius=108, fill=(255, 152, 32, 255))
    plate.alpha_composite(paw, (20, 20))
    base.alpha_composite(plate, ((W - 460) // 2, 210))

    d = ImageDraw.Draw(base)
    fnt = font(58)
    draw_multiline_center(
        d,
        ["Comece grátis e", "organize a vida", "do seu pet"],
        y=720,
        fnt=fnt,
        fill=WHITE,
        stroke_fill=INK,
        stroke=7,
        gap=4,
    )
    hint = font(26, regular=True)
    d.text((W / 2, 1088), "Abra no celular, sem cartão", font=hint, fill=(255, 236, 210), anchor="mm")
    url = "patinha-mvp.vercel.app"
    uf = font(32)
    ub = d.textbbox((0, 0), url, font=uf)
    uw, uh = ub[2] - ub[0] + 64, ub[3] - ub[1] + 36
    ux0 = (W - uw) // 2
    uy0 = 1140
    d.rounded_rectangle((ux0, uy0, ux0 + uw, uy0 + uh), radius=uh // 2, fill=WHITE)
    d.text((W / 2, uy0 + uh / 2), url, font=uf, fill=INK, anchor="mm")
    path = OUT / "03-comece-gratis.png"
    base.convert("RGB").save(path, "PNG", optimize=True)
    return path


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [post1(), post2(), post3()]
    for p in paths:
        im = Image.open(p)
        print(p.name, im.size)
    return paths


if __name__ == "__main__":
    main()
