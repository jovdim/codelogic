"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import { ScrollReveal, ScrollToTop } from "@/components/ui/ScrollAnimations";
import { gameAPI } from "@/lib/api";
import {
  Award,
  Download,
  Calendar,
  Search,
  Loader2,
  Code2,
  X,
} from "lucide-react";

// Star and Zap removed - certificates simplified

interface Certificate {
  id: string;
  topicId: string;
  topicName: string;
  topicIcon: string | null; // Now a URL or null
  category: string;
  categorySlug: string;
  completedAt: string | null;
  totalStars: number;
  maxStars: number;
  totalLevels: number;
  totalXpEarned: number;
  accentColor: string;
}

// Topic icon component - uses uploaded icon URL or fallback
const TopicIcon = ({
  iconUrl,
  size = 24,
  className = "",
}: {
  iconUrl: string | null;
  size?: number;
  className?: string;
}) => {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt="Topic icon"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  // Fallback to default Code icon
  return <Code2 size={size} className={className} />;
};

// Generate a deterministic certificate ID based on user and certificate data
const generateCertificateId = (
  userId: string | undefined,
  topicId: string,
  completedAt: string | null,
): string => {
  // Create a hash-like string from the data
  const baseString = `${userId || "0"}-${topicId}-${completedAt || "unknown"}`;
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hashHex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  const topicCode = topicId.slice(0, 4).toUpperCase();
  return `CL-${topicCode}-${hashHex}`;
};

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await gameAPI.getCertificates();
        setCertificates(response.data.certificates || []);
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const filteredCerts = certificates.filter(
    (cert) =>
      cert.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get topic icon element for PDF - uses URL or fallback SVG
  const getTopicIconForPDF = (iconUrl: string | null, color: string) => {
    if (iconUrl) {
      return `<img src="${iconUrl}" width="48" height="48" style="object-fit: contain;" />`;
    }
    // Fallback to default code icon
    return `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="${color}" d="M14 16l-8 8 8 8 2.8-2.8L11.6 24l5.2-5.2L14 16zm20 0l8 8-8 8-2.8-2.8 5.2-5.2-5.2-5.2L34 16zM20 36l4-24h4l-4 24h-4z"/></svg>`;
  };

  const downloadCertificate = (cert: Certificate) => {
    const completionDateStr = cert.completedAt
      ? new Date(cert.completedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date not available";

    const certificateId = generateCertificateId(
      user?.id,
      cert.topicId,
      cert.completedAt,
    );
    const userName = user?.display_name || user?.username || "Student";
    const topicIcon = getTopicIconForPDF(cert.topicIcon, cert.accentColor);

    const certContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${cert.topicName} | CodeLogic Academy</title>
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
                  ${topicIcon}
                  <span class="topic-name">${cert.topicName}</span>
                </div>
                
                <div class="awarded-text">This certificate is proudly presented to</div>
                <div class="recipient-name">${userName}</div>
                
                <div class="description">
                  For successfully completing the ${cert.topicName} course,
                  demonstrating proficiency and dedication in mastering the fundamentals
                  and concepts of ${cert.category} development.
                </div>
                
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

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(certContent);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "var(--primary)" }}
            />
          </div>
        </Sidebar>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <ScrollReveal>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  My Certificates
                </h1>
                <p className="text-gray-400">
                  Your earned certificates from completed topics
                </p>
              </div>
            </ScrollReveal>

            {/* Stats - Simple certificate count */}
            <ScrollReveal delay={0.1}>
              <div className="mb-8">
                <div className="pixel-box p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0f0f1a] border border-[#2d2d44] rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {certificates.length}
                      </p>
                      <p className="text-xs text-gray-400">
                        Certificates Earned
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Search with animation */}
            {certificates.length > 0 && (
              <ScrollReveal delay={0.12}>
                <div
                  className={`relative mb-6 transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}
                >
                  <Search
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 z-10 ${searchFocused ? "text-[var(--primary-light)]" : "text-gray-500"}`}
                  />
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`w-full pl-11 pr-4 py-3 pixel-box text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${searchFocused ? "border-[var(--primary)] shadow-lg shadow-[rgba(var(--primary-rgb),0.2)]" : ""}`}
                  />
                </div>
              </ScrollReveal>
            )}

            {/* Certificates List */}
            {filteredCerts.length === 0 ? (
              <div className="text-center py-16">
                <Award className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {certificates.length === 0
                    ? "No certificates yet"
                    : "No matching certificates"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {certificates.length === 0
                    ? "Complete a topic to earn your first certificate!"
                    : "Try a different search term"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCerts.map((cert, index) => {
                  return (
                    <ScrollReveal key={cert.id} delay={0.05 * index}>
                      <div className="pixel-box p-5 hover:border-[#3d3d5c] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#0f0f1a] border border-[#2d2d44] rounded-xl flex items-center justify-center">
                              <TopicIcon iconUrl={cert.topicIcon} size={32} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">
                                {cert.topicName}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {cert.category}
                              </p>
                              {cert.completedAt && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(
                                    cert.completedAt,
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Actions */}
                            <button
                              onClick={() => setSelectedCert(cert)}
                              className="px-4 py-2 pixel-box text-white text-sm font-medium hover:bg-[#2d2d44] transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => downloadCertificate(cert)}
                              className="px-4 py-2 bg-[#c9a227] hover:bg-[#d4b854] text-white text-sm font-medium flex items-center gap-2 transition-colors"
                              style={{
                                boxShadow: "3px 3px 0 0 rgba(0,0,0,0.3)",
                              }}
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </div>
          <ScrollToTop />
        </div>

        {/* Certificate Preview Modal */}
        {selectedCert && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCert(null)}
          >
            <div
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-b from-[#fffffe] to-[#fff9eb] border-[3px] border-[#c9a227] rounded p-6 relative">
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-10 h-10 border-l-2 border-t-2 border-[#c9a227]"></div>
                <div className="absolute top-2 right-2 w-10 h-10 border-r-2 border-t-2 border-[#c9a227]"></div>
                <div className="absolute bottom-2 left-2 w-10 h-10 border-l-2 border-b-2 border-[#c9a227]"></div>
                <div className="absolute bottom-2 right-2 w-10 h-10 border-r-2 border-b-2 border-[#c9a227]"></div>

                {/* Close button */}
                <button
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Logo - Gold colored to match certificate */}
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#f4d03f] to-[#c9a227] rounded-full flex items-center justify-center text-[#5c4a1f] font-bold text-base border-2 border-[#c9a227] shadow-lg">
                    CL
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[9px] text-[#8b7355] uppercase tracking-[4px] mb-1">
                    Certificate of Completion
                  </p>
                  <h2 className="text-xl font-serif font-bold text-[#2d2418] mb-3">
                    CodeLogic Academy
                  </h2>

                  {/* Topic Badge - Dark background to match play section */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-3 bg-[#0f0f1a] border-2 border-[#2d2d44]">
                    <TopicIcon iconUrl={selectedCert.topicIcon} size={24} />
                    <span className="text-base font-serif font-semibold text-[#e2e2f0]">
                      {selectedCert.topicName}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8b7355] tracking-wider mb-1 uppercase">
                    This certificate is proudly presented to
                  </p>
                  <p className="text-lg font-serif font-semibold text-[#2d2418] mb-3 pb-2 border-b-2 border-[#c9a227]/40 inline-block px-6">
                    {user?.display_name || user?.username || "Student"}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[#5c4a1f] my-4">
                    For successfully completing the {selectedCert.topicName}{" "}
                    course at CodeLogic Academy
                  </p>

                  {selectedCert.completedAt && (
                    <p className="text-xs text-[#8b7355] mt-2">
                      Issued:{" "}
                      {new Date(selectedCert.completedAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  )}
                </div>

                {/* Seal */}
                <div className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#f4d03f] to-[#c9a227] rounded-full flex flex-col items-center justify-center text-[#5c4a1f] border-2 border-[#c9a227] shadow-lg">
                  <span className="text-[6px] uppercase tracking-wider font-semibold">
                    Verified
                  </span>
                  <span className="text-sm font-bold">✓</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  style={{ boxShadow: "3px 3px 0 0 rgba(0,0,0,0.2)" }}
                >
                  Close
                </button>
                <button
                  onClick={() => downloadCertificate(selectedCert)}
                  className="flex-1 py-2.5 bg-[#c9a227] hover:bg-[#d4b854] text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  style={{ boxShadow: "3px 3px 0 0 rgba(0,0,0,0.3)" }}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </ProtectedRoute>
  );
}
