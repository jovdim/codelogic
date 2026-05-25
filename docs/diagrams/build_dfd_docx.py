"""Build CodeLogic_DFD.docx - full DFD set (Level 0, Level 1, Level 2 x6)."""
from pathlib import Path
from PIL import Image as PILImage
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_ORIENT, WD_SECTION

HERE = Path(__file__).parent
OUT = HERE.parent / "CodeLogic_DFD_v3.docx"

doc = Document()

# ---------------------------------------------------------------------------
# Whole document is portrait. The Level 0 context diagram (aspect 0.65)
# fits comfortably at 7.5" wide x 4.88" tall, so no landscape page break
# is needed.
# ---------------------------------------------------------------------------
s = doc.sections[0]
s.orientation = WD_ORIENT.PORTRAIT
s.left_margin = Inches(0.5)
s.right_margin = Inches(0.5)
s.top_margin = Inches(0.5)
s.bottom_margin = Inches(0.5)

style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(11)


def _heading(text: str, size_pt: int = 18, keep_with_next: bool = False):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if keep_with_next:
        # Glue heading to the image paragraph below so Word can't strand
        # the heading on an otherwise-empty page when the image is tall.
        p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(size_pt)


def _fit_image(image_path: Path, max_w_in: float, max_h_in: float):
    """Return (width_in, height_in) that fits the image within the given
    page area while preserving aspect ratio. Width is the primary limit;
    height kicks in only when the image is taller than the box allows."""
    with PILImage.open(image_path) as im:
        w_px, h_px = im.size
    aspect = h_px / w_px
    # First try width-constrained.
    width_in = max_w_in
    height_in = width_in * aspect
    if height_in > max_h_in:
        # Image is too tall for the box - constrain by height instead.
        height_in = max_h_in
        width_in = height_in / aspect
    return width_in, height_in


def _figure(image_path: Path, fig_num: int, caption: str,
            max_w_in: float, max_h_in: float):
    """Insert an image figure that always fits the available page area.

    max_w_in / max_h_in describe the usable box on the page AFTER the
    headings and caption have taken their share - so the image cannot
    overflow onto a blank next page.
    """
    width_in, height_in = _fit_image(image_path, max_w_in, max_h_in)

    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    # Glue the image to the caption that follows so they always stay on
    # the same page.
    p_img.paragraph_format.keep_with_next = True
    r = p_img.add_run()
    r.add_picture(str(image_path), width=Inches(width_in),
                  height=Inches(height_in))

    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = cap.add_run(f"Figure {fig_num}. ")
    fr.bold = True
    fr.italic = True
    fr.font.size = Pt(10)
    cr = cap.add_run(caption)
    cr.italic = True
    cr.font.size = Pt(10)


def _portrait_section():
    """Append a new portrait section so subsequent figures get the
    taller page format the Level 1 / Level 2 diagrams need."""
    sec = doc.add_section(WD_SECTION.NEW_PAGE)
    nw2, nh2 = sec.page_height, sec.page_width
    sec.orientation = WD_ORIENT.PORTRAIT
    sec.page_width = nh2
    sec.page_height = nw2
    sec.left_margin = Inches(0.5)
    sec.right_margin = Inches(0.5)
    sec.top_margin = Inches(0.5)
    sec.bottom_margin = Inches(0.5)


def _page_break():
    p = doc.add_paragraph()
    r = p.add_run()
    r.add_break(WD_BREAK.PAGE)


# Page-area budgets. US Letter at 0.5" margins gives 7.5" x 10" usable.
# Two headings (18 pt + 13 pt with paragraph spacing) plus the figure
# caption end up taking close to 2.2 inches in practice (not the 1.4 in
# I previously estimated), so we have to leave that much room or the
# bottom of the image gets pushed past the page break.
PORTRAIT_MAX_W = 7.5
PORTRAIT_MAX_H = 8.4     # 10.0 usable - ~1.6 for single heading + caption
LANDSCAPE_MAX_W = 10.0
LANDSCAPE_MAX_H = 5.9    # 7.5 usable - ~1.6 for heading + caption

# ---------------------------------------------------------------------------
# Figure 1: Level 0 (context diagram)
# ---------------------------------------------------------------------------
_heading("CodeLogic: Data Flow Diagram - Level 0", keep_with_next=True)
_figure(
    HERE / "03_dfd_level0.png",
    1,
    "Level 0 (Context) DFD of the CodeLogic Quiz Platform, showing the "
    "system as a single process with its five external entities and the "
    "main data flows between them.",
    max_w_in=PORTRAIT_MAX_W, max_h_in=PORTRAIT_MAX_H,
)

# ---------------------------------------------------------------------------
# Figure 2: Level 1 (system decomposition)
# ---------------------------------------------------------------------------
_page_break()
_heading("CodeLogic: Data Flow Diagram - Level 1", keep_with_next=True)
_figure(
    HERE / "04_dfd_level1.png",
    2,
    "Level 1 DFD breaking the system into its six main processes and "
    "the data stores each one uses.",
    max_w_in=PORTRAIT_MAX_W, max_h_in=PORTRAIT_MAX_H,
)

# ---------------------------------------------------------------------------
# Figures 3-8: Level 2 decompositions, one per Level 1 process.
# Each lives on its own page so a reader can study the sub-process layout
# without scrolling between two figures at once.
# ---------------------------------------------------------------------------
LEVEL2_FIGURES = [
    (
        "04_dfd_level2_1_auth.png",
        "Process 1.0 - User & Auth Management",
        "Level 2 DFD of Process 1.0, showing the sub-processes for "
        "sign up, email verification, login with lockout, password "
        "reset, logout, profile updates, and login-face capture.",
    ),
    (
        "04_dfd_level2_2_content.png",
        "Process 2.0 - Content Catalog",
        "Level 2 DFD of Process 2.0, showing how guests and students "
        "browse categories and topics, and how admins manage the "
        "course content.",
    ),
    (
        "04_dfd_level2_3_quiz.png",
        "Process 3.0 - Quiz Engine",
        "Level 2 DFD of Process 3.0, showing the four steps of one "
        "quiz: start the attempt, score each answer, handle the "
        "30-second timeout, and complete the quiz.",
    ),
    (
        "04_dfd_level2_4_progress.png",
        "Process 4.0 - Progress & Gamification",
        "Level 2 DFD of Process 4.0, showing how hearts regenerate, "
        "how XP and streaks are updated after a quiz, and the read-only "
        "stats and leaderboard screens.",
    ),
    (
        "04_dfd_level2_5_certificates.png",
        "Process 5.0 - Certificate Management",
        "Level 2 DFD of Process 5.0, showing how earned certificates "
        "are listed, built as HTML, rendered to PDF, and previewed by "
        "admins.",
    ),
    (
        "04_dfd_level2_6_resources.png",
        "Process 6.0 - Learning Resources",
        "Level 2 DFD of Process 6.0, showing how students search and "
        "view learning resources and how admins upload and edit them.",
    ),
]

for i, (filename, parent_label, caption) in enumerate(LEVEL2_FIGURES, start=3):
    _page_break()
    # Single combined heading instead of two stacked headings - frees up
    # ~0.5" of vertical page space so the diagram can render larger
    # without the bottom getting clipped at the page break.
    _heading(f"Level 2 DFD - {parent_label}", size_pt=16,
             keep_with_next=True)
    _figure(HERE / filename, i, caption,
            max_w_in=PORTRAIT_MAX_W, max_h_in=PORTRAIT_MAX_H)


doc.save(OUT)
print(f"Wrote {OUT}")
