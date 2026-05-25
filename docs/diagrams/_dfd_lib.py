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
# The PNG no longer has its own title block. The docx page heading is the
# only place the parent process name appears, so this canvas is pure
# diagram content surrounded by just a small breathing margin.
W = 1700
TOP_MARGIN = 30
BOTTOM_MARGIN = 30

# Vertical pitch between two stacked entities or two stacked data stores
# within the SAME process row. Larger pitch = more whitespace between
# each request/response label pair, so a row with 4 stores doesn't feel
# crammed. The row auto-heights off this number, so increasing it makes
# tall rows even taller (which is what we want - rows with many
# arrows should be visibly tall, not squeezed).
STACK_PITCH = 130

# Table styling. The diagram is enclosed in ONE outer rectangle and the
# sub-process rows are separated by thin horizontal divider lines drawn
# between adjacent rows - same look as the SOFTNET-style Level 2
# reference (a single bounded table with row dividers, not floating
# per-row cells).
TABLE_INSET = 30          # left/right inset from canvas edge
TABLE_BORDER_COLOR = "black"
TABLE_BORDER_WIDTH = 2
ROW_DIVIDER_COLOR = "black"
ROW_DIVIDER_WIDTH = 1
ROW_VERTICAL_PADDING = 50  # whitespace above + below content inside a row
ROW_MIN_HEIGHT = 260       # never collapse below the process box + padding

COL_ENT = 200
COL_PROC = 820
COL_DS = 1500
PROC_LW = 140
PROC_LEFT = COL_PROC - PROC_LW
PROC_RIGHT = COL_PROC + PROC_LW


def _load_fonts():
    try:
        return (
            ImageFont.truetype("arial.ttf", 17),       # process / box body
            ImageFont.truetype("arial.ttf", 14),       # flow labels
            ImageFont.truetype("arialbd.ttf", 19),     # store D-tag + proc number
            ImageFont.truetype("arialbd.ttf", 26),     # (unused, kept for compat)
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


PROC_BOX_W = 280
PROC_BOX_MIN_H = 160


def _process_box(draw, cx, cy, num, lines, font, font_bold,
                 w=PROC_BOX_W, h=PROC_BOX_MIN_H):
    """Two-row process box, like a table cell with a header:

      ┌──────────────┐
      │     3.2      │     <- number section (header)
      ├──────────────┤
      │  Validate    │     <- process name section
      │  & Score     │
      │   Answer     │
      └──────────────┘

    Height grows when the row stacks many data stores or entities so that
    every store-side / entity-side arrow starts from inside this box, not
    floating in empty space above or below it.
    """
    left, right = cx - w/2, cx + w/2
    top, bottom = cy - h/2, cy + h/2

    # Outer box
    draw.rectangle((left, top, right, bottom),
                   outline="black", width=2, fill="white")

    # Header section height + divider position (header takes the top
    # 44 px so the process number sits in its own clearly demarcated
    # slot regardless of total box height).
    header_h = 44
    div_y = top + header_h

    # Number, vertically centered in the header section.
    tw = _textw(draw, num, font_bold)
    num_y = top + (header_h - 19) / 2
    draw.text((cx - tw/2, num_y), num, fill="black", font=font_bold)

    # Divider line between the number and the process name.
    draw.line((left, div_y, right, div_y), fill="black", width=2)

    # Process name, vertically centered in the body section.
    line_h = 24
    body_top = div_y
    body_h = bottom - body_top
    body_text_h = len(lines) * line_h
    start_y = body_top + (body_h - body_text_h) / 2
    for i, line in enumerate(lines):
        tw = _textw(draw, line, font)
        draw.text((cx - tw/2, start_y + i*line_h), line, fill="black", font=font)

    return dict(cx=cx, cy=cy, w=w, h=h)


def _process_box_height(n_max: int) -> int:
    """How tall the process box must be so the arrows to the topmost
    and bottommost stacked store/entity start INSIDE the box, not in
    empty space above/below it."""
    if n_max <= 1:
        return PROC_BOX_MIN_H
    content_span = (n_max - 1) * STACK_PITCH
    # +30 = 10 px arrow offset from row center + 20 px breathing room
    # inside the box so the arrow doesn't sit on the box's outline.
    return max(PROC_BOX_MIN_H, content_span + 30)


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


def _arrowhead(draw, x1, y1, x2, y2, size=12):
    """Filled triangle arrowhead with tip at (x2,y2). Larger than the
    default 8 px so the head reads clearly when Word shrinks the image
    to ~7 inches wide on the page."""
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
    reader can tell which label belongs to which arrow.

    The line is extended 2 px past the endpoint so the arrowhead and the
    target box border visually overlap - otherwise the antialiased pixel
    rounding at the box edge can make the arrow look detached."""
    # Tiny overshoot in the line's travel direction so the arrowhead
    # sits flush against (and slightly overlaps) the target box border.
    dx = x2 - x1
    dy = y2 - y1
    length = max(1.0, math.hypot(dx, dy))
    overshoot = 2.0
    ox = dx / length * overshoot
    oy = dy / length * overshoot
    draw.line((x1, y1, x2 + ox, y2 + oy), fill="black", width=2)
    _arrowhead(draw, x1, y1, x2 + ox, y2 + oy)

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
    # Process box auto-heights so every arrow starts inside it, even
    # when many stores or entities are stacked in this row.
    n_max = max(len(entities), len(stores), 1)
    proc_h = _process_box_height(n_max)
    _process_box(draw, COL_PROC, y_center, proc_num, proc_lines,
                 font, font_bold, h=proc_h)

    n_ent = len(entities)
    if n_ent == 0:
        ent_ys = []
    elif n_ent == 1:
        ent_ys = [y_center]
    else:
        span = STACK_PITCH * (n_ent - 1)
        top = y_center - span / 2
        ent_ys = [top + i * STACK_PITCH for i in range(n_ent)]

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
        span = STACK_PITCH * (n_ds - 1)
        top = y_center - span / 2
        ds_ys = [top + i * STACK_PITCH for i in range(n_ds)]

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


def _row_height(row: dict) -> int:
    """Row height auto-fits the taller of (a) the stacked entities/stores
    plus their label whitespace, or (b) the now-taller process box that
    must enclose every arrow's start point."""
    n_max = max(
        len(row.get("entities", [])),
        len(row.get("stores", [])),
        1,
    )
    # Span needed by the stacked items + their label space.
    content_span = (n_max - 1) * STACK_PITCH + 80
    # Span needed by the auto-sized process box.
    proc_span = _process_box_height(n_max)
    return max(
        ROW_MIN_HEIGHT,
        content_span + ROW_VERTICAL_PADDING * 2,
        proc_span + ROW_VERTICAL_PADDING * 2,
    )


def render_dfd(out_path: Path, title: tuple, rows: list):
    """Render a Level 2 DFD figure to PNG.

    `title` is accepted for backward compatibility but no longer drawn.
    The parent-process title is rendered by the docx builder as a page
    heading so each diagram does not waste vertical space repeating it.

    Layout: each sub-process is rendered as its own row inside a thin
    table-cell-style frame, the way the SOFTNET-style Level 2 reference
    paper does it. Row height auto-fits content so request/response
    arrows never overflow into the next row.

    rows: list of {proc_num, proc_lines, entities, stores} dicts.
    """
    font, font_lbl, font_bold, _unused = _load_fonts()

    row_heights = [_row_height(r) for r in rows]
    total_h = TOP_MARGIN + sum(row_heights) + BOTTOM_MARGIN

    img = Image.new("RGB", (W, total_h), "white")
    draw = ImageDraw.Draw(img)

    # One outer table frame around the whole diagram. Row dividers go
    # INSIDE this frame - drawn between adjacent rows only, not at the
    # top of the first row or the bottom of the last row.
    table_top = TOP_MARGIN
    table_bottom = TOP_MARGIN + sum(row_heights)
    table_left = TABLE_INSET
    table_right = W - TABLE_INSET
    draw.rectangle(
        (table_left, table_top, table_right, table_bottom),
        outline=TABLE_BORDER_COLOR, width=TABLE_BORDER_WIDTH, fill=None,
    )

    y = TOP_MARGIN
    for i, row in enumerate(rows):
        h = row_heights[i]
        # Render the row content first so the divider line sits cleanly
        # underneath without being overdrawn by entity / store boxes.
        _draw_row(
            draw, y + h / 2,
            row["proc_num"], row["proc_lines"],
            row.get("entities", []),
            row.get("stores", []),
            font, font_lbl, font_bold,
        )
        y += h
        # Thin horizontal divider between this row and the next - skip
        # after the last row so we don't double-draw on top of the outer
        # frame's bottom edge.
        if i < len(rows) - 1:
            draw.line(
                (table_left, y, table_right, y),
                fill=ROW_DIVIDER_COLOR, width=ROW_DIVIDER_WIDTH,
            )

    img.save(out_path)
    return out_path
