"""ERD for CodeLogic - plain tables, crow's-foot cardinality, orthogonal routing."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "05_erd.png"

W, H = 1700, 2100
img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)

try:
    font        = ImageFont.truetype("arial.ttf",   13)
    font_bold   = ImageFont.truetype("arialbd.ttf", 15)
    font_marker = ImageFont.truetype("arialbd.ttf", 11)
except Exception:
    font = ImageFont.load_default()
    font_bold = font
    font_marker = font

ROW_H = 22
HEADER_H = 30
MARKER_OFFSET = 14
FOOT_SPREAD = 6


def textw(t, fnt):
    return draw.textlength(t, font=fnt)


def draw_table(x, y, name, fields, w=290):
    h = HEADER_H + len(fields) * ROW_H
    draw.rectangle((x, y, x + w, y + h), outline="black", width=2, fill="white")
    draw.line((x, y + HEADER_H, x + w, y + HEADER_H), fill="black", width=2)
    draw.text((x + 10, y + 6), name, fill="black", font=font_bold)

    marker_col = 38
    draw.line((x + marker_col, y + HEADER_H, x + marker_col, y + h),
              fill="black", width=1)

    field_ys = {}
    for i, (marker, fname) in enumerate(fields):
        row_y = y + HEADER_H + i * ROW_H
        field_ys[fname] = row_y + ROW_H / 2
        if i > 0:
            draw.line((x + 1, row_y, x + w - 1, row_y),
                      fill=(200, 200, 200), width=1)
        if marker:
            mw = textw(marker, font_marker)
            draw.text((x + (marker_col - mw) / 2, row_y + 4),
                      marker, fill="black", font=font_marker)
        draw.text((x + marker_col + 8, row_y + 3), fname,
                  fill="black", font=font)
    return dict(x=x, y=y, w=w, h=h, name=name, field_ys=field_ys)


def crow_foot(edge_x, edge_y, opens):
    """3 toes at the entity edge converging at a point on the relationship line.
       opens: direction from the edge toward the convergence point (into the line)."""
    L = MARKER_OFFSET
    sp = FOOT_SPREAD
    if opens == "right":
        conv_x = edge_x + L
        draw.line((edge_x, edge_y - sp, conv_x, edge_y), fill="black", width=2)
        draw.line((edge_x, edge_y,      conv_x, edge_y), fill="black", width=2)
        draw.line((edge_x, edge_y + sp, conv_x, edge_y), fill="black", width=2)
    elif opens == "left":
        conv_x = edge_x - L
        draw.line((edge_x, edge_y - sp, conv_x, edge_y), fill="black", width=2)
        draw.line((edge_x, edge_y,      conv_x, edge_y), fill="black", width=2)
        draw.line((edge_x, edge_y + sp, conv_x, edge_y), fill="black", width=2)
    elif opens == "down":
        conv_y = edge_y + L
        draw.line((edge_x - sp, edge_y, edge_x, conv_y), fill="black", width=2)
        draw.line((edge_x,      edge_y, edge_x, conv_y), fill="black", width=2)
        draw.line((edge_x + sp, edge_y, edge_x, conv_y), fill="black", width=2)
    elif opens == "up":
        conv_y = edge_y - L
        draw.line((edge_x - sp, edge_y, edge_x, conv_y), fill="black", width=2)
        draw.line((edge_x,      edge_y, edge_x, conv_y), fill="black", width=2)
        draw.line((edge_x + sp, edge_y, edge_x, conv_y), fill="black", width=2)


def one_bar(x, y, axis):
    size = 6
    if axis == "h":
        draw.line((x, y - size, x, y + size), fill="black", width=2)
    else:
        draw.line((x - size, y, x + size, y), fill="black", width=2)


def draw_marker(edge_x, edge_y, card, opens):
    if card == "one":
        bar_offset = 10
        if opens == "right":
            one_bar(edge_x + bar_offset, edge_y, "h")
        elif opens == "left":
            one_bar(edge_x - bar_offset, edge_y, "h")
        elif opens == "down":
            one_bar(edge_x, edge_y + bar_offset, "v")
        elif opens == "up":
            one_bar(edge_x, edge_y - bar_offset, "v")
    else:
        crow_foot(edge_x, edge_y, opens)


def relate_h(t1, f1, c1, t2, f2, c2, bend_x):
    if t1["x"] < t2["x"]:
        x1 = t1["x"] + t1["w"]
        x2 = t2["x"]
        t1_opens, t2_opens = "right", "left"
    else:
        x1 = t1["x"]
        x2 = t2["x"] + t2["w"]
        t1_opens, t2_opens = "left", "right"

    y1 = t1["field_ys"][f1]
    y2 = t2["field_ys"][f2]

    draw.line((x1, y1, bend_x, y1), fill="black", width=1)
    draw.line((bend_x, y1, bend_x, y2), fill="black", width=1)
    draw.line((bend_x, y2, x2, y2), fill="black", width=1)

    draw_marker(x1, y1, c1, t1_opens)
    draw_marker(x2, y2, c2, t2_opens)


def relate_v_center(t1, f1, c1, t2, f2, c2):
    x1 = t1["x"] + t1["w"] / 2
    y1 = t1["y"] + t1["h"]
    x2 = t2["x"] + t2["w"] / 2
    y2 = t2["y"]
    if x1 == x2:
        draw.line((x1, y1, x2, y2), fill="black", width=1)
    else:
        mid = (y1 + y2) / 2
        draw.line((x1, y1, x1, mid), fill="black", width=1)
        draw.line((x1, mid, x2, mid), fill="black", width=1)
        draw.line((x2, mid, x2, y2), fill="black", width=1)

    draw_marker(x1, y1, c1, "down")
    draw_marker(x2, y2, c2, "up")


def relate_side(t1, f1, c1, t2, f2, c2, side, gutter):
    y1 = t1["field_ys"][f1]
    y2 = t2["field_ys"][f2]
    if side == "right":
        x1 = t1["x"] + t1["w"]
        x2 = t2["x"] + t2["w"]
        draw.line((x1, y1, gutter, y1), fill="black", width=1)
        draw.line((gutter, y1, gutter, y2), fill="black", width=1)
        draw.line((gutter, y2, x2, y2), fill="black", width=1)
        draw_marker(x1, y1, c1, "right")
        draw_marker(x2, y2, c2, "right")
    else:
        x1 = t1["x"]
        x2 = t2["x"]
        draw.line((x1, y1, gutter, y1), fill="black", width=1)
        draw.line((gutter, y1, gutter, y2), fill="black", width=1)
        draw.line((gutter, y2, x2, y2), fill="black", width=1)
        draw_marker(x1, y1, c1, "left")
        draw_marker(x2, y2, c2, "left")


users = draw_table(70, 80, "users", [
    ("PK", "id"),
    ("",   "email"),
    ("",   "username"),
    ("",   "password"),
    ("",   "display_name"),
    ("",   "last_display_name_change"),
    ("",   "avatar"),
    ("",   "bio"),
    ("",   "is_active"),
    ("",   "is_staff"),
    ("",   "is_email_verified"),
    ("",   "failed_login_attempts"),
    ("",   "date_joined"),
    ("",   "last_active"),
    ("",   "xp"),
    ("",   "level"),
    ("",   "max_hearts"),
    ("",   "current_hearts"),
    ("",   "last_heart_update"),
    ("",   "current_streak"),
    ("",   "longest_streak"),
    ("",   "last_activity_date"),
], w=290)

learning_resources = draw_table(70, 720, "learning_resources", [
    ("PK", "id"),
    ("",   "title"),
    ("",   "slug"),
    ("",   "description"),
    ("",   "category"),
    ("",   "language"),
    ("",   "difficulty"),
    ("",   "pdf_file"),
    ("",   "thumbnail"),
    ("",   "pages"),
    ("",   "read_time"),
    ("",   "views"),
    ("",   "is_active"),
    ("",   "is_featured"),
    ("",   "created_at"),
    ("",   "updated_at"),
], w=290)

email_tokens = draw_table(560, 80, "email_verification_tokens", [
    ("PK", "id"),
    ("FK", "user_id"),
    ("",   "token"),
    ("",   "created_at"),
    ("",   "expires_at"),
    ("",   "is_used"),
], w=290)

reset_tokens = draw_table(560, 300, "password_reset_tokens", [
    ("PK", "id"),
    ("FK", "user_id"),
    ("",   "token"),
    ("",   "created_at"),
    ("",   "expires_at"),
    ("",   "is_used"),
], w=290)

user_progress = draw_table(560, 520, "user_progress", [
    ("PK", "id"),
    ("FK", "user_id"),
    ("FK", "topic_id"),
    ("",   "current_level"),
    ("",   "highest_level_completed"),
    ("",   "total_xp_earned"),
    ("",   "total_questions_answered"),
    ("",   "correct_answers"),
    ("",   "last_played"),
], w=290)

quiz_attempts = draw_table(560, 820, "quiz_attempts", [
    ("PK", "id"),
    ("FK", "user_id"),
    ("FK", "topic_id"),
    ("",   "level"),
    ("",   "score"),
    ("",   "total_questions"),
    ("",   "stars"),
    ("",   "xp_earned"),
    ("",   "hearts_lost"),
    ("",   "completed"),
    ("",   "passed"),
    ("",   "started_at"),
    ("",   "completed_at"),
], w=290)

user_answers = draw_table(560, 1220, "user_answers", [
    ("PK", "id"),
    ("FK", "attempt_id"),
    ("FK", "question_id"),
    ("",   "selected_answer"),
    ("",   "is_correct"),
    ("",   "answered_at"),
], w=290)

user_certs = draw_table(560, 1450, "user_certificates", [
    ("PK", "id"),
    ("FK", "user_id"),
    ("FK", "certificate_id"),
    ("",   "total_stars"),
    ("",   "total_xp_earned"),
    ("",   "completion_date"),
    ("",   "certificate_code"),
], w=290)

categories = draw_table(1050, 80, "categories", [
    ("PK", "id"),
    ("",   "name"),
    ("",   "slug"),
    ("",   "description"),
    ("",   "icon_file"),
    ("",   "color"),
    ("",   "order"),
    ("",   "is_active"),
], w=290)

topics = draw_table(1050, 360, "topics", [
    ("PK", "id"),
    ("FK", "category_id"),
    ("",   "name"),
    ("",   "slug"),
    ("",   "description"),
    ("",   "icon_file"),
    ("",   "order"),
    ("",   "total_levels"),
    ("",   "is_active"),
], w=290)

questions = draw_table(1050, 670, "questions", [
    ("PK", "id"),
    ("FK", "topic_id"),
    ("",   "level"),
    ("",   "question_type"),
    ("",   "question_text"),
    ("",   "code_snippet"),
    ("",   "options"),
    ("",   "correct_answer"),
    ("",   "explanation"),
    ("",   "highlight_line"),
    ("",   "xp_reward"),
    ("",   "order"),
    ("",   "is_active"),
], w=290)

lessons = draw_table(1050, 1080, "lessons", [
    ("PK", "id"),
    ("FK", "topic_id"),
    ("",   "level"),
    ("",   "title"),
    ("",   "content"),
    ("",   "code_example"),
    ("",   "tip"),
    ("",   "order"),
    ("",   "is_active"),
], w=290)

certificates = draw_table(1050, 1400, "certificates", [
    ("PK", "id"),
    ("FK", "topic_id"),
    ("",   "title"),
    ("",   "description"),
    ("",   "icon_file"),
    ("",   "created_at"),
    ("",   "updated_at"),
], w=290)

relate_h(users, "id", "one", email_tokens, "user_id", "many", bend_x=410)
relate_h(users, "id", "one", reset_tokens, "user_id", "many", bend_x=430)
relate_h(users, "id", "one", user_progress, "user_id", "many", bend_x=450)
relate_h(users, "id", "one", quiz_attempts, "user_id", "many", bend_x=470)
relate_h(users, "id", "one", user_certs,    "user_id", "many", bend_x=490)

relate_h(user_progress, "topic_id", "many", topics, "id", "one", bend_x=920)
relate_h(quiz_attempts, "topic_id", "many", topics, "id", "one", bend_x=940)
relate_h(user_answers,  "question_id", "many", questions, "id", "one", bend_x=960)
relate_h(user_certs,    "certificate_id", "many", certificates, "id", "one", bend_x=980)

relate_side(quiz_attempts, "id", "one", user_answers, "attempt_id", "many",
            side="left", gutter=525)

relate_v_center(categories, "id", "one", topics, "category_id", "many")
relate_v_center(topics, "id", "one", questions, "topic_id", "many")
relate_side(topics, "id", "one", lessons, "topic_id", "many",
            side="right", gutter=1380)
relate_side(topics, "id", "one", certificates, "topic_id", "one",
            side="right", gutter=1410)

img.save(OUT)
print(f"Wrote {OUT}")
