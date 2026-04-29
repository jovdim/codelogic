"use client";

import { useState, useEffect } from "react";
import { getCached, setCache } from "@/lib/dataCache";
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
} from "lucide-react";
import {
  generateCertificateHTML,
  CertData,
  getTopicIconForCertificate,
} from "@/lib/certTemplate";
import { downloadCertAsPdf } from "@/lib/certPdf";

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
  certificateTitle?: string;
  certificateDescription?: string;
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
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const cached = getCached<Certificate[]>("certificates");
        if (cached) {
          setCertificates(cached);
          setLoading(false);
          return;
        }

        const response = await gameAPI.getCertificates();
        const certificatesData = response.data.certificates || [];
        setCertificates(certificatesData);
        setCache("certificates", certificatesData);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
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
    return getTopicIconForCertificate(iconUrl, color);
  };

  // Builds the same CertData payload used by both the download and the
  // in-page preview iframe — single source of truth for both surfaces.
  const buildCertData = (cert: Certificate): CertData => {
    const completionDateStr = cert.completedAt
      ? new Date(cert.completedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date not available";

    return {
      topicName: cert.topicName,
      topicId: cert.topicId,
      topicIconHtml: getTopicIconForPDF(cert.topicIcon, cert.accentColor),
      accentColor: cert.accentColor,
      userName: user?.display_name || user?.username || "Student",
      completionDateStr,
      certificateId: generateCertificateId(
        user?.id,
        cert.topicId,
        cert.completedAt,
      ),
      category: cert.category,
      certificateTitle: cert.certificateTitle,
      certificateDescription: cert.certificateDescription,
    };
  };

  // Opens the cert HTML in a new tab. The user can read it like a normal
  // page and use the browser's own print/save-as-PDF if they want.
  const viewCertificate = (cert: Certificate) => {
    const html = generateCertificateHTML(buildCertData(cert));
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  // Generate a real .pdf file and trigger a browser download. Renders the
  // cert HTML in a hidden iframe, waits for fonts, then html2pdf captures
  // and saves it.
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadCertificate = async (cert: Certificate) => {
    if (downloadingId) return;
    setDownloadingId(cert.id);
    try {
      const html = generateCertificateHTML(buildCertData(cert));
      const safeTopic = cert.topicName.replace(/[^a-z0-9]+/gi, "-");
      await downloadCertAsPdf(html, `Certificate-${safeTopic}.pdf`);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      alert("Couldn't generate the PDF. Try again or use the View button.");
    } finally {
      setDownloadingId(null);
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
                            <button
                              onClick={() => viewCertificate(cert)}
                              className="px-4 py-2 pixel-box text-white text-sm font-medium hover:bg-[#2d2d44] transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => downloadCertificate(cert)}
                              disabled={downloadingId === cert.id}
                              className="px-4 py-2 text-white text-sm font-medium flex items-center gap-2 transition-colors hover:opacity-90 rounded disabled:opacity-60 disabled:cursor-wait"
                              style={{
                                background: "var(--gradient-purple)",
                                boxShadow: "3px 3px 0 0 rgba(0,0,0,0.3)",
                              }}
                            >
                              {downloadingId === cert.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating…
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  PDF
                                </>
                              )}
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

      </Sidebar>
    </ProtectedRoute>
  );
}


