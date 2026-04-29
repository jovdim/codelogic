"use client";

/**
 * Dev-only certificate preview + PDF download tester.
 *
 * Hit http://localhost:3000/cert-preview - lets you see the cert HTML in a
 * new tab and test the real .pdf download flow without having to play through
 * a whole topic to earn a cert. Delete this folder before shipping if you
 * don't want it on prod.
 */

import { useState } from "react";
import {
  generateCertificateHTML,
  getTopicIconForCertificate,
} from "@/lib/certTemplate";
import { downloadCertAsPdf } from "@/lib/certPdf";

const SAMPLE_CATEGORIES = ["frontend", "backend", "data", "mobile", "ai"];

export default function CertPreviewPage() {
  const [category, setCategory] = useState("frontend");
  const [downloading, setDownloading] = useState(false);

  const buildHtml = () =>
    generateCertificateHTML({
      topicName: "HTML",
      topicId: "html",
      topicIconHtml: getTopicIconForCertificate(null, "#7c3aed"),
      accentColor: "#7c3aed",
      userName: "Kevin Jones R. Ayes",
      completionDateStr: "April 28, 2026",
      certificateId: "CL-DEMO-12345",
      category,
    });

  const viewHtml = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(buildHtml());
      win.document.close();
    }
  };

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadCertAsPdf(buildHtml(), "Certificate-HTML-demo.pdf");
    } catch (err) {
      console.error(err);
      alert("PDF generation failed - check the console.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Certificate Preview Tester</h1>
        <p className="text-gray-400 text-sm mb-6">
          Dev-only. Verifies the cert HTML and the real PDF download pipeline
          without needing an earned cert.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Category (changes the skill pills)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#1a1a2e] border border-[#2d2d44] rounded px-3 py-2 text-sm"
          >
            {SAMPLE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={viewHtml}
            className="px-5 py-2.5 rounded bg-[#1a1a2e] border border-[#2d2d44] text-sm font-semibold hover:bg-[#252540]"
          >
            View HTML in new tab
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="px-5 py-2.5 rounded text-sm font-semibold disabled:opacity-60 disabled:cursor-wait"
            style={{ background: "var(--gradient-purple)" }}
          >
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          On click, the PDF should land in your Downloads folder as
          <code className="bg-[#1a1a2e] px-1 mx-1 rounded">
            Certificate-HTML-demo.pdf
          </code>
          .
        </p>
      </div>
    </div>
  );
}
