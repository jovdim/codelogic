/**
 * Generate a real .pdf file the user actually downloads.
 *
 * Primary path: POST the cert HTML to the backend, which renders it through
 * WeasyPrint and streams the PDF bytes back. We then trigger an automatic
 * download via blob+anchor - no print dialog, no extra clicks.
 *
 * Fallback path: if the backend route is unavailable (e.g. local dev on
 * Windows without GTK installed for WeasyPrint), open the cert in a popup
 * and let the browser's print dialog handle "Save as PDF". The user has to
 * pick the destination once but still gets a perfect vector PDF.
 */

import api from "./api";

export async function downloadCertAsPdf(certHtml: string, filename: string): Promise<void> {
  // Strip path-unsafe characters from the suggested filename.
  const safeFilename = filename.replace(/[^A-Za-z0-9._-]+/g, "-");

  try {
    const response = await api.post(
      `/game/cert/render-pdf/?filename=${encodeURIComponent(safeFilename)}`,
      certHtml,
      {
        headers: { "Content-Type": "text/html" },
        responseType: "blob",
        // Don't fail the promise on a non-2xx so we can fall back gracefully.
        validateStatus: () => true,
      },
    );

    if (response.status === 200 && response.data instanceof Blob && response.data.size > 0) {
      triggerBlobDownload(response.data, safeFilename);
      return;
    }

    // Server replied but couldn't generate (e.g. weasyprint missing in dev).
    console.warn("Server PDF render failed, status:", response.status, "- falling back to print dialog.");
  } catch (err) {
    console.warn("Server PDF render errored, falling back to print dialog.", err);
  }

  // Fallback: print-dialog flow.
  fallbackPrintDialog(certHtml);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Free the blob shortly after the click.
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

function fallbackPrintDialog(certHtml: string): void {
  const augmented = certHtml.replace(
    "</body>",
    `<script>
       window.addEventListener('load', function () {
         var go = function () { setTimeout(function () { window.print(); }, 300); };
         if (document.fonts && document.fonts.ready) {
           document.fonts.ready.then(go);
         } else {
           go();
         }
       });
     </script>
     </body>`,
  );

  const blob = new Blob([augmented], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, "_blank", "width=1200,height=850");
  if (!popup) {
    URL.revokeObjectURL(url);
    throw new Error("Pop-up was blocked - allow pop-ups for this site and try again.");
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
