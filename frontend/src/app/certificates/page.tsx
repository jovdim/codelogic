"use client";

import { useState, useEffect, useMemo } from "react";
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
  X,
} from "lucide-react";
import {
  generateCertificateHTML,
  CertData,
  getTopicIconForCertificate,
} from "@/lib/certTemplate";

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
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
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

  const downloadCertificate = (cert: Certificate) => {
    const certContent = generateCertificateHTML(buildCertData(cert));
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

        {/* Certificate Preview Modal — iframe so preview matches what they download */}
        {selectedCert && (
          <CertPreviewModal
            certHtml={generateCertificateHTML(buildCertData(selectedCert))}
            onClose={() => setSelectedCert(null)}
            onDownload={() => downloadCertificate(selectedCert)}
          />
        )}
      </Sidebar>
    </ProtectedRoute>
  );
}


/**
 * Modal that renders the full cert HTML inside an iframe via a blob URL.
 * The iframe gets the exact HTML the download produces, so the preview is
 * byte-for-byte the same as the downloaded file.
 */
function CertPreviewModal({
  certHtml,
  onClose,
  onDownload,
}: {
  certHtml: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  const iframeSrc = useMemo(() => {
    const blob = new Blob([certHtml], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [certHtml]);

  // Free the blob URL when the modal unmounts.
  useEffect(() => {
    return () => URL.revokeObjectURL(iframeSrc);
  }, [iframeSrc]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-xl bg-[#0f0f1a] border border-[#2d2d44] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d44]">
          <h2 className="text-white font-semibold">Certificate Preview</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cert content — landscape ratio so the iframe shows the full cert */}
        <div className="bg-black">
          <iframe
            src={iframeSrc}
            title="Certificate preview"
            className="w-full block"
            style={{ aspectRatio: "1.414 / 1", border: 0 }}
          />
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#2d2d44]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1a1a2e] text-gray-300 text-sm font-medium hover:bg-[#252540] border border-[#2d2d44]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90"
            style={{ background: "var(--gradient-purple)" }}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
