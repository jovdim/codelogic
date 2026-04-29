export interface CertData {
  topicName: string;
  topicId: string;
  topicIconHtml: string;
  accentColor: string;
  userName: string;
  completionDateStr: string;
  certificateId: string;
  category?: string;
  certificateTitle?: string;
  certificateDescription?: string;
}

// Shared function to get topic icon HTML for certificates
export function getTopicIconForCertificate(
  iconUrl: string | null,
  color: string,
): string {
  if (iconUrl) {
    return `<img src="${iconUrl}" width="44" height="44" style="object-fit: contain;" />`;
  }
  // Fallback to default code icon - white on the dark cert background.
  return `<svg viewBox="0 0 48 48" width="44" height="44"><path fill="${color}" d="M14 16l-8 8 8 8 2.8-2.8L11.6 24l5.2-5.2L14 16zm20 0l8 8-8 8-2.8-2.8 5.2-5.2-5.2-5.2L34 16zM20 36l4-24h4l-4 24h-4z"/></svg>`;
}

// Inline SVG of the CodeLogic mascot logo. Embedded directly because the
// certificate renders in an about:blank popup where /public assets aren't
// resolvable.
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 580" fill="none" width="72" height="70">
  <path d="M108 220 C100 220 85 45 160 38 C235 45 220 220 212 220" fill="#7c3aed" stroke="#5b21b6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M388 220 C380 220 365 45 440 38 C515 45 500 220 492 220" fill="#7c3aed" stroke="#5b21b6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M128 200 C128 200 118 80 160 72 C202 80 192 200 192 200" fill="#6d28d9"/>
  <path d="M408 200 C408 200 398 80 440 72 C482 80 472 200 472 200" fill="#6d28d9"/>
  <rect x="30" y="170" width="540" height="385" rx="160" fill="#7c3aed" stroke="#5b21b6" stroke-width="12"/>
  <rect x="72" y="206" width="456" height="310" rx="130" fill="#8b5cf6"/>
  <ellipse cx="216" cy="326" rx="50" ry="60" fill="#0f0f1a"/>
  <ellipse cx="198" cy="308" rx="14" ry="18" fill="white" opacity="0.85"/>
  <ellipse cx="384" cy="326" rx="50" ry="60" fill="#0f0f1a"/>
  <ellipse cx="366" cy="308" rx="14" ry="18" fill="white" opacity="0.85"/>
  <text x="300" y="468" text-anchor="middle" font-family="'Courier New', monospace" font-weight="bold" font-size="56" fill="white">&lt;/&gt;</text>
</svg>
`.trim();

/**
 * Skill pill set for the cert footer. Generic by category - we don't surface
 * student-specific stats (no scores, stars, XP), just the broad areas the
 * course covered. If category isn't recognised we fall back to a neutral set.
 */
function skillsForCategory(category: string | undefined, topicName: string): string[] {
  const c = (category || "").toLowerCase();
  if (c.includes("front")) return ["HTML", "CSS", "JavaScript", "Responsive Design", "Accessibility"];
  if (c.includes("back")) return ["APIs", "Databases", "Authentication", "Server Logic", "Security"];
  if (c.includes("data")) return ["Data Structures", "Algorithms", "Analysis", "Visualisation", "Problem Solving"];
  if (c.includes("mobile")) return ["UI Components", "State Management", "Navigation", "Native APIs", "App Lifecycle"];
  if (c.includes("ai") || c.includes("ml")) return ["Models", "Training", "Inference", "Evaluation", "Ethics"];
  // Fallback: skills phrased around the course itself.
  return ["Concepts", "Syntax", "Practical Application", "Best Practices", topicName];
}

export function generateCertificateHTML(data: CertData): string {
  const {
    topicName,
    topicIconHtml,
    userName,
    completionDateStr,
    certificateId,
    category = "Programming",
    certificateTitle,
    certificateDescription,
  } = data;

  const skills = skillsForCategory(category, topicName);
  const skillsHtml = skills
    .map((s) => `<span class="skill-pill">${s}</span>`)
    .join("");

  const displayTopic = certificateTitle || topicName;

  // Always use the broad statement so all certs read the same way regardless
  // of any per-topic description set in the DB. (`certificateDescription`
  // intentionally ignored to keep content consistent.)
  void certificateDescription;
  const statement = `
    is hereby recognised for the successful completion of the
    <strong>${topicName}</strong> course, having progressed through every
    stage of the curriculum and demonstrated a working understanding of
    the principles, syntax, and practical application of ${category}
    development. This achievement reflects sustained effort, curiosity,
    and the will to learn through challenge.
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Certificate - ${topicName} | CodeLogic Academy</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          /* @page rules drive the saved PDF's paper size + orientation.
             Repeated and !important'd so Chrome's print dialog defaults
             the Layout dropdown to Landscape automatically. */
          @page { size: A4 landscape; margin: 0; }
          @page :first { size: A4 landscape; margin: 0; }
          @page :left { size: A4 landscape; margin: 0; }
          @page :right { size: A4 landscape; margin: 0; }

          /* Strong fallback chains: if Google Fonts hasn't loaded by the
             time print runs, the cert still renders with a near-equivalent
             system font instead of an invisible/missing glyph. */
          html, body {
            font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            width: 100%;
            height: 100%;
            overflow: hidden;
            color: #e2e2f0;
          }

          /* ---- Outer / wrapper ---- */
          .certificate-wrapper {
            width: 100vw;
            height: 100vh;
            background: #050510;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px;
          }

          .certificate {
            width: 100%;
            height: 100%;
            position: relative;
            background:
              radial-gradient(ellipse at top, rgba(124, 58, 237, 0.14), transparent 60%),
              linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 60%, #14142a 100%);
            border-radius: 14px;
            box-shadow:
              inset 0 0 0 2px #7c3aed,
              inset 0 0 0 4px rgba(124, 58, 237, 0.25),
              inset 0 0 0 6px #1a1a2e,
              inset 0 0 0 7px rgba(167, 139, 250, 0.45);
            overflow: hidden;
          }

          /* Subtle dot grid pattern */
          .grid-pattern {
            position: absolute;
            inset: 0;
            background-image:
              radial-gradient(circle, rgba(167, 139, 250, 0.08) 1px, transparent 1px);
            background-size: 22px 22px;
            pointer-events: none;
          }

          /* Corner glyphs - small angled brackets, on-brand */
          .corner {
            position: absolute;
            color: rgba(167, 139, 250, 0.45);
            font-family: 'Space Grotesk', 'Consolas', 'Courier New', monospace;
            font-weight: 700;
            font-size: 22px;
            letter-spacing: -1px;
          }
          .corner-tl { top: 22px; left: 30px; }
          .corner-tr { top: 22px; right: 30px; }
          .corner-bl { bottom: 22px; left: 30px; }
          .corner-br { bottom: 22px; right: 30px; }

          /* Watermark - giant code-bracket symbol behind everything.
             Sized so the full string (including the closing bracket) fits
             inside the cert's overflow:hidden bounds at A4 landscape. */
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Space Grotesk', 'Consolas', 'Courier New', monospace;
            font-size: 300px;
            color: rgba(124, 58, 237, 0.04);
            font-weight: 700;
            pointer-events: none;
            line-height: 1;
            letter-spacing: -10px;
            white-space: nowrap;
          }

          /* ---- Content layout ---- */
          .content {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 28px 70px 22px;
            text-align: center;
          }

          .header {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .logo-wrap {
            margin-bottom: 6px;
          }

          .academy-name {
            font-family: 'Space Grotesk', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif;
            font-size: 22px;
            color: #ffffff;
            font-weight: 600;
            letter-spacing: 4px;
            margin-bottom: 2px;
          }

          .academy-name .gradient {
            background: linear-gradient(135deg, #a78bfa, #f59e0b);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .certificate-label {
            font-size: 10px;
            color: #a78bfa;
            text-transform: uppercase;
            letter-spacing: 6px;
            font-weight: 600;
            margin-top: 2px;
          }

          .ornament-row {
            display: flex;
            align-items: center;
            gap: 14px;
            margin: 14px 0 4px;
          }
          .ornament-line {
            width: 110px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #a78bfa, transparent);
          }
          .ornament-dot {
            width: 6px;
            height: 6px;
            background: #f59e0b;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(245, 158, 11, 0.7);
          }

          /* ---- Body ---- */
          /* Grows into the space between header and footer and centers
             itself vertically, so there's no big dead zone in the middle. */
          .body {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            gap: 12px;
            padding: 14px 0;
          }

          /* No backdrop-filter here - Chrome's print engine drops elements
             (and their text content) that use it. Keep this rule simple. */
          .topic-pill {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 10px 28px;
            background: rgba(124, 58, 237, 0.16);
            border: 1px solid rgba(167, 139, 250, 0.55);
            border-radius: 999px;
          }
          /* WeasyPrint ignores HTML width/height attrs on <img>; force the
             topic icon to a fixed pixel box via CSS so it can't grow to its
             natural size and overflow the page. */
          .topic-pill img,
          .topic-pill svg {
            width: 44px !important;
            height: 44px !important;
            max-width: 44px !important;
            max-height: 44px !important;
            object-fit: contain;
            flex-shrink: 0;
          }

          .topic-name {
            font-family: 'Space Grotesk', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif;
            font-size: 22px;
            color: #ffffff;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .awarded-text {
            font-size: 11px;
            color: #94a3b8;
            letter-spacing: 4px;
            text-transform: uppercase;
          }

          /* Recipient block - tighter than the body gap so the label stays
             close to the name. */
          .recipient-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
          }

          .recipient-name {
            font-family: 'Space Grotesk', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif;
            font-size: 46px;
            color: #ffffff;
            font-weight: 700;
            letter-spacing: 0.5px;
            position: relative;
            display: inline-block;
            padding-bottom: 8px;
          }
          .recipient-name::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 84%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #f59e0b 30%, #a78bfa 70%, transparent);
          }

          .statement {
            font-size: 13px;
            color: #cbd5e1;
            line-height: 1.7;
            max-width: 720px;
            margin: 0 auto;
            font-weight: 400;
          }
          .statement strong {
            color: #ffffff;
            font-weight: 600;
          }

          /* ---- Skills row ---- */
          .skills-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .skills-label {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-weight: 600;
          }

          .skills-row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 820px;
          }

          /* No chip shape. Plain underlined text - no border, no fill,
             nothing that creates a visible edge against the cert bg. */
          .skill-pill {
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 500;
            color: #c4b5fd;
            background: transparent;
            border: 0;
            border-radius: 0;
            letter-spacing: 0.3px;
            text-decoration: underline;
            text-decoration-color: rgba(167, 139, 250, 0.45);
            text-underline-offset: 4px;
          }

          /* ---- Footer ---- */
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            max-width: 920px;
            padding-top: 12px;
            border-top: 1px solid rgba(167, 139, 250, 0.18);
          }

          .footer-block {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .signature-block {
            text-align: left;
          }
          .signature-name {
            font-family: 'Space Grotesk', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            color: #ffffff;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .signature-title {
            font-size: 10px;
            color: #94a3b8;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .signature-line {
            width: 160px;
            height: 1px;
            background: rgba(167, 139, 250, 0.5);
            margin-bottom: 6px;
          }

          /* Center seal */
          .seal {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }
          .seal-circle {
            width: 78px;
            height: 78px;
            border-radius: 50%;
            background:
              radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2), transparent 60%),
              linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #1a1a2e;
            box-shadow: 0 4px 24px rgba(245, 158, 11, 0.45),
                        inset 0 0 0 3px #fcd34d,
                        inset 0 0 0 5px #f59e0b;
          }
          .seal-check {
            font-size: 26px;
            font-weight: 800;
            line-height: 1;
          }
          .seal-text {
            font-size: 7px;
            font-weight: 700;
            letter-spacing: 1.2px;
            margin-top: 2px;
            text-transform: uppercase;
          }
          .seal-caption {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-top: 6px;
          }

          .cert-info {
            text-align: right;
          }
          .cert-info-label {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .cert-info-value {
            font-family: 'Space Grotesk', 'Consolas', 'Courier New', monospace;
            font-size: 11px;
            color: #e2e2f0;
            font-weight: 500;
            margin-bottom: 4px;
          }

          @media print {
            @page { size: A4 landscape !important; margin: 0 !important; }
            /* Lock the printable area to A4 landscape (297mm x 210mm) so
               the cert can't overflow into a cropped portrait sheet. */
            html, body {
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Force every element to honour its colors when printing.
               Without this, semi-transparent backgrounds and dark fills
               can drop in the PDF. */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* If the page renders before the gradient background loads on
               the academy name span, the transparent text-fill leaves the
               text invisible. Force it back to a solid fallback color. */
            .academy-name .gradient {
              -webkit-text-fill-color: #a78bfa !important;
              background: none !important;
              color: #a78bfa !important;
            }
            .certificate-wrapper { width: 100%; height: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="certificate-wrapper">
          <div class="certificate">
            <div class="grid-pattern"></div>
            <div class="watermark">&lt;/&gt;</div>

            <span class="corner corner-tl">&lt;/&gt;</span>
            <span class="corner corner-tr">&lt;/&gt;</span>
            <span class="corner corner-bl">&lt;/&gt;</span>
            <span class="corner corner-br">&lt;/&gt;</span>

            <div class="content">
              <div class="header">
                <div class="logo-wrap">${LOGO_SVG}</div>
                <div class="academy-name"><span class="gradient">CODELOGIC</span> ACADEMY</div>
                <div class="certificate-label">Certificate of Completion</div>
                <div class="ornament-row">
                  <div class="ornament-line"></div>
                  <div class="ornament-dot"></div>
                  <div class="ornament-line"></div>
                </div>
              </div>

              <div class="body">
                <div class="topic-pill">
                  ${topicIconHtml}
                  <span class="topic-name">${displayTopic}</span>
                </div>

                <div class="recipient-block">
                  <div class="awarded-text">This certificate is awarded to</div>
                  <div class="recipient-name">${userName}</div>
                </div>

                <div class="statement">${statement}</div>

                <div class="skills-section">
                  <div class="skills-label">Areas of Study</div>
                  <div class="skills-row">${skillsHtml}</div>
                </div>
              </div>

              <div class="footer">
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-name">CodeLogic Academy</div>
                  <div class="signature-title">Issuing Authority</div>
                </div>

                <div class="seal">
                  <div class="seal-circle">
                    <div class="seal-check">&#10003;</div>
                    <div class="seal-text">Certified</div>
                  </div>
                  <div class="seal-caption">Verified Completion</div>
                </div>

                <div class="cert-info">
                  <div class="cert-info-label">Issued On</div>
                  <div class="cert-info-value">${completionDateStr}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
