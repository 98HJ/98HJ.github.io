import base64, io, os
from PIL import Image

ROOT = "D:/Users/personal web/personal-website"
src = os.path.join(ROOT, "assets", "photo.jpg")
out = os.path.join(ROOT, "assets", "avatar.js")

# 缩放到 400x400 居中裁剪，减小体积、加快加载
img = Image.open(src).convert("RGB")
w, h = img.size
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
img = img.crop((left, top, left + side, top + side)).resize((256, 256), Image.LANCZOS)

buf = io.BytesIO()
img.save(buf, format="JPEG", quality=72, optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode("ascii")

# 按 76 字符换行，便于作为纯文本传输
chunks = [b64[i:i+76] for i in range(0, len(b64), 76)]
body = ",\n  ".join('"%s"' % c for c in chunks)

js = (
    "// Auto-generated avatar (base64 JPEG). Regenerate with scripts, do not edit by hand.\n"
    "(function () {\n"
    "  var b = [\n  " + body + "\n  ].join(\"\");\n"
    "  var el = document.getElementById(\"siteAvatar\");\n"
    "  if (el) el.src = \"data:image/jpeg;base64,\" + b;\n"
    "})();\n"
)
with open(out, "w", encoding="utf-8") as f:
    f.write(js)

print("avatar.js bytes:", os.path.getsize(out))
print("base64 chars:", len(b64))
