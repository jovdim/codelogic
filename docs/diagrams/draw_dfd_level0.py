"""DFD Level 0 (Context Diagram) for CodeLogic — arrows touch both endpoints."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "03_dfd_level0.png"

W, H = 2000, 1300
img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype("arial.ttf", 18)
    font_lbl = ImageFont.truetype("arial.ttf", 13)
    font_title = ImageFont.truetype("arialbd.ttf", 22)
    font_num = ImageFont.truetype("arialbd.ttf", 26)
except Exception:
    font = ImageFont.load_default()
    font_lbl = font
    font_title = font
    font_num = font


def textw(text, fnt):
    return draw.textlength(text, font=fnt)


def rect_box(cx, cy, text, w=200, h=200):
    draw.rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2),
                   outline="black", width=2, fill="white")
    tw = textw(text, font)
    draw.text((cx - tw / 2, cy - 12), text, fill="black", font=font)
    return dict(cx=cx, cy=cy, w=w, h=h)


def center_process(cx, cy, num, name_lines, w=460, h=720):
    draw.rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2),
                   outline="black", width=2, fill="white")
    tw = textw(num, font_num)
    draw.text((cx - tw / 2, cy - h / 2 + 20), num, fill="black", font=font_num)
    line_h = 32
    start_y = cy - (len(name_lines) * line_h) / 2
    for i, line in enumerate(name_lines):
        tw = textw(line, font_title)
        draw.text((cx - tw / 2, start_y + i * line_h), line, fill="black", font=font_title)
    return dict(cx=cx, cy=cy, w=w, h=h)


def arrowhead(x1, y1, x2, y2, size=10):
    angle = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - size * math.cos(angle - math.pi / 7),
          y2 - size * math.sin(angle - math.pi / 7))
    p2 = (x2 - size * math.cos(angle + math.pi / 7),
          y2 - size * math.sin(angle + math.pi / 7))
    draw.polygon([(x2, y2), p1, p2], fill="black")


def flow(x1, y1, x2, y2, label):
    draw.line((x1, y1, x2, y2), fill="black", width=2)
    arrowhead(x1, y1, x2, y2)
    mx = (x1 + x2) / 2
    tw = textw(label, font_lbl)
    draw.text((mx - tw / 2, y1 - 16), label, fill="black", font=font_lbl)


center = center_process(W / 2, H / 2, "0", ["CodeLogic"])
cl = center["cx"] - center["w"] / 2
cr = center["cx"] + center["w"] / 2

admin   = rect_box(200,   420, "Admin",         w=180, h=300)
student = rect_box(W-200, 420, "Student",       w=180, h=300)
pdf     = rect_box(200,   900, "PDF Service",   w=200, h=200)
email   = rect_box(W-200, 900, "Email Service", w=200, h=200)


def draw_set(entity, flows, ys, target_x, entity_side):
    if entity_side == "right":
        ex = entity["cx"] + entity["w"] / 2
    else:
        ex = entity["cx"] - entity["w"] / 2
    for (label, direction), y in zip(flows, ys):
        if direction == "out":
            flow(ex, y, target_x, y, label)
        else:
            flow(target_x, y, ex, y, label)


admin_flows = [
    ("Login Credentials",        "out"),
    ("Auth Response",            "in"),
    ("Manage Users / Content",   "out"),
    ("User Records",             "in"),
    ("View Quiz Attempts",       "out"),
    ("Quiz Audit Data",          "in"),
]
adm_ys = [310, 355, 400, 445, 490, 535]
draw_set(admin, admin_flows, adm_ys, cl, "right")

student_flows = [
    ("Registration / Login",            "out"),
    ("Account Confirmation",            "in"),
    ("Browse / Quiz Activity",          "out"),
    ("Catalog / Lessons / Questions",   "in"),
    ("Quiz Answers / Profile Update",   "out"),
    ("Result / Stats / Certificate",    "in"),
]
stu_ys = [310, 355, 400, 445, 490, 535]
draw_set(student, student_flows, stu_ys, cr, "left")

pdf_flows = [
    ("Certificate HTML", "in"),
    ("Rendered PDF",     "out"),
]
pdf_ys = [855, 920]
draw_set(pdf, pdf_flows, pdf_ys, cl, "right")

email_flows = [
    ("Verify / Reset / Unlock Email", "in"),
    ("Delivery Status",                "out"),
]
em_ys = [855, 920]
draw_set(email, email_flows, em_ys, cr, "left")

img.save(OUT)
print(f"Wrote {OUT}")
