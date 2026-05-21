"""Build CodeLogic_DFD.docx — Level 0 (landscape) + Level 1 (portrait)."""
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_ORIENT, WD_SECTION

HERE = Path(__file__).parent
OUT = HERE.parent / "CodeLogic_DFD_v3.docx"

doc = Document()

s = doc.sections[0]
nw, nh = s.page_height, s.page_width
s.orientation = WD_ORIENT.LANDSCAPE
s.page_width = nw
s.page_height = nh
s.left_margin = Inches(0.5)
s.right_margin = Inches(0.5)
s.top_margin = Inches(0.5)
s.bottom_margin = Inches(0.5)

style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(11)


def add_figure(image_path: Path, fig_num: int, caption: str, width_in: float):
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run(f"CodeLogic: Data Flow Diagram — Level {fig_num - 1}")
    run.bold = True
    run.font.size = Pt(18)

    doc.add_paragraph()

    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_img.add_run()
    r.add_picture(str(image_path), width=Inches(width_in))

    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = cap.add_run(f"Figure {fig_num} ")
    fr.bold = True
    fr.italic = True
    fr.font.size = Pt(11)
    cr = cap.add_run(caption)
    cr.italic = True
    cr.font.size = Pt(11)


add_figure(
    HERE / "03_dfd_level0.png",
    1,
    "Level 0 Data Flow Diagram (Context Diagram) of the CodeLogic Quiz Platform",
    width_in=10.0,
)

new_section = doc.add_section(WD_SECTION.NEW_PAGE)
nw2, nh2 = new_section.page_height, new_section.page_width
new_section.orientation = WD_ORIENT.PORTRAIT
new_section.page_width = nh2
new_section.page_height = nw2
new_section.left_margin = Inches(0.5)
new_section.right_margin = Inches(0.5)
new_section.top_margin = Inches(0.5)
new_section.bottom_margin = Inches(0.5)

add_figure(
    HERE / "04_dfd_level1.png",
    2,
    "Level 1 Data Flow Diagram: User Auth, Content, Quiz Engine, Progress, Certificates, and Learning Resources",
    width_in=7.5,
)

doc.save(OUT)
print(f"Wrote {OUT}")
