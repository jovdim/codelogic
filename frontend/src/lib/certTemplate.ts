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
    return `<img src="${iconUrl}" width="48" height="48" style="object-fit: contain;" />`;
  }
  // Fallback to default code icon
  return `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="${color}" d="M14 16l-8 8 8 8 2.8-2.8L11.6 24l5.2-5.2L14 16zm20 0l8 8-8 8-2.8-2.8 5.2-5.2-5.2-5.2L34 16zM20 36l4-24h4l-4 24h-4z"/></svg>`;
}

export function generateCertificateHTML(data: CertData): string {
  const {
    topicName,
    topicIconHtml,
    accentColor,
    userName,
    completionDateStr,
    certificateId,
    category = "development",
    certificateTitle,
    certificateDescription,
  } = data;

  const starsHTML = "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Certificate - ${topicName} | CodeLogic Academy</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          @page {
            size: landscape;
            margin: 0;
          }

          html, body {
            font-family: 'Montserrat', sans-serif;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .certificate-wrapper {
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #fefcf3 0%, #faf6e9 50%, #f5f0dc 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .certificate {
            width: 100%;
            height: 100%;
            position: relative;
            background: linear-gradient(180deg, #fffffe 0%, #fffcf5 50%, #fff9eb 100%);
            border: 4px solid #c9a227;
            box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 4px #e8d48b;
          }

          /* Ornate corner decorations */
          .corner {
            position: absolute;
            width: 100px;
            height: 100px;
          }
          .corner svg { width: 100%; height: 100%; }
          .corner-tl { top: 8px; left: 8px; }
          .corner-tr { top: 8px; right: 8px; transform: scaleX(-1); }
          .corner-bl { bottom: 8px; left: 8px; transform: scaleY(-1); }
          .corner-br { bottom: 8px; right: 8px; transform: scale(-1, -1); }

          /* Border pattern */
          .border-pattern {
            position: absolute;
            top: 25px;
            left: 25px;
            right: 25px;
            bottom: 25px;
            border: 2px solid #d4b854;
            pointer-events: none;
          }

          .content {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 50px 80px;
            text-align: center;
          }

          .header-ornament {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 5px;
          }

          .ornament-line {
            width: 120px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #c9a227, transparent);
          }

          .logo-badge {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #f4d03f 0%, #c9a227 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #5c4a1f;
            font-weight: 700;
            font-size: 20px;
            letter-spacing: -1px;
            border: 3px solid #c9a227;
            box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
          }

          .certificate-label {
            font-size: 11px;
            color: #8b7355;
            text-transform: uppercase;
            letter-spacing: 8px;
            margin-bottom: 8px;
          }

          .academy-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 44px;
            color: #2d2418;
            font-weight: 600;
            margin-bottom: 20px;
            letter-spacing: 2px;
          }

          .topic-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 14px 36px;
            background: #0f0f1a;
            border: 2px solid #2d2d44;
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .topic-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 28px;
            color: #e2e2f0;
            font-weight: 600;
          }

          .awarded-text {
            font-size: 13px;
            color: #8b7355;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          .recipient-name {
            font-family: 'Cormorant Garamond', serif;
            font-size: 38px;
            color: #2d2418;
            font-weight: 600;
            margin-bottom: 8px;
            position: relative;
            display: inline-block;
          }

          .recipient-name::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #c9a227, transparent);
          }

          .description {
            font-size: 12px;
            color: #5c5040;
            line-height: 1.7;
            max-width: 580px;
            margin: 18px auto;
          }

          .stars-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin: 12px 0;
          }

          .star {
            fill: none;
            stroke: #d4af37;
            stroke-width: 1;
          }

          .star.filled {
            fill: #d4af37;
          }

          .achievement-label {
            font-size: 10px;
            color: #8b7355;
            text-transform: uppercase;
            letter-spacing: 3px;
          }

          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            max-width: 700px;
            margin-top: auto;
            padding-top: 15px;
          }

          .signature-block { text-align: center; }

          .signature-line {
            width: 160px;
            height: 1px;
            background: #5c5040;
            margin-bottom: 8px;
          }

          .signature-name {
            font-size: 12px;
            color: #5c5040;
            font-weight: 500;
          }

          .signature-title {
            font-size: 10px;
            color: #8b7355;
            margin-top: 2px;
          }

          .cert-info { text-align: right; }

          .cert-date, .cert-id {
            font-size: 10px;
            color: #8b7355;
            margin-bottom: 4px;
          }

          /* Gold seal */
          .seal {
            position: absolute;
            bottom: 50px;
            right: 100px;
            width: 90px;
            height: 90px;
          }

          .seal-outer {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f4d03f 0%, #c9a227 50%, #f4d03f 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(201, 162, 39, 0.4);
          }

          .seal-inner {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #fffef0 0%, #f4d03f 100%);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px solid #c9a227;
          }

          .seal-text {
            font-size: 8px;
            color: #5c4a1f;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }

          .seal-check {
            font-size: 22px;
            color: #5c4a1f;
            font-weight: bold;
            line-height: 1;
          }

          /* Watermark */
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Cormorant Garamond', serif;
            font-size: 200px;
            color: rgba(201, 162, 39, 0.04);
            font-weight: 700;
            pointer-events: none;
            letter-spacing: -10px;
          }

          @media print {
            html, body {
              width: 100%;
              height: 100%;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .certificate-wrapper {
              width: 100%;
              height: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-wrapper">
          <div class="certificate">
            <!-- Corner ornaments -->
            <div class="corner corner-tl">
              <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
            </div>
            <div class="corner corner-tr">
              <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
            </div>
            <div class="corner corner-bl">
              <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
            </div>
            <div class="corner corner-br">
              <svg viewBox="0 0 100 100"><path d="M10 90 L10 10 L90 10" fill="none" stroke="#c9a227" stroke-width="2"/><path d="M10 70 L10 30 L30 10" fill="none" stroke="#d4b854" stroke-width="1"/><circle cx="10" cy="10" r="6" fill="#c9a227"/></svg>
            </div>

            <div class="border-pattern"></div>
            <div class="watermark">CL</div>

            <div class="content">
              <div class="header-ornament">
                <div class="ornament-line"></div>
                <div class="logo-badge">CL</div>
                <div class="ornament-line"></div>
              </div>

              <div class="certificate-label">Certificate of Completion</div>
              <div class="academy-name">CodeLogic Academy</div>

              <div class="topic-section">
                ${topicIconHtml}
                <span class="topic-name">${certificateTitle || topicName}</span>
              </div>

              <div class="awarded-text">This certificate is proudly presented to</div>
              <div class="recipient-name">${userName}</div>

              <div class="description">
                ${certificateDescription || `For successfully completing the ${topicName} course, demonstrating proficiency and dedication in mastering the fundamentals and concepts of ${category} development.`}
              </div>

              ${starsHTML}

              <div class="footer-section">
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-name">CodeLogic Team</div>
                  <div class="signature-title">Program Director</div>
                </div>

                <div class="cert-info">
                  <div class="cert-date">Issued: ${completionDateStr}</div>
                  <div class="cert-id">Certificate ID: ${certificateId}</div>
                </div>
              </div>
            </div>

            <div class="seal">
              <div class="seal-outer">
                <div class="seal-inner">
                  <div class="seal-text">Verified</div>
                  <div class="seal-check">✓</div>
                  <div class="seal-text">Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
