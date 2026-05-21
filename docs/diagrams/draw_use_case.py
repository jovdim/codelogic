"""Draw UML-style use case diagram with stick-figure actors, white fill, straight lines."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "02_use_case.png"

W, H = 1700, 1500
img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype("arial.ttf", 24)
    font_label = ImageFont.truetype("arialbd.ttf", 26)
except Exception:
    font = ImageFont.load_default()
    font_label = font


def draw_stick(cx, cy, label):
    r = 26
    draw.ellipse((cx - r, cy - 110, cx + r, cy - 58), outline="black", width=3)
    draw.line((cx, cy - 58, cx, cy + 40), fill="black", width=3)
    draw.line((cx - 45, cy - 20, cx + 45, cy - 20), fill="black", width=3)
    draw.line((cx, cy + 40, cx - 35, cy + 110), fill="black", width=3)
    draw.line((cx, cy + 40, cx + 35, cy + 110), fill="black", width=3)
    tw = draw.textlength(label, font=font_label)
    draw.text((cx - tw / 2, cy + 125), label, fill="black", font=font_label)
    return (cx, cy)


def draw_oval(cx, cy, text):
    tw = draw.textlength(text, font=font)
    w = max(tw + 60, 240)
    h = 70
    draw.ellipse(
        (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2),
        outline="black",
        width=2,
        fill="white",
    )
    draw.text((cx - tw / 2, cy - 14), text, fill="black", font=font)
    return (cx, cy, w, h)


def connect(actor_pt, oval):
    ax, ay = actor_pt
    ox, oy, ow, oh = oval
    if ax < ox:
        target_x = ox - ow / 2
        source_x = ax + 45
    else:
        target_x = ox + ow / 2
        source_x = ax - 45
    draw.line((source_x, ay, target_x, oy), fill="black", width=2)


student = draw_stick(160, H // 2, "Student")
admin = draw_stick(W - 160, H // 2, "Admin")

use_cases = [
    ("Login", "both"),
    ("Logout", "both"),
    ("Register Account", "student"),
    ("Reset Password", "student"),
    ("Take Quiz", "student"),
    ("View Progress", "student"),
    ("Download Certificate", "student"),
    ("Browse Learning Resources", "student"),
    ("Manage Users", "admin"),
    ("Manage Quiz Content", "admin"),
    ("View Quiz Attempts", "admin"),
    ("Manage Learning Resources", "admin"),
]

n = len(use_cases)
top_pad = 80
bottom_pad = 80
spacing = (H - top_pad - bottom_pad) // (n - 1)
center_x = W // 2

oval_positions = []
for i, (uc, _) in enumerate(use_cases):
    cy = top_pad + spacing * i
    pos = draw_oval(center_x, cy, uc)
    oval_positions.append(pos)

for (uc, owner), pos in zip(use_cases, oval_positions):
    if owner in ("student", "both"):
        connect(student, pos)
    if owner in ("admin", "both"):
        connect(admin, pos)

img.save(OUT)
print(f"Wrote {OUT}")
