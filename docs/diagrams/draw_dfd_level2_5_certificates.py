"""DFD Level 2 - decomposition of Process 5.0 Certificate Management.

Sub-processes derived from game/views.py: UserCertificatesView (list),
the frontend cert template + RenderPdfView (HTML -> PDF via Chrome or
WeasyPrint), and admin_view_certificate (staff preview of any user's
cert).
"""
from pathlib import Path
from _dfd_lib import render_dfd

OUT = Path(__file__).parent / "04_dfd_level2_5_certificates.png"

render_dfd(
    OUT,
    title=("5.0", "Certificate Management"),
    rows=[
        {
            "proc_num": "5.1",
            "proc_lines": ["List Earned", "Certificates"],
            "entities": [
                ("Student", "Certificate List Request",
                 "Completed Topics + Stars + Metadata"),
            ],
            "stores": [
                ("D7", "User Progress",
                 "Find Topics with All Levels Completed",
                 "Progress Rows"),
                ("D10", "Quiz Attempts",
                 "Best Stars per Level + Final Pass Date",
                 "Attempt Rows"),
                ("D12", "Certificates", "Read Certificate Metadata",
                 "Certificate Rows"),
            ],
        },
        {
            "proc_num": "5.2",
            "proc_lines": ["Build Certificate", "HTML"],
            "entities": [
                ("Student", "View / Download Trigger",
                 "Rendered Certificate HTML"),
            ],
            "stores": [
                ("D12", "Certificates", "Read Title / Description / Icon",
                 "Certificate Row"),
                ("D1", "Users", "Read Display Name + Username",
                 "User Row"),
            ],
        },
        {
            "proc_num": "5.3",
            "proc_lines": ["Render PDF", "(Chrome / WeasyPrint)"],
            "entities": [
                ("Student", "HTML Body", "PDF File"),
                ("PDF Engine", "Render Command", "PDF Bytes"),
            ],
            "stores": [
            ],
        },
        {
            "proc_num": "5.4",
            "proc_lines": ["Admin: Preview", "Any User's Cert"],
            "entities": [
                ("Admin", "UserCertificate ID",
                 "Rendered Certificate Page"),
            ],
            "stores": [
                ("D13", "User Certificates",
                 "Lookup by ID + Related User / Topic",
                 "UserCert Row"),
            ],
        },
    ],
)

print(f"Wrote {OUT}")
