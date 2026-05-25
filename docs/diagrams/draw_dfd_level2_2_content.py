"""DFD Level 2 - decomposition of Process 2.0 Content Catalog.

Sub-processes are derived from game/views.py: CategoryListView,
CategoryDetailView, TopicDetailView, plus the Django admin CRUD on
Category, Topic, Question, and Lesson models registered in game/admin.py.
"""
from pathlib import Path
from _dfd_lib import render_dfd

OUT = Path(__file__).parent / "04_dfd_level2_2_content.png"

render_dfd(
    OUT,
    title=("2.0", "Content Catalog"),
    rows=[
        {
            "proc_num": "2.1",
            "proc_lines": ["List Categories"],
            "entities": [
                ("Guest", "Category List Request", "Categories + Topic Counts"),
                ("Student", "Category List Request", "Categories + Topic Counts"),
            ],
            "stores": [
                ("D3", "Categories", "Read Active Categories", "Category Rows"),
                ("D6", "Topics", "Aggregate Topic / Question Counts", "Topic Rows"),
            ],
        },
        {
            "proc_num": "2.2",
            "proc_lines": ["View Category", "Detail"],
            "entities": [
                ("Guest", "Category Slug", "Category + Topic List"),
                ("Student", "Category Slug", "Category + Topic List"),
            ],
            "stores": [
                ("D3", "Categories", "Lookup by Slug", "Category Row"),
                ("D6", "Topics", "List Topics in Category", "Topic + XP Totals"),
            ],
        },
        {
            "proc_num": "2.3",
            "proc_lines": ["View Topic Detail", "with Progress"],
            "entities": [
                ("Guest", "Category + Topic Slug", "Topic Details"),
                ("Student", "Category + Topic Slug", "Topic + User Progress"),
            ],
            "stores": [
                ("D6", "Topics", "Lookup by Slug", "Topic Row"),
                ("D7", "User Progress", "Read User Progress", "Progress Row"),
            ],
        },
        {
            "proc_num": "2.4",
            "proc_lines": ["Admin: Manage", "Categories"],
            "entities": [
                ("Admin", "Add / Edit / Delete Category", "Category Saved"),
            ],
            "stores": [
                ("D3", "Categories", "Insert / Update / Delete", "Category Row"),
            ],
        },
        {
            "proc_num": "2.5",
            "proc_lines": ["Admin: Manage", "Topics"],
            "entities": [
                ("Admin", "Add / Edit / Delete Topic", "Topic Saved"),
            ],
            "stores": [
                ("D6", "Topics", "Insert / Update / Delete", "Topic Row"),
                ("D3", "Categories", "Resolve Parent Category", "Category Row"),
            ],
        },
        {
            "proc_num": "2.6",
            "proc_lines": ["Admin: Manage", "Questions & Lessons"],
            "entities": [
                ("Admin", "Add / Edit / Delete Question", "Question Saved"),
                ("Admin", "Add / Edit / Delete Lesson", "Lesson Saved"),
            ],
            "stores": [
                ("D8", "Questions", "Insert / Update / Delete", "Question Row"),
                ("D9", "Lessons", "Insert / Update / Delete", "Lesson Row"),
            ],
        },
    ],
)

print(f"Wrote {OUT}")
