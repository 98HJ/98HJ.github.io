# -*- coding: utf-8 -*-
"""Regenerate assets/og-cover.png (1200x630) WITH the avatar photo,
so the social share card shows the user's portrait. Pure Pillow, no network."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
W, H = 1200, 630

# ---- palette (must match css :root) ----
bg          = (250, 248, 244)   # --bg  #faf8f4
accent      = (168,  90,  60)   # --accent #a85a3c
accent_soft = (243, 231, 224)   # --accent-soft #f3e7e0
ink         = ( 33,  29,  26)   # --ink #211d1a
muted       = (122, 113, 106)   # --muted #7a716a
white       = (255, 255, 255)

def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)

cn_b = font("C:/Windows/Fonts/msyhbd.ttc", 66, 0)
cn_r = font("C:/Windows/Fonts/msyh.ttc",   30, 0)
cn_s = font("C:/Windows/Fonts/msyh.ttc",   25, 0)
en_i = font("C:/Windows/Fonts/georgiai.ttf", 44)   # italic for "Jian Hua"
en_r = font("C:/Windows/Fonts/georgia.ttf",  30)
en_s = font("C:/Windows/Fonts/georgia.ttf",  26)

# ---- base canvas ----
img = Image.new("RGB", (W, H), bg)
d = ImageDraw.Draw(img)

# soft accent glow, top-right
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse([W - 540, -280, W + 280, 520],
                             fill=(accent[0], accent[1], accent[2], 28))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
d = ImageDraw.Draw(img)

# ---- avatar (circular, with white ring) ----
photo = Image.open(os.path.join(ROOT, "assets", "photo.jpg")).convert("RGB")
pw, ph = photo.size
s = min(pw, ph)
photo = photo.crop(((pw - s) // 2, (ph - s) // 2,
                    (pw - s) // 2 + s, (ph - s) // 2 + s))
photo = photo.resize((360, 360), Image.LANCZOS)

mask = Image.new("L", (360, 360), 0)
ImageDraw.Draw(mask).ellipse([0, 0, 359, 359], fill=255)

ring = Image.new("RGBA", (392, 392), (0, 0, 0, 0))
ImageDraw.Draw(ring).ellipse([0, 0, 391, 391], fill=white)   # white disc
avatar = ring
avatar.paste(photo, (16, 16), mask)                          # portrait on top -> white ring shows
img.paste(avatar, (76, 150), avatar)                         # paste RGBA onto RGB using its alpha mask
d = ImageDraw.Draw(img)

# ---- text block (right side) ----
x0 = 512
y = 132
d.text((x0, y), "花健", font=cn_b, fill=ink)
d.text((x0 + 150, y + 20), "Jian Hua", font=en_i, fill=accent)
y += 92
d.line([x0, y, x0 + 624, y], fill=accent, width=3)
y += 30

lines = [
    ("博士研究生 · Ph.D. Candidate", cn_r, ink),
    ("Fashion Design & Engineering",  en_r, ink),
    ("Soochow University · Advisor: Prof. Xue Zhebin", cn_s, muted),
    ("Digital Fashion & Wearable Systems", en_s, accent),
]
for text, fnt, col in lines:
    d.text((x0, y), text, font=fnt, fill=col)
    y += (40 if fnt.size >= 30 else 36)

y += 6
d.text((x0, y), "orcid.org/0009-0001-9173-520X", font=cn_s, fill=muted)

# ---- save ----
out = os.path.join(ROOT, "assets", "og-cover.png")
img.save(out, "PNG", optimize=True)
print("saved", out, img.size)
