#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
W, H = 1080, 1350
FONT = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
INK = (45, 28, 18)
WHITE = (255, 255, 255)
ORANGE_TOP = (255, 168, 46)
ORANGE_BOT = (234, 88, 12)
SESS = Path(
    "/Users/guilhermemassini/.grok/sessions/"
    "%2FUsers%2Fguilhermemassini%2Forca%2Fworkspaces%2Fpetlove-mvp"
    "%2Fmas-5-patinha-mvp-o-que-ainda-precisa-da-aten-o/"
    "01a0b15f-a2c9-75b0-a77b-56e3c92be9b0/images"
)


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


def draw_lines(draw, lines, y, fnt, fill=WHITE, stroke=INK, sw=8, gap=6):
    sizes = [draw.textbbox((0, 0), line, font=fnt) for line in lines]
    heights = [b[3] - b[1] for b in sizes]
    cy = y
    for line, h in zip(lines, heights):
        draw.text(
            (W / 2, cy + h / 2),
            line,
            font=fnt,
            fill=fill,
            stroke_width=sw,
            stroke_fill=stroke,
            anchor="mm",
        )
        cy += h + gap


def scene_card(src, lines, outfile, y=56, size=58):
    im = Image.open(src).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    d = ImageDraw.Draw(im)
    draw_lines(d, lines, y=y, fnt=font(size), sw=8)
    path = OUT / outfile
    im.convert("RGB").save(path, "PNG", optimize=True)
    return path


def cartaz():
    base = gradient().convert("RGBA")
    d = ImageDraw.Draw(base)
    paw = Image.open(ROOT / "public/icons/3d/patinha.png").convert("RGBA")
    paw = paw.resize((380, 380), Image.Resampling.LANCZOS)
    plate = Image.new("RGBA", (420, 420), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle((0, 0, 420, 420), radius=100, fill=(255, 152, 32, 255))
    plate.alpha_composite(paw, (20, 20))
    base.alpha_composite(plate, ((W - 420) // 2, 160))
    d = ImageDraw.Draw(base)
    draw_lines(
        d,
        ["A vacina", "não se perde", "mais."],
        y=640,
        fnt=font(72),
        sw=8,
        gap=8,
    )
    sub = font(28, regular=True)
    d.text(
        (W / 2, 1020),
        "O Patinha guarda a data pra você.",
        font=sub,
        fill=(255, 236, 210),
        anchor="mm",
    )
    path = OUT / "B-cartaz-vacina.png"
    base.convert("RGB").save(path, "PNG", optimize=True)
    return path


def frase():
    base = gradient().convert("RGBA")
    d = ImageDraw.Draw(base)
    draw_lines(
        d,
        ["Caderno, foto,", "post-it…", "e na hora H", "some."],
        y=280,
        fnt=font(70),
        sw=8,
        gap=14,
    )
    bar_y = 1080
    d.rounded_rectangle((180, bar_y, W - 180, bar_y + 88), radius=44, fill=WHITE)
    d.text(
        (W / 2, bar_y + 44),
        "O Patinha junta tudo.",
        font=font(32),
        fill=INK,
        anchor="mm",
    )
    path = OUT / "C-frase-save.png"
    base.convert("RGB").save(path, "PNG", optimize=True)
    return path


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [
        scene_card(SESS / "5.jpg", ["POV: um dia", "com o Toró"], "A1-pov-acordou.png", y=48, size=62),
        scene_card(SESS / "4.jpg", ["Manhã:", "a ração na hora"], "A2-pov-racao.png", y=48, size=62),
        scene_card(SESS / "3.jpg", ["A vacina,", "no app"], "A3-pov-vacina.png", y=48, size=64),
        scene_card(SESS / "2.jpg", ["O passeio que", "não ficou só na foto"], "A4-pov-passeio.png", y=48, size=54),
        cartaz(),
        frase(),
    ]
    for p in paths:
        im = Image.open(p)
        print(p.name, im.size)


if __name__ == "__main__":
    main()
