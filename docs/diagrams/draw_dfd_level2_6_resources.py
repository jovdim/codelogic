"""DFD Level 2 - decomposition of Process 6.0 Learning Resources.

Sub-processes derived from game/views.py: LearningResourceListView
(search / filter / list), LearningResourceDetailView (view + increment
view counter), and the Django admin CRUD on LearningResource.
"""
from pathlib import Path
from _dfd_lib import render_dfd

OUT = Path(__file__).parent / "04_dfd_level2_6_resources.png"

render_dfd(
    OUT,
    title=("6.0", "Learning Resources"),
    rows=[
        {
            "proc_num": "6.1",
            "proc_lines": ["Browse / Search /", "Filter Resources"],
            "entities": [
                ("Guest", "Search + Category + Language Filters",
                 "Resource List + Filter Options"),
                ("Student", "Search + Category + Language Filters",
                 "Resource List + Filter Options"),
            ],
            "stores": [
                ("D14", "Learning Resources",
                 "Query Active Resources",
                 "Resource Rows + Distinct Categories / Languages"),
            ],
        },
        {
            "proc_num": "6.2",
            "proc_lines": ["View Resource Detail", "(Increment Views)"],
            "entities": [
                ("Student", "Resource Slug",
                 "Resource Detail + PDF Link"),
            ],
            "stores": [
                ("D14", "Learning Resources",
                 "Lookup by Slug + Bump view_count",
                 "Resource Row"),
            ],
        },
        {
            "proc_num": "6.3",
            "proc_lines": ["Admin: Manage", "Resources"],
            "entities": [
                ("Admin", "Upload / Edit / Delete Resource",
                 "Resource Saved"),
            ],
            "stores": [
                ("D14", "Learning Resources",
                 "Insert / Update / Delete",
                 "Resource Row"),
            ],
        },
    ],
)

print(f"Wrote {OUT}")
