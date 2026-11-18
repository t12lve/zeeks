"""Génère les fichiers de test (images, animations, audio) dans tmp/."""
import math, struct, wave, pathlib
from PIL import Image, ImageDraw, ImageFont

out = pathlib.Path("tmp")
out.mkdir(exist_ok=True)


def gradient(w, h, c1, c2, label, alpha=False):
    im = Image.new("RGBA" if alpha else "RGB", (w, h))
    px = im.load()
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            t = (x / w + y / h) / 2
            col = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
            for dy in range(2):
                for dx in range(2):
                    if x + dx < w and y + dy < h:
                        px[x + dx, y + dy] = col
    d = ImageDraw.Draw(im)
    size = max(28, w // 12)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
    except Exception:
        font = ImageFont.load_default()
    tw = d.textlength(label, font=font)
    d.text(((w - tw) / 2, h * 0.42), label, font=font, fill=(255, 255, 255, 255))
    # repères de cadrage pour vérifier les crops
    d.rectangle([0, 0, w - 1, h - 1], outline=(255, 255, 255, 255), width=max(4, w // 100))
    d.rectangle([w * 0.1, h * 0.1, w * 0.9, h * 0.9], outline=(255, 255, 0, 255), width=4)
    return im


# paysage
gradient(1920, 1080, (26, 60, 140), (250, 120, 40), "PAYSAGE 16:9").convert("RGB").save(out / "paysage.jpg", quality=92)
# portrait avec transparence
port = gradient(1080, 1920, (20, 120, 90), (240, 220, 60), "PORTRAIT 9:16", alpha=True)
port.putalpha(255)
# coins transparents pour tester l'alpha
d = ImageDraw.Draw(port)
d.ellipse([0, 0, 400, 400], fill=(0, 0, 0, 0))
port.save(out / "portrait.png")
# carré
gradient(1000, 1000, (150, 30, 90), (40, 200, 230), "CARRE 1:1").convert("RGB").save(out / "carre.png")

# GIF animé
frames = []
for i in range(24):
    im = gradient(480, 270, (30 + i * 6, 40, 160), (250, 100 + i * 5, 40), f"GIF {i+1}/24")
    d = ImageDraw.Draw(im)
    d.ellipse([40 + i * 16, 40, 140 + i * 16, 140], fill=(255, 255, 255, 200))
    frames.append(im.convert("P", palette=Image.ADAPTIVE, colors=200))
frames[0].save(out / "anim.gif", save_all=True, append_images=frames[1:], duration=80, loop=0)

# APNG
apng = []
for i in range(16):
    im = gradient(640, 360, (10, 60, 40), (200, 240, 120), f"APNG {i+1}/16")
    d = ImageDraw.Draw(im)
    d.rectangle([20 + i * 30, 300, 90 + i * 30, 340], fill=(0, 0, 0, 255))
    apng.append(im.convert("RGBA"))
apng[0].save(out / "anim.png", save_all=True, append_images=apng[1:], duration=100, loop=0)

# WebP animé
webp = []
for i in range(20):
    im = gradient(500, 500, (120, 20, 60), (30, 180, 220), f"WEBP {i+1}/20")
    webp.append(im.convert("RGB"))
webp[0].save(out / "anim.webp", save_all=True, append_images=webp[1:], duration=90, loop=0)

# --- audio : 30 s de mélodie simple, stéréo 44,1 kHz ---
sr = 44100
dur = 30
w = wave.open(str(out / "test.wav"), "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(sr)
buf = bytearray()
notes = [220.0, 277.2, 329.6, 440.0, 329.6, 277.2]
for i in range(sr * dur):
    beat = int(i / (sr / 2))
    f = notes[beat % len(notes)]
    env = 1.0 - (i % (sr // 2)) / (sr // 2) * 0.7
    v = int(9000 * env * math.sin(2 * math.pi * f * i / sr))
    buf += struct.pack("<hh", v, v)
w.writeframes(bytes(buf))
w.close()

# copie du mp3 réel trouvé sur la machine
src = pathlib.Path(r"F:\DBXSSD\Dropbox\STRIM\kamehameha.swf.mp3")
if src.exists():
    (out / "court.mp3").write_bytes(src.read_bytes())

print("assets:", sorted(p.name for p in out.iterdir()))
