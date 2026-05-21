"""Complete branched flowchart for CodeLogic — no connectors, direct arrows."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "01_flowchart_student.png"

W, H = 2400, 1700
img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype("arial.ttf", 20)
    font_bold = ImageFont.truetype("arialbd.ttf", 22)
except Exception:
    font = ImageFont.load_default()
    font_bold = font


def text_centered(cx, cy, text, fnt=None):
    fnt = fnt or font
    tw = draw.textlength(text, font=fnt)
    draw.text((cx - tw / 2, cy - 12), text, fill="black", font=fnt)


def oval(cx, cy, text, w=180, h=70):
    draw.ellipse((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2),
                 outline="black", width=2, fill="white")
    text_centered(cx, cy, text)
    return dict(cx=cx, cy=cy, w=w, h=h)


def rect(cx, cy, text, w=240, h=70):
    draw.rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2),
                   outline="black", width=2, fill="white")
    text_centered(cx, cy, text)
    return dict(cx=cx, cy=cy, w=w, h=h)


def diamond(cx, cy, text, w=240, h=110):
    pts = [(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)]
    draw.polygon(pts, fill="white")
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        draw.line((a[0], a[1], b[0], b[1]), fill="black", width=2)
    text_centered(cx, cy, text)
    return dict(cx=cx, cy=cy, w=w, h=h)


def edge(node, side):
    cx, cy, w, h = node["cx"], node["cy"], node["w"], node["h"]
    if side == "top":    return (cx, cy - h / 2)
    if side == "bottom": return (cx, cy + h / 2)
    if side == "left":   return (cx - w / 2, cy)
    if side == "right":  return (cx + w / 2, cy)


def arrowhead(x1, y1, x2, y2):
    angle = math.atan2(y2 - y1, x2 - x1)
    size = 11
    p1 = (x2 - size * math.cos(angle - math.pi / 7),
          y2 - size * math.sin(angle - math.pi / 7))
    p2 = (x2 - size * math.cos(angle + math.pi / 7),
          y2 - size * math.sin(angle + math.pi / 7))
    draw.polygon([(x2, y2), p1, p2], fill="black")


def polyline(points, head=True):
    for i in range(len(points) - 1):
        a, b = points[i], points[i + 1]
        draw.line((a[0], a[1], b[0], b[1]), fill="black", width=2)
    if head and len(points) >= 2:
        arrowhead(points[-2][0], points[-2][1], points[-1][0], points[-1][1])


def line_label(x, y, text):
    tw = draw.textlength(text, font=font_bold)
    draw.rectangle((x - tw / 2 - 5, y - 13, x + tw / 2 + 5, y + 13), fill="white")
    text_centered(x, y, text, fnt=font_bold)


CX_TOP = 1200

n_start = oval(CX_TOP, 70, "Start")
n_login = rect(CX_TOP, 200, "Login")
n_ifstu = diamond(CX_TOP, 380, "if Student?")
n_ifadm = diamond(CX_TOP, 580, "if Admin?")

polyline([edge(n_start, "bottom"), edge(n_login, "top")])
polyline([edge(n_login, "bottom"), edge(n_ifstu, "top")])
polyline([edge(n_ifstu, "bottom"), edge(n_ifadm, "top")])
line_label(CX_TOP + 18, 470, "No")

XA = 650
XB = 1750

n_dash  = rect(XA, 830, "Student Dashboard", w=280)
n_adash = rect(XB, 830, "Admin Dashboard",   w=280)

stu_left = edge(n_ifstu, "left")
polyline([stu_left, (XA, stu_left[1]), edge(n_dash, "top")])
line_label(stu_left[0] - 30, stu_left[1] - 16, "Yes")

adm_bot = edge(n_ifadm, "bottom")
polyline([adm_bot, (adm_bot[0], 680), (XB, 680), edge(n_adash, "top")])
line_label(CX_TOP + 20, 650, "Yes")

login_right = edge(n_login, "right")
adm_right = edge(n_ifadm, "right")
polyline([
    adm_right,
    (1500, adm_right[1]),
    (1500, login_right[1]),
    (login_right[0], login_right[1]),
])
line_label(adm_right[0] + 32, adm_right[1] - 16, "No")

STU_X = [XA - 360, XA - 120, XA + 120, XA + 360]
ROW_BR = 1000

n_s_logout = rect(STU_X[0], ROW_BR, "Logout",            w=210)
n_s_cert   = rect(STU_X[1], ROW_BR, "My Certificates",   w=210)
n_s_quiz   = rect(STU_X[2], ROW_BR, "Take Quiz",         w=210)
n_s_browse = rect(STU_X[3], ROW_BR, "Browse Resources",  w=220)

dash_bot = edge(n_dash, "bottom")
busline_y = 945
draw.line((STU_X[0], busline_y, STU_X[3], busline_y), fill="black", width=2)
draw.line((dash_bot[0], dash_bot[1], dash_bot[0], busline_y), fill="black", width=2)
for n in (n_s_logout, n_s_cert, n_s_quiz, n_s_browse):
    top = edge(n, "top")
    polyline([(top[0], busline_y), top])

n_s_end = oval(STU_X[0], 1120, "End")
polyline([edge(n_s_logout, "bottom"), edge(n_s_end, "top")])

n_s_dlc = rect(STU_X[1], 1120, "Download Certificate", w=240)
polyline([edge(n_s_cert, "bottom"), edge(n_s_dlc, "top")])

n_s_topic  = rect(STU_X[2], 1120, "Select Topic",        w=210)
n_s_level  = rect(STU_X[2], 1230, "Select Level",        w=210)
n_s_ans    = rect(STU_X[2], 1340, "Answer 10 Questions", w=260)
n_s_result = rect(STU_X[2], 1450, "Quiz Result",         w=210)
polyline([edge(n_s_quiz,  "bottom"), edge(n_s_topic, "top")])
polyline([edge(n_s_topic, "bottom"), edge(n_s_level, "top")])
polyline([edge(n_s_level, "bottom"), edge(n_s_ans,   "top")])
polyline([edge(n_s_ans,   "bottom"), edge(n_s_result,"top")])

n_s_view = rect(STU_X[3], 1120, "View Resource", w=220)
n_s_dlp  = rect(STU_X[3], 1230, "Download PDF",  w=220)
polyline([edge(n_s_browse,"bottom"), edge(n_s_view,"top")])
polyline([edge(n_s_view,  "bottom"), edge(n_s_dlp, "top")])

ADM_X = [XB - 360, XB - 120, XB + 120, XB + 360]

n_a_logout   = rect(ADM_X[0], ROW_BR, "Logout",               w=210)
n_a_users    = rect(ADM_X[1], ROW_BR, "View All Users",       w=230)
n_a_content  = rect(ADM_X[2], ROW_BR, "Manage Quiz Content",  w=270)
n_a_attempts = rect(ADM_X[3], ROW_BR, "View Quiz Attempts",   w=260)

adash_bot = edge(n_adash, "bottom")
draw.line((ADM_X[0], busline_y, ADM_X[3], busline_y), fill="black", width=2)
draw.line((adash_bot[0], adash_bot[1], adash_bot[0], busline_y), fill="black", width=2)
for n in (n_a_logout, n_a_users, n_a_content, n_a_attempts):
    top = edge(n, "top")
    polyline([(top[0], busline_y), top])

n_a_end = oval(ADM_X[0], 1120, "End")
polyline([edge(n_a_logout, "bottom"), edge(n_a_end, "top")])

n_a_seluser = rect(ADM_X[1], 1120, "Select User",          w=220)
n_a_detuser = rect(ADM_X[1], 1230, "View User Details",    w=240)
n_a_toggle  = rect(ADM_X[1], 1340, "Activate / Deactivate",w=260)
polyline([edge(n_a_users,  "bottom"), edge(n_a_seluser,"top")])
polyline([edge(n_a_seluser,"bottom"), edge(n_a_detuser,"top")])
polyline([edge(n_a_detuser,"bottom"), edge(n_a_toggle, "top")])

n_a_seltopic = rect(ADM_X[2], 1120, "Select Topic",  w=220)
n_a_editq    = rect(ADM_X[2], 1230, "Edit Question", w=220)
n_a_save     = rect(ADM_X[2], 1340, "Save Changes",  w=220)
polyline([edge(n_a_content, "bottom"), edge(n_a_seltopic,"top")])
polyline([edge(n_a_seltopic,"bottom"), edge(n_a_editq,   "top")])
polyline([edge(n_a_editq,   "bottom"), edge(n_a_save,    "top")])

n_a_filter = rect(ADM_X[3], 1120, "Search / Filter",       w=220)
n_a_attdet = rect(ADM_X[3], 1230, "View Attempt Details",  w=260)
polyline([edge(n_a_attempts,"bottom"), edge(n_a_filter, "top")])
polyline([edge(n_a_filter,  "bottom"), edge(n_a_attdet, "top")])

img.save(OUT)
print(f"Wrote {OUT}")
