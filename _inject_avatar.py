from PIL import Image
import base64, io, pathlib

ROOT = pathlib.Path(r"D:/Users/personal web/personal-website")
src = ROOT / "assets" / "photo.jpg"
html = ROOT / "index.html"

img = Image.open(src).convert("RGB")
maxw = 440
if img.width > maxw:
    h = round(img.height * maxw / img.width)
    img = img.resize((maxw, h), Image.LANCZOS)

buf = io.BytesIO()
img.save(buf, format="JPEG", quality=85, optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode("ascii")
data_uri = "data:image/jpeg;base64," + b64

text = html.read_text(encoding="utf-8")
if "__AVATAR_B64__" not in text:
    raise SystemExit("placeholder not found")
text = text.replace("__AVATAR_B64__", data_uri)
html.write_text(text, encoding="utf-8")
print("ok: image bytes", len(buf.getvalue()), "| b64 len", len(b64), "| placeholder replaced")
