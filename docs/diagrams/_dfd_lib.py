"""Shared drawing helpers for CodeLogic DFD Level 2 diagrams.

Mirrors the visual style of draw_dfd_level1.py so every Level 2 diagram
looks like a continuation of the Level 1 figure (Gane-Sarson style:
external entities on the left, numbered process in the middle, data
stores on the right, with named flows).

Usage:
    from _dfd_lib import render_dfd

    render_dfd(
        out_path,
        title=("2.1", "User & Auth Management"),
        rows=[
            {
                "proc_num": "1.1",
                "proc_lines": ["Register", "Account"],
                "entities": [("Guest", "Registration Form", "Account Created")],
                "stores":   [("D1", "Users", "Insert User", None)],
            },
            ...
        ],
    )
"""
from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont


# --- Layout constants (shared across every Level 2 figure) -----------------
W = 1700                # canvas width
TOP_MARGIN = 110        # space above the first row (title bar lives here)
BOTTOM_MARGIN = 60
ROW_HEIGHT = 340        # vertical pitch between two process boxes

COL_ENT = 200           # x-center of the entity column
COL_PROC = 820          # x-center of the process column
COL_DS = 1500           # x-center of the data-store column
PROC_LW = 140           # half-width of the process box
PROC_LEFT = COL_PROC - PROC_LW
PROC_RIGHT = COL_PROC + PROC_LW


def _load_fonts():
    try:
        return (
            ImageFont.truetype("arial.ttf", 17),
            ImageFont.truetype("arial.ttf", 14),
            ImageFont.truetype("arialbd.ttf", 19),
            ImageFont.truetype("arialbd.ttf", 26),
        )
    except Exception:
        d = ImageFont.load_default()
        return d, d, d, d


def _textw(draw, text, fnt):
    return draw.textlength(text, font=fnt)


def _rect_box(draw, cx, cy, text, font, w=160, h=46):
    draw.rectangle((cx - w/2, cy - h/2, cx + w/2, cy + h/2),
                   outline="black", width=2, fill="white")
    tw = _textw(draw, text, font)
    draw.text((cx - tw/2, cy - 10), text, fill="black", font=font)
    return dict(cx=cx, cy=cy, w=w, h=h)


def _process_box(draw, cx, cy, num, lines, font, font_bold, w=280, h=160):
    draw.rectangle((cx - w/2, cy - h/2, cx + w/2, cy + h/2),
                   outline="black", width=2, fill="white")
    tw = _textw(draw, num, font_bold)
    draw.text((cx - tw/2, cy - h/2 + 14), num, fill="black", font=font_bold)
    line_h = 24
    start_y = cy - (len(lines) * line_h) / 2 + 8
    for i, line in enumerate(lines):
        tw = _textw(draw, line, font)
        draw.text((cx - tw/2, start_y + i*line_h), line, fill="black", font=font)
    return dict(cx=cx, cy=cy, w=w, h=h)


def _data_store(draw, cx, cy, label, name, font, font_bold, w=230, h=46):
    draw.rectangle((cx - w/2, cy - h/2, cx + w/2, cy + h/2),
                   outline="black", width=2, fill="white")
    div_x = cx - w/2 + 42
    draw.line((div_x, cy - h/2, div_x, cy + h/2), fill="black", width=2)
    tw = _textw(draw, label, font_bold)
    draw.text((cx - w/2 + 21 - tw/2, cy - 11), label, fill="black", font=font_bold)
    tw = _textw(draw, name, font)
    draw.text((div_x + (w - 42)/2 - tw/2, cy - 10), name, fill="black", font=font)
    return dict(cx=cx, cy=cy, w=w, h=h)


def _arrowhead(draw, x1, y1, x2, y2, size=8):
    angle = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - size*math.cos(angle - math.pi/7),
          y2 - size*math.sin(angle - math.pi/7))
    p2 = (x2 - size*math.cos(angle + math.pi/7),
          y2 - size*math.sin(angle + math.pi/7))
    draw.polygon([(x2, y2), p1, p2], fill="black")


def _flow(draw, x1, y1, x2, y2, label, font_lbl, label_above=True):
    """Draw an arrow from (x1,y1) to (x2,y2) with `label` placed either
    above or below the line. Two parallel arrows (a request/response pair)
    should pass label_above=True for the top arrow and label_above=False
    for the bottom arrow so the labels stay outside the sandwich and the
    reader can tell which label belongs to which arrow."""
    draw.line((x1, y1, x2, y2), fill="black", width=2)
    _arrowhead(draw, x1, y1, x2, y2)
    mx = (x1 + x2) / 2
    tw = _textw(draw, label, font_lbl)
    label_y = (y1 - 18) if label_above else (y1 + 6)
    draw.text((mx - tw/2, label_y), label, fill="black", font=font_lbl)


def _draw_row(draw, y_center, proc_num, proc_lines, entities, stores,
              font, font_lbl, font_bold):
    """Render one process row in Gane-Sarson layout.

    entities: list of (name, out_label, in_label) - the entity sits to the
              LEFT of the process, with one outgoing arrow (entity -> proc)
              and one return arrow (proc -> entity), each labeled.
    stores:   list of (D_label, name, to_label, from_label_or_None) - the
              data store sits to the RIGHT of the process. `from_label=None`
              suppresses the return arrow (one-way write).
    """
    _process_box(draw, COL_PROC, y_center, proc_num, proc_lines,
                 font, font_bold)

    n_ent = len(entities)
    if n_ent == 0:
        ent_ys = []
    elif n_ent == 1:
        ent_ys = [y_center]
    else:
        span = 75 * (n_ent - 1)
        top = y_center - span / 2
        ent_ys = [top + i * 75 for i in range(n_ent)]

    for i, (name, out_lbl, in_lbl) in enumerate(entities):
        ey = ent_ys[i]
        e_box = _rect_box(draw, COL_ENT, ey, name, font)
        ex_edge = COL_ENT + e_box["w"] / 2
        # Top arrow: entity -> process, label above the line.
        _flow(draw, ex_edge, ey - 10, PROC_LEFT, ey - 10, out_lbl, font_lbl,
              label_above=True)
        if in_lbl:
            # Bottom arrow: process -> entity, label BELOW the line so the
            # two labels don't collapse into one visual block.
            _flow(draw, PROC_LEFT, ey + 10, ex_edge, ey + 10, in_lbl,
                  font_lbl, label_above=False)

    n_ds = len(stores)
    if n_ds == 0:
        ds_ys = []
    elif n_ds == 1:
        ds_ys = [y_center]
    else:
        span = 75 * (n_ds - 1)
        top = y_center - span / 2
        ds_ys = [top + i * 75 for i in range(n_ds)]

    for i, ds_item in enumerate(stores):
        d_label, d_name, to_lbl, from_lbl = ds_item
        dy = ds_ys[i]
        d_box = _data_store(draw, COL_DS, dy, d_label, d_name,
                            font, font_bold)
        dx_left = COL_DS - d_box["w"] / 2
        # Top arrow: process -> data store, label above.
        _flow(draw, PROC_RIGHT, dy - 10, dx_left, dy - 10, to_lbl, font_lbl,
              label_above=True)
        if from_lbl:
            # Bottom arrow: data store -> process, label BELOW to keep the
            # two labels visually separated.
            _flow(draw, dx_left, dy + 10, PROC_RIGHT, dy + 10, from_lbl,
                  font_lbl, label_above=False)


def render_dfd(out_path: Path, title: tuple, rows: list):
    """Render a Level 2 DFD figure to PNG.

    title: (parent_num, parent_name) - e.g. ("1.0", "User & Auth Management").
           Drawn as a centered title across the top of the figure.
    rows:  list of {proc_num, proc_lines, entities, stores} dicts.
    """
    font, font_lbl, font_bold, font_title = _load_fonts()

    # Height scales with the number of sub-process rows so the layout
    # stays uncluttered regardless of how many sub-processes a parent
    # process has.
    h = TOP_MARGIN + ROW_HEIGHT * len(rows) + BOTTOM_MARGIN
    img = Image.new("RGB", (W, h), "white")
    draw = ImageDraw.Draw(img)

    parent_num, parent_name = title
    title_text = f"Process {parent_num} - {parent_name}"
    subtitle_text = "Level 2 DFD (Decomposition)"
    tw = _textw(draw, title_text, font_title)
    draw.text((W/2 - tw/2, 22), title_text, fill="black", font=font_title)
    tw = _textw(draw, subtitle_text, font_lbl)
    draw.text((W/2 - tw/2, 64), subtitle_text, fill="#555555", font=font_lbl)
    draw.line((80, 95, W - 80, 95), fill="#999999", width=1)

    # First row sits ROW_HEIGHT/2 below the top margin so every row is
    # vertically centered in its own track.
    y0 = TOP_MARGIN + ROW_HEIGHT / 2
    for i, row in enumerate(rows):
        _draw_row(
            draw, y0 + i * ROW_HEIGHT,
            row["proc_num"], row["proc_lines"],
            row.get("entities", []),
            row.get("stores", []),
            font, font_lbl, font_bold,
        )

    img.save(out_path)
    return out_path
