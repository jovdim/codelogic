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
  Star,
  Calendar,
  Trophy,
  Search,
  Loader2,
  Zap,
} from "lucide-react";

interface Certificate {
  id: string;
  topicId: string;
  topicName: string;
  topicIcon: string;
  category: string;
  categorySlug: string;
  completedAt: string | null;
  totalStars: number;
  maxStars: number;
  totalLevels: number;
  totalXpEarned: number;
  accentColor: string;
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

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

  const downloadCertificate = (cert: Certificate) => {
    const avgStars = cert.totalStars / cert.totalLevels;
    const displayStars =
      "★".repeat(Math.round(avgStars)) + "☆".repeat(3 - Math.round(avgStars));
    const completionDateStr = cert.completedAt
      ? new Date(cert.completedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date not available";

    const certContent = `
      <html>
        <head>
          <title>Certificate - ${cert.topicName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Georgia', serif;
              background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px;
            }
            .certificate {
              background: #fefefe;
              width: 800px;
              padding: 60px;
              border-radius: 12px;
              text-align: center;
              position: relative;
            }
            .border-frame {
              border: 4px double #d4af37;
              padding: 40px;
              border-radius: 8px;
            }
            .icon { font-size: 48px; margin-bottom: 20px; }
            .title { 
              font-size: 14px; 
              color: #666; 
              text-transform: uppercase; 
              letter-spacing: 4px; 
              margin-bottom: 10px;
            }
            .topic { 
              font-size: 36px; 
              color: #1a1a2e; 
              margin-bottom: 20px;
              font-weight: bold;
            }
            .subtitle { color: #666; margin-bottom: 10px; }
            .name { 
              font-size: 28px; 
              color: #1a1a2e; 
              margin: 20px 0;
              font-weight: bold;
            }
            .stars { 
              color: #eab308; 
              font-size: 24px; 
              margin: 20px 0;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #888;
              font-size: 12px;
            }
            .date {
              position: absolute;
              bottom: 30px;
              right: 40px;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="border-frame">
              <div class="icon">${cert.topicIcon}</div>
              <div class="title">Certificate of Completion</div>
              <div class="topic">${cert.topicName}</div>
              <div class="subtitle">has been successfully completed by</div>
              <div class="name">${user?.display_name || user?.username || "Student"}</div>
              <div class="stars">${displayStars}</div>
              <div class="stats">
                <span>Stars: ${cert.totalStars}/${cert.maxStars}</span>
                <span>XP Earned: ${cert.totalXpEarned}</span>
                <span>Levels: ${cert.totalLevels}</span>
              </div>
            </div>
            <div class="date">Completed: ${completionDateStr}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(certContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Sidebar>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
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

            {/* Stats */}
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2d2d44]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {certificates.length}
                      </p>
                      <p className="text-xs text-gray-400">Certificates</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2d2d44]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {certificates.reduce((acc, c) => acc + c.totalStars, 0)}
                      </p>
                      <p className="text-xs text-gray-400">Total Stars</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2d2d44]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {certificates.reduce(
                          (acc, c) => acc + c.totalXpEarned,
                          0,
                        )}
                      </p>
                      <p className="text-xs text-gray-400">Total XP</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Search */}
            {certificates.length > 0 && (
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1a1a2e] border border-[#2d2d44] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
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
                  const avgStars = cert.totalStars / cert.totalLevels;
                  return (
                    <ScrollReveal key={cert.id} delay={0.05 * index}>
                      <div className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2d2d44] hover:border-[#3d3d5c] transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                              style={{
                                backgroundColor: `${cert.accentColor}20`,
                              }}
                            >
                              {cert.topicIcon}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">
                                {cert.topicName}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {cert.category}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                {cert.completedAt && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(
                                      cert.completedAt,
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Zap className="w-3 h-3" />
                                  {cert.totalXpEarned} XP
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Stars */}
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= Math.round(avgStars) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {cert.totalStars}/{cert.maxStars} stars
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedCert(cert)}
                                className="px-4 py-2 bg-[#2d2d44] text-white rounded-lg text-sm font-medium hover:bg-[#3d3d5c] transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => downloadCertificate(cert)}
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                style={{ backgroundColor: cert.accentColor }}
                              >
                                <Download className="w-4 h-4" />
                                PDF
                              </button>
                            </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCert(null)}
          >
            <div
              className="bg-[#fefefe] rounded-xl p-6 max-w-md w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-4 border-double border-yellow-600/30 p-6 rounded-lg">
                <div className="text-4xl mb-4">{selectedCert.topicIcon}</div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  Certificate of Completion
                </p>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {selectedCert.topicName}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  has been successfully completed by
                </p>
                <p className="text-xl font-bold text-gray-800 mb-4">
                  {user?.display_name || user?.username || "Student"}
                </p>
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3].map((star) => {
                    const avgStars =
                      selectedCert.totalStars / selectedCert.totalLevels;
                    return (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${star <= Math.round(avgStars) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-6 pt-4 border-t">
                  <span>
                    Stars: {selectedCert.totalStars}/{selectedCert.maxStars}
                  </span>
                  <span>XP: {selectedCert.totalXpEarned}</span>
                </div>
                {selectedCert.completedAt && (
                  <p className="text-xs text-gray-400 mt-4">
                    Completed:{" "}
                    {new Date(selectedCert.completedAt).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadCertificate(selectedCert)}
                  className="flex-1 py-2.5 bg-[#1a1a2e] text-white rounded-lg font-medium flex items-center justify-center gap-2"
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
