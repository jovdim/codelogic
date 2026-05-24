"""DFD Level 1 for CodeLogic - one process per row, FOSSH style."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "04_dfd_level1.png"

W, H = 1700, 2200
img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)

try:
    font     = ImageFont.truetype("arial.ttf", 17)
    font_lbl = ImageFont.truetype("arial.ttf", 14)
    font_bold= ImageFont.truetype("arialbd.ttf", 19)
except Exception:
    font = ImageFont.load_default()
    font_lbl = font
    font_bold = font


def textw(text, fnt):
    return draw.textlength(text, font=fnt)


def rect_box(cx, cy, text, w=150, h=46):
    draw.rectangle((cx - w/2, cy - h/2, cx + w/2, cy + h/2),
                   outline="black", width=2, fill="white")
    tw = textw(text, font)
    draw.text((cx - tw/2, cy - 10), text, fill="black", font=font)
    return dict(cx=cx, cy=cy, w=w, h=h)


def process_box(cx, cy, num, lines, w=280, h=160):
    draw.rectangle((cx - w/2, cy - h/2, cx + w/2, cy + h/2),
                   outline="black", width=2, fill="white")
    tw = textw(num, font_bold)
    draw.text((cx - tw/2, cy - h/2 + 14), num, fill="black", font=font_bold)
    line_h = 24
    start_y = cy - (len(lines) * line_h) / 2 + 8
    for i, line in enumerate(lines):
        tw = textw(line, font)
        draw.text((cx - tw/2, start_y + i*line_h), line, fill="black", font=font)
    return dict(cx=cx, cy=cy, w=w, h=h)


def data_store(cx, cy, label, name, w=210, h=46):
    draw.rectangle((cx - w/2, cy - h/2, cx + w/2, cy + h/2),
                   outline="black", width=2, fill="white")
    div_x = cx - w/2 + 42
    draw.line((div_x, cy - h/2, div_x, cy + h/2), fill="black", width=2)
    tw = textw(label, font_bold)
    draw.text((cx - w/2 + 21 - tw/2, cy - 11), label, fill="black", font=font_bold)
    tw = textw(name, font)
    draw.text((div_x + (w - 42)/2 - tw/2, cy - 10), name, fill="black", font=font)
    return dict(cx=cx, cy=cy, w=w, h=h)


def arrowhead(x1, y1, x2, y2, size=8):
    angle = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - size*math.cos(angle - math.pi/7), y2 - size*math.sin(angle - math.pi/7))
    p2 = (x2 - size*math.cos(angle + math.pi/7), y2 - size*math.sin(angle + math.pi/7))
    draw.polygon([(x2, y2), p1, p2], fill="black")


def flow(x1, y1, x2, y2, label):
    draw.line((x1, y1, x2, y2), fill="black", width=2)
    arrowhead(x1, y1, x2, y2)
    mx = (x1 + x2) / 2
    tw = textw(label, font_lbl)
    draw.text((mx - tw/2, y1 - 18), label, fill="black", font=font_lbl)


COL_ENT = 200
COL_PROC = 820
COL_DS = 1500
PROC_LW = 140
PROC_LEFT = COL_PROC - PROC_LW
PROC_RIGHT = COL_PROC + PROC_LW


def draw_row(y_center, proc_num, proc_lines, entities, stores):
    """entities: list of (name, out_label, in_label).
    stores: list of (D_label, name, to_label, from_label_or_None)."""
    process_box(COL_PROC, y_center, proc_num, proc_lines)

    n_ent = len(entities)
    if n_ent == 1:
        ent_ys = [y_center]
    else:
        span = 70 * (n_ent - 1)
        top = y_center - span / 2
        ent_ys = [top + i * 70 for i in range(n_ent)]

    for i, (name, out_lbl, in_lbl) in enumerate(entities):
        ey = ent_ys[i]
        e_box = rect_box(COL_ENT, ey, name)
        ex_edge = COL_ENT + e_box["w"] / 2
        flow(ex_edge, ey - 10, PROC_LEFT, ey - 10, out_lbl)
        flow(PROC_LEFT, ey + 10, ex_edge, ey + 10, in_lbl)

    n_ds = len(stores)
    if n_ds == 1:
        ds_ys = [y_center]
    else:
        span = 70 * (n_ds - 1)
        top = y_center - span / 2
        ds_ys = [top + i * 70 for i in range(n_ds)]

    for i, ds_item in enumerate(stores):
        d_label, d_name, to_lbl, from_lbl = ds_item
        dy = ds_ys[i]
        d_box = data_store(COL_DS, dy, d_label, d_name)
        dx_left = COL_DS - d_box["w"] / 2
        flow(PROC_RIGHT, dy - 10, dx_left, dy - 10, to_lbl)
        if from_lbl:
            flow(dx_left, dy + 10, PROC_RIGHT, dy + 10, from_lbl)


draw_row(
    200, "1.0", ["User and Auth", "Management"],
    [
        ("Student", "Register / Login", "Auth Response"),
        ("Student", "Profile Update", "User Data"),
        ("Admin", "Activate / Deactivate", "User Records"),
    ],
    [
        ("D1", "Users", "User Info", "User Lookup"),
        ("D2", "Tokens", "Issue Token", "Validate Token"),
    ],
)

draw_row(
    560, "2.0", ["Content Catalog"],
    [
        ("Student", "Browse Categories", "Catalog Data"),
        ("Admin", "Add / Edit Topic", "Topic Updated"),
        ("Admin", "Add / Edit Question", "Question Updated"),
    ],
    [
        ("D3", "Categories", "Categories", "Categories Data"),
        ("D4", "Questions", "Questions", "Questions Data"),
    ],
)

draw_row(
    900, "3.0", ["Quiz Engine"],
    [
        ("Student", "Start Quiz", "Questions / Lessons"),
        ("Student", "Submit Answer", "Result / XP"),
        ("Student", "Complete Quiz", "Final Score"),
    ],
    [
        ("D4", "Questions", "Read Questions", "Question Data"),
        ("D5", "Quiz Attempts", "Save Attempt", "Attempt Data"),
    ],
)

draw_row(
    1240, "4.0", ["Progress and", "Gamification"],
    [
        ("Student", "View Stats", "Stats / Streak"),
        ("Student", "Quiz Completed", "Updated Progress"),
    ],
    [
        ("D6", "User Progress", "Save Progress", "Progress Data"),
        ("D1", "Users", "Update XP / Streak", "User Data"),
    ],
)

draw_row(
    1540, "5.0", ["Certificate", "Management"],
    [
        ("Student", "View Certificate", "Certificate Info"),
        ("Student", "Download Certificate", "Certificate PDF"),
        ("PDF Service", "Rendered PDF", "Certificate HTML"),
    ],
    [
        ("D7", "Certificates", "Save Certificate", "Cert Data"),
    ],
)

draw_row(
    1900, "6.0", ["Learning Resources"],
    [
        ("Student", "Browse Resources", "Resource List"),
        ("Student", "Download Resource", "PDF File"),
        ("Admin", "Add / Edit Resource", "Resource Updated"),
    ],
    [
        ("D8", "Resources", "Save Resource", "Resource Data"),
    ],
)

img.save(OUT)
print(f"Wrote {OUT}")
