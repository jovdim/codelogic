// Temporary preview route for the certificate template.
// Hit http://localhost:3000/cert-preview while running `npm run dev`
// to see the full cert rendered with sample data.
// Delete this file (and the cert-preview folder) before shipping if you don't
// want it on prod.

import { NextResponse } from "next/server";
import { generateCertificateHTML, getTopicIconForCertificate } from "@/lib/certTemplate";

export async function GET() {
  const html = generateCertificateHTML({
    topicName: "HTML",
    topicId: "html",
    topicIconHtml: getTopicIconForCertificate(null, "#7c3aed"),
    accentColor: "#7c3aed",
    userName: "Kevin Jones R. Ayes",
    completionDateStr: "April 28, 2026",
    certificateId: "CL-DEMO-12345",
    category: "frontend",
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
