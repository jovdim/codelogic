"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import LoginOverlay from "@/components/auth/LoginOverlay";
import { ScrollReveal } from "@/components/ui/ScrollAnimations";
import { gameAPI } from "@/lib/api";
import {
  BookOpen,
  ChevronLeft,
  Download,
  ExternalLink,
  FileText,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";

interface LearningResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  language: string;
  difficulty: string;
  pages: number;
  read_time: string;
  views: number;
  thumbnail_url: string | null;
  pdf_url: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const categoryLabels: { [key: string]: string } = {
  "web-development": "Web Development",
  programming: "Programming",
  data: "Data",
  mobile: "Mobile Development",
  devops: "DevOps",
  other: "Other",
};

export default function LearnResourcePage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [resource, setResource] = useState<LearningResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  const slug = params.id as string;

  useEffect(() => {
    const fetchResource = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await gameAPI.getResource(slug);
        setResource(response.data);
      } catch (err: unknown) {
        console.error("Failed to fetch resource:", err);
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            setError("Resource not found");
          } else {
            setError("Failed to load resource");
          }
        } else {
          setError("Failed to load resource");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [slug]);

  // Show login overlay if not authenticated (after loading)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginOverlay(true);
    }
  }, [isLoading, isAuthenticated]);

  const handleDownload = async () => {
    if (!resource?.pdf_url) return;

    try {
      const response = await fetch(resource.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resource.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open in new tab
      window.open(resource.pdf_url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <Navbar>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </Navbar>
    );
  }

  if (error || !resource) {
    return (
      <Navbar>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="pixel-box p-8 max-w-md text-center">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {error || "Resource Not Found"}
            </h2>
            <p className="text-gray-400 mb-6">
              The resource you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Link
              href="/learn"
              className="btn-primary inline-flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Library
            </Link>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="min-h-screen pb-8">
        {/* Login Overlay for non-authenticated users */}
        <LoginOverlay
          isOpen={showLoginOverlay && !isAuthenticated}
          onClose={() => setShowLoginOverlay(false)}
          message="Login to access this learning resource and download the PDF!"
        />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <ScrollReveal animation="fade-right" delay={0}>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Library
            </Link>
          </ScrollReveal>

          {/* Resource Header */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="pixel-box overflow-hidden mb-8">
              {/* Banner */}
              <div className="h-48 bg-gradient-to-br from-purple-600 to-purple-900 relative overflow-hidden">
                {resource.thumbnail_url ? (
                  <img
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="w-24 h-24 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
              </div>

              {/* Info */}
              <div className="p-6 -mt-12 relative">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded mb-2">
                      {resource.language}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {resource.title}
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                      {resource.description}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{resource.pages} pages</span>
                  </div>
                  {resource.read_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{resource.read_time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{resource.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {categoryLabels[resource.category] || resource.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* PDF Viewer */}
          <ScrollReveal animation="fade-up" delay={200}>
            {resource.pdf_url ? (
              <div className="pixel-box overflow-hidden">
                {/* PDF Info Card */}
                <div className="p-8 text-center">
                  <div className="w-24 h-32 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                    <FileText className="w-12 h-12 text-white" />
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">
                    {resource.title}.pdf
                  </h2>

                  <p className="text-gray-400 mb-6">
                    {resource.pages} pages • PDF Document
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={resource.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-6 py-3 flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open in Browser
                    </a>
                    {isAuthenticated ? (
                      <button
                        onClick={handleDownload}
                        className="btn-primary px-6 py-3 flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowLoginOverlay(true)}
                        className="btn-primary px-6 py-3 flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <Download className="w-5 h-5" />
                        Login to Download
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="border-t border-[#2d2d44] p-6 bg-[#0f0f1a]/50">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>PDF Format</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>{resource.pages} Pages</span>
                    </div>
                    {resource.read_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>{resource.read_time} read</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span>{resource.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pixel-box p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No PDF Available
                </h3>
                <p className="text-gray-400">
                  The PDF for this resource has not been uploaded yet.
                </p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </Navbar>
  );
}
