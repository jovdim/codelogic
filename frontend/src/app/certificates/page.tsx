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
  Search,
  Loader2,
  Zap,
  Code2,
  Database,
  Terminal,
  X,
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

// Topic icon component using Lucide icons and custom SVGs
const TopicIcon = ({
  icon,
  size = 24,
  className = "",
}: {
  icon: string;
  size?: number;
  className?: string;
}) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    javascript: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <rect width="24" height="24" fill="#f7df1e" rx="2" />
        <path
          d="M6 18.2V16.5l1.8.1c.4 0 .7-.3.7-.7v-5.8h2v5.9c0 1.6-.9 2.4-2.5 2.4-1.1 0-1.8-.1-2-.2zm7.3-.3c-.6-.3-1-.8-1.2-1.3l1.6-.9c.2.4.4.6.7.8.3.2.6.2 1 .2.5 0 .9-.2.9-.6 0-.5-.6-.7-1.4-1-.9-.3-2.1-.8-2.1-2.2 0-1.4 1.2-2.3 2.7-2.3.9 0 1.7.2 2.3.7l-1.4 1c-.3-.3-.7-.4-1-.4-.4 0-.7.2-.7.5 0 .4.5.6 1.2.8 1.1.4 2.3.9 2.3 2.3 0 1.5-1.2 2.6-3 2.6-.9 0-1.6-.2-2.2-.5z"
          fill="#000"
        />
      </svg>
    ),
    python: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path
          fill="#3776ab"
          d="M12 2c-1.7 0-3.2.1-4.4.4C5.3 2.9 5 3.8 5 5v2h6v1H4.3c-1 0-2 .6-2.3 1.8-.3 1.4-.3 2.3 0 3.8.3 1.1 1 1.8 2 1.8H5v-1.6c0-1.2 1-2.2 2.3-2.2h4.5c1 0 1.7-.7 1.7-1.7V5c0-1-.8-1.7-1.7-2-.6-.2-1.3-.3-1.9-.3-.7-.1-1.3-.1-1.9-.1zm-2.5 2c.4 0 .8.3.8.8s-.3.8-.8.8-.8-.3-.8-.8.3-.8.8-.8z"
        />
        <path
          fill="#ffc331"
          d="M18.6 8.6h-1v1.6c0 1.2-1 2.2-2.3 2.2H11c-1 0-1.7.7-1.7 1.7v3.2c0 1 .8 1.5 1.7 1.8 1.1.3 2.2.4 3.4 0 .8-.2 1.7-.7 1.7-1.8v-1.3h-4v-.5h5.6c1 0 1.4-.7 1.7-1.7.3-1 .3-2.1 0-3.4-.2-1-1.1-1.5-2-1.8zm-4.1 8.6c.4 0 .8.3.8.8s-.3.8-.8.8-.8-.3-.8-.8.3-.8.8-.8z"
        />
      </svg>
    ),
    html: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path
          fill="#e44d26"
          d="M4 2l1.5 17L12 22l6.5-3L20 2H4zm12.5 6H8.3l.2 2.5h7.8l-.6 6.5-3.7 1-3.7-1-.2-3h2.4l.1 1.5 1.4.4 1.4-.4.1-2H7.9l-.5-5.5h9.2l-.1 1z"
        />
      </svg>
    ),
    css: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path
          fill="#264de4"
          d="M4 2l1.5 17L12 22l6.5-3L20 2H4zm12.6 5.9l-.1.8-.1.5-.1.5H8.3l.2 2h7.2l-.1.6-.6 6.6-3 .8-3-.8-.2-2.5h2.1l.1 1.3 1 .3 1-.3.1-1.4.1-1.3H7.6l-.5-5.5h9.6l-.1.9z"
        />
      </svg>
    ),
    react: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <circle cx="12" cy="12" r="2.2" fill="#61dafb" />
        <g fill="none" stroke="#61dafb" strokeWidth="1">
          <ellipse rx="10" ry="4" cx="12" cy="12" />
          <ellipse
            rx="10"
            ry="4"
            cx="12"
            cy="12"
            transform="rotate(60 12 12)"
          />
          <ellipse
            rx="10"
            ry="4"
            cx="12"
            cy="12"
            transform="rotate(120 12 12)"
          />
        </g>
      </svg>
    ),
    typescript: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <rect width="24" height="24" fill="#3178c6" rx="2" />
        <path
          fill="#fff"
          d="M6 13.5v-1h4.5v1H8.8v5h-1v-5H6zm5.3 1.8v-.7c.4.2 1 .4 1.5.4.6 0 .8-.2.8-.5 0-.2-.1-.3-.2-.4-.1-.1-.3-.2-.5-.2l-.5-.2c-.8-.3-1.2-.8-1.2-1.5 0-.5.2-.9.5-1.2.4-.3.9-.4 1.5-.4.5 0 1 .1 1.3.2v.7c-.4-.2-.8-.3-1.3-.3-.5 0-.8.2-.8.5 0 .2.1.3.2.4.1.1.3.2.5.2l.5.2c.4.1.7.3.9.6.2.2.3.5.3.9 0 .5-.2.9-.5 1.2-.4.3-.9.5-1.6.5-.5 0-1.1-.1-1.4-.3zm3.9-1.8v-1h4.5v1h-1.7v5h-1v-5h-1.8z"
        />
      </svg>
    ),
    nodejs: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path
          fill="#68a063"
          d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.5 3.7v7.3l-6.5 3.6-6.5-3.6V7.9L12 4.2z"
        />
        <path fill="#68a063" d="M12 8v8l-4-2.2V10l4-2z" />
      </svg>
    ),
    java: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path
          fill="#e76f00"
          d="M8.9 18.6s-.9.5.6.7c1.8.3 2.8.2 4.8-.2 0 0 .5.3 1.3.6-4.5 1.9-10.2-.1-6.7-1.1zm-.6-2.5s-1 .7.5.9c2 .2 3.5.2 6.2-.3 0 0 .4.4 1 .6-5.4 1.6-11.5.1-7.7-1.2z"
        />
        <path
          fill="#5382a1"
          d="M13.5 10.3c1.2 1.4-.3 2.6-.3 2.6s3.1-1.6 1.7-3.6c-1.3-1.8-2.3-2.8 3.2-5.9 0 0-8.7 2.2-4.6 6.9z"
        />
        <path
          fill="#e76f00"
          d="M18.4 20.2s.6.5-.7 1c-2.5.8-10.3 1-12.5 0-.8-.4.7-.9 1.2-.9.5-.1.8-.1.8-.1-1-.7-6.1 1.4-2.6 2 9.5 1.7 17.3-.7 13.8-2z"
        />
        <path
          fill="#e76f00"
          d="M9.3 13.4s-4.3 1-1.5 1.4c1.2.2 3.5.1 5.7-.1 1.8-.2 3.6-.5 3.6-.5l-1.1.6c-4.5 1.2-13.2.6-10.7-.6 2.1-1 4-0.8 4-0.8zm7.8 4.4c4.6-2.4 2.5-4.7 1-4.4-.4.1-.5.2-.5.2s.1-.2.4-.3c3-1.1 5.3 3.1-.9 4.8 0 0 0-.2 0-.3z"
        />
        <path
          fill="#5382a1"
          d="M14.3 2s2.5 2.5-2.4 6.4c-3.9 3.1-.9 4.9 0 6.9-2.3-2.1-4-3.9-2.9-5.6 1.7-2.5 6.4-3.7 5.3-7.7z"
        />
      </svg>
    ),
    cpp: (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path
          fill="#00599C"
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 1.5c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5S3.5 16.7 3.5 12 7.3 3.5 12 3.5z"
        />
        <path
          fill="#00599C"
          d="M9 8v8c0 .6.4 1 1 1h2c2.2 0 4-1.8 4-4s-1.8-4-4-4H9zm2 2h1c1.1 0 2 .9 2 2s-.9 2-2 2h-1v-4z"
        />
        <path
          fill="#00599C"
          d="M17 10h-1v1h-1v1h1v1h1v-1h1v-1h-1v-1zm3 0h-1v1h-1v1h1v1h1v-1h1v-1h-1v-1z"
        />
      </svg>
    ),
    sql: <Database size={size} className={className} />,
    bash: <Terminal size={size} className={className} />,
    code: <Code2 size={size} className={className} />,
  };

  return iconMap[icon] || iconMap.code;
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
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    message: string;
    certInfo?: { topic: string; user: string; date: string };
  } | null>(null);

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

  const getTopicSVGForPDF = (icon: string, color: string) => {
    const svgMap: { [key: string]: string } = {
      javascript: `<svg viewBox="0 0 48 48" width="48" height="48"><rect width="48" height="48" fill="#f7df1e" rx="4"/><path d="M12 36.4V33l3.6.2c.8 0 1.4-.6 1.4-1.4v-11.6h4v11.8c0 3.2-1.8 4.8-5 4.8-2.2 0-3.6-.2-4-.4zm14.6-.6c-1.2-.6-2-1.6-2.4-2.6l3.2-1.8c.4.8.8 1.2 1.4 1.6.6.4 1.2.4 2 .4 1 0 1.8-.4 1.8-1.2 0-1-1.2-1.4-2.8-2-1.8-.6-4.2-1.6-4.2-4.4 0-2.8 2.4-4.6 5.4-4.6 1.8 0 3.4.4 4.6 1.4l-2.8 2c-.6-.6-1.4-.8-2-.8-.8 0-1.4.4-1.4 1 0 .8 1 1.2 2.4 1.6 2.2.8 4.6 1.8 4.6 4.6 0 3-2.4 5.2-6 5.2-1.8 0-3.2-.4-4.4-1z" fill="#000"/></svg>`,
      python: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#3776ab" d="M24 4c-3.4 0-6.4.2-8.8.8C11.4 5.8 10 7.6 10 10v4h12v2H8.6c-2 0-4 1.2-4.6 3.6-.6 2.8-.6 4.6 0 7.6.6 2.2 2 3.6 4 3.6H10v-3.2c0-2.4 2-4.4 4.6-4.4h9c2 0 3.4-1.4 3.4-3.4V10c0-2-1.6-3.4-3.4-4-1.2-.4-2.6-.6-3.8-.6-1.4-.2-2.6-.2-3.8-.2zm-5 4c.8 0 1.6.6 1.6 1.6s-.6 1.6-1.6 1.6-1.6-.6-1.6-1.6.6-1.6 1.6-1.6z"/><path fill="#ffc331" d="M37.2 17.2h-2v3.2c0 2.4-2 4.4-4.6 4.4h-9c-2 0-3.4 1.4-3.4 3.4v6.4c0 2 1.6 3 3.4 3.6 2.2.6 4.4.8 6.8 0 1.6-.4 3.4-1.4 3.4-3.6v-2.6h-8v-1h11.2c2 0 2.8-1.4 3.4-3.4.6-2 .6-4.2 0-6.8-.4-2-2.2-3-4-3.6zm-8.2 17.2c.8 0 1.6.6 1.6 1.6s-.6 1.6-1.6 1.6-1.6-.6-1.6-1.6.6-1.6 1.6-1.6z"/></svg>`,
      html: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#e44d26" d="M8 4l3 34L24 44l13-6L40 4H8zm25 12H16.6l.4 5h15.4l-1.2 13-7.2 2-7.4-2-.4-6h4.8l.2 3 2.8.8 2.8-.8.2-4H14.2l-1-11h21.4l-.6 2z"/></svg>`,
      css: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#264de4" d="M8 4l3 34L24 44l13-6L40 4H8zm25.2 11.8l-.2 1.6-.2 1-.2 1H16.6l.4 4h14.4l-.2 1.2-1.2 13.2-6 1.6-6-1.6-.4-5h4.2l.2 2.6 2 .6 2-.6.2-2.8.2-2.6H15.2l-1-11h19.2l-.2 1.8z"/></svg>`,
      react: `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="4.4" fill="#61dafb"/><g fill="none" stroke="#61dafb" stroke-width="2"><ellipse rx="20" ry="8" cx="24" cy="24"/><ellipse rx="20" ry="8" cx="24" cy="24" transform="rotate(60 24 24)"/><ellipse rx="20" ry="8" cx="24" cy="24" transform="rotate(120 24 24)"/></g></svg>`,
      typescript: `<svg viewBox="0 0 48 48" width="48" height="48"><rect width="48" height="48" fill="#3178c6" rx="4"/><path fill="#fff" d="M12 27v-2h9v2h-3.4v10h-2v-10H12zm10.6 3.6v-1.4c.8.4 2 .8 3 .8 1.2 0 1.6-.4 1.6-1 0-.4-.2-.6-.4-.8-.2-.2-.6-.4-1-.4l-1-.4c-1.6-.6-2.4-1.6-2.4-3 0-1 .4-1.8 1-2.4.8-.6 1.8-.8 3-.8 1 0 2 .2 2.6.4v1.4c-.8-.4-1.6-.6-2.6-.6-1 0-1.6.4-1.6 1 0 .4.2.6.4.8.2.2.6.4 1 .4l1 .4c.8.2 1.4.6 1.8 1.2.4.4.6 1 .6 1.8 0 1-.4 1.8-1 2.4-.8.6-1.8 1-3.2 1-1 0-2.2-.2-2.8-.6zm7.8-3.6v-2h9v2h-3.4v10h-2v-10h-3.6z"/></svg>`,
      nodejs: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#68a063" d="M24 4L6 14v20l18 10 18-10V14L24 4zm0 4.4l13 7.4v14.6l-13 7.2-13-7.2V15.8L24 8.4z"/><path fill="#68a063" d="M24 16v16l-8-4.4V20l8-4z"/></svg>`,
      java: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="#e76f00" d="M17.8 37.2s-1.8 1 1.2 1.4c3.6.6 5.6.4 9.6-.4 0 0 1 .6 2.6 1.2-9 3.8-20.4-.2-13.4-2.2zm-1.2-5s-2 1.4 1 1.8c4 .4 7 .4 12.4-.6 0 0 .8.8 2 1.2-10.8 3.2-23 .2-15.4-2.4z"/><path fill="#5382a1" d="M27 20.6c2.4 2.8-.6 5.2-.6 5.2s6.2-3.2 3.4-7.2c-2.6-3.6-4.6-5.6 6.4-11.8 0 0-17.4 4.4-9.2 13.8z"/><path fill="#e76f00" d="M36.8 40.4s1.2 1-1.4 2c-5 1.6-20.6 2-25 0-1.6-.8 1.4-1.8 2.4-1.8 1-.2 1.6-.2 1.6-.2-2-.4-12.2 2.8-5.2 4 19 3.4 34.6-1.4 27.6-4z"/><path fill="#e76f00" d="M18.6 26.8s-8.6 2-3 2.8c2.4.4 7 .2 11.4-.2 3.6-.4 7.2-1 7.2-1l-2.2 1.2c-9 2.4-26.4 1.2-21.4-1.2 4.2-2 8-1.6 8-1.6zm15.6 8.8c9.2-4.8 5-9.4 2-8.8-.8.2-1 .4-1 .4s.2-.4.8-.6c6-2.2 10.6 6.2-1.8 9.6 0 0 0-.4 0-.6z"/><path fill="#5382a1" d="M28.6 4s5 5-4.8 12.8c-7.8 6.2-1.8 9.8 0 13.8-4.6-4.2-8-7.8-5.8-11.2 3.4-5 12.8-7.4 10.6-15.4z"/></svg>`,
      cpp: `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="20" fill="none" stroke="#00599C" stroke-width="3"/><path fill="#00599C" d="M18 16v16c0 1.2.8 2 2 2h4c4.4 0 8-3.6 8-8s-3.6-8-8-8h-6zm4 4h2c2.2 0 4 1.8 4 4s-1.8 4-4 4h-2v-8z"/><path fill="#00599C" d="M34 20h-2v2h-2v2h2v2h2v-2h2v-2h-2v-2zm6 0h-2v2h-2v2h2v2h2v-2h2v-2h-2v-2z"/></svg>`,
      sql: `<svg viewBox="0 0 48 48" width="48" height="48"><ellipse cx="24" cy="12" rx="16" ry="6" fill="#336791"/><path fill="#336791" d="M8 12v24c0 3.3 7.2 6 16 6s16-2.7 16-6V12c0 3.3-7.2 6-16 6S8 15.3 8 12z"/><ellipse cx="24" cy="12" rx="16" ry="6" fill="none" stroke="#336791" stroke-width="2"/></svg>`,
      bash: `<svg viewBox="0 0 48 48" width="48" height="48"><rect x="4" y="8" width="40" height="32" rx="4" fill="#2d2d2d"/><path fill="#4EAA25" d="M12 20l6 4-6 4v-3H8v-2h4v-3zm8 8h12v2H20v-2z"/></svg>`,
      code: `<svg viewBox="0 0 48 48" width="48" height="48"><path fill="${color}" d="M14 16l-8 8 8 8 2.8-2.8L11.6 24l5.2-5.2L14 16zm20 0l8 8-8 8-2.8-2.8 5.2-5.2-5.2-5.2L34 16zM20 36l4-24h4l-4 24h-4z"/></svg>`,
    };
    return svgMap[icon] || svgMap.code;
  };

  const downloadCertificate = (cert: Certificate) => {
    const avgStars = cert.totalStars / cert.totalLevels;
    const filledStars = Math.round(avgStars);
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
    const topicSVG = getTopicSVGForPDF(cert.topicIcon, cert.accentColor);

    // Generate star SVGs
    const starSVG = (filled: boolean) =>
      filled
        ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="#d4af37" stroke="#b8960f" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
        : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

    const starsHTML = [1, 2, 3].map((i) => starSVG(i <= filledStars)).join("");

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
              background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 20px;
              letter-spacing: -1px;
              border: 3px solid #c9a227;
              box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
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
              background: linear-gradient(135deg, ${cert.accentColor}08, ${cert.accentColor}15);
              border: 2px solid ${cert.accentColor}30;
              border-radius: 60px;
              margin-bottom: 20px;
            }
            
            .topic-name {
              font-family: 'Cormorant Garamond', serif;
              font-size: 28px;
              color: #2d2418;
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
            
            .achievement-label {
              font-size: 10px;
              color: #8b7355;
              text-transform: uppercase;
              letter-spacing: 3px;
            }
            
            .stats-row {
              display: flex;
              justify-content: center;
              gap: 60px;
              margin: 18px 0;
              padding: 14px 0;
              border-top: 1px solid #e8dcc8;
              border-bottom: 1px solid #e8dcc8;
            }
            
            .stat-item { text-align: center; }
            
            .stat-value {
              font-family: 'Cormorant Garamond', serif;
              font-size: 24px;
              color: #2d2418;
              font-weight: 600;
            }
            
            .stat-label {
              font-size: 9px;
              color: #8b7355;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-top: 2px;
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
                  ${topicSVG}
                  <span class="topic-name">${cert.topicName}</span>
                </div>
                
                <div class="awarded-text">This certificate is proudly presented to</div>
                <div class="recipient-name">${userName}</div>
                
                <div class="description">
                  For successfully completing all ${cert.totalLevels} levels of the ${cert.topicName} course,
                  demonstrating exceptional proficiency and dedication in mastering the fundamentals
                  and advanced concepts of ${cert.category} development.
                </div>
                
                <div class="stars-section">
                  ${starsHTML}
                </div>
                <div class="achievement-label">Achievement Rating</div>
                
                <div class="stats-row">
                  <div class="stat-item">
                    <div class="stat-value">${cert.totalLevels}</div>
                    <div class="stat-label">Levels Completed</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${cert.totalStars}/${cert.maxStars}</div>
                    <div class="stat-label">Stars Earned</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${cert.totalXpEarned.toLocaleString()}</div>
                    <div class="stat-label">XP Earned</div>
                  </div>
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

            {/* Search with animation */}
            {certificates.length > 0 && (
              <ScrollReveal delay={0.12}>
                <div
                  className={`relative mb-6 transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}
                >
                  <Search
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 z-10 ${searchFocused ? "text-purple-400" : "text-gray-500"}`}
                  />
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`w-full pl-11 pr-4 py-3 pixel-box text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${searchFocused ? "border-purple-500 shadow-lg shadow-purple-500/20" : ""}`}
                  />
                </div>
              </ScrollReveal>
            )}

            {/* Certificate Verification Checker */}
            <ScrollReveal delay={0.15}>
              <div className="mb-8 pixel-box p-5 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Verify Certificate
                    </h3>
                    <p className="text-xs text-gray-400">
                      Enter a certificate ID to verify its authenticity
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Enter certificate ID (e.g., CL-JAVA-A1B2C3D4)"
                      value={verifyCode}
                      onChange={(e) => {
                        setVerifyCode(e.target.value.toUpperCase());
                        setVerifyResult(null);
                      }}
                      className="w-full px-4 py-3 bg-[#0f0f1a] border-2 border-[#2d2d44] text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 font-mono text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!verifyCode.trim()) {
                        setVerifyResult({
                          valid: false,
                          message: "Please enter a certificate ID",
                        });
                        return;
                      }

                      // Check if the format is valid (CL-XXXX-XXXXXXXX)
                      const isValidFormat =
                        /^CL-[A-Z0-9]{2,6}-[A-Z0-9]{6,10}$/i.test(
                          verifyCode.trim(),
                        );
                      if (!isValidFormat) {
                        setVerifyResult({
                          valid: false,
                          message:
                            "Invalid certificate ID format. Valid IDs follow the pattern: CL-TOPIC-HASHCODE",
                        });
                        return;
                      }

                      // Check against real certificates
                      const matchingCert = certificates.find((cert) => {
                        const certId = generateCertificateId(
                          user?.id,
                          cert.topicId,
                          cert.completedAt,
                        );
                        return certId === verifyCode.trim();
                      });

                      if (matchingCert) {
                        const completionDate = matchingCert.completedAt
                          ? new Date(
                              matchingCert.completedAt,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Unknown";
                        setVerifyResult({
                          valid: true,
                          message: "Certificate verified successfully!",
                          certInfo: {
                            topic: matchingCert.topicName,
                            user:
                              user?.display_name || user?.username || "Student",
                            date: completionDate,
                          },
                        });
                      } else {
                        setVerifyResult({
                          valid: false,
                          message:
                            "Certificate not found. This certificate ID does not match any certificates in your account.",
                        });
                      }
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium transition-colors flex items-center gap-2"
                    style={{ boxShadow: "3px 3px 0 0 rgba(0,0,0,0.3)" }}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify
                  </button>
                </div>

                {verifyResult && (
                  <div
                    className={`mt-4 p-4 flex items-start gap-3 ${verifyResult.valid ? "bg-green-500/10 border-2 border-green-500/30" : "bg-red-500/10 border-2 border-red-500/30"}`}
                  >
                    {verifyResult.valid ? (
                      <svg
                        className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4" />
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${verifyResult.valid ? "text-green-400" : "text-red-400"}`}
                      >
                        {verifyResult.message}
                      </p>
                      {verifyResult.valid && verifyResult.certInfo && (
                        <div className="mt-2 space-y-1 text-xs text-gray-400">
                          <p>
                            <span className="text-gray-500">Topic:</span>{" "}
                            {verifyResult.certInfo.topic}
                          </p>
                          <p>
                            <span className="text-gray-500">Issued to:</span>{" "}
                            {verifyResult.certInfo.user}
                          </p>
                          <p>
                            <span className="text-gray-500">Completed:</span>{" "}
                            {verifyResult.certInfo.date}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

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
                              className="w-14 h-14 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor: `${cert.accentColor}20`,
                              }}
                            >
                              <TopicIcon icon={cert.topicIcon} size={32} />
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
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors hover:opacity-90"
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

                {/* Logo */}
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-base border-2 border-[#c9a227] shadow-lg">
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

                  {/* Topic Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
                    style={{
                      backgroundColor: `${selectedCert.accentColor}10`,
                      border: `2px solid ${selectedCert.accentColor}30`,
                    }}
                  >
                    <TopicIcon icon={selectedCert.topicIcon} size={24} />
                    <span className="text-base font-serif font-semibold text-[#2d2418]">
                      {selectedCert.topicName}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8b7355] tracking-wider mb-1 uppercase">
                    This certificate is proudly presented to
                  </p>
                  <p className="text-lg font-serif font-semibold text-[#2d2418] mb-3 pb-2 border-b-2 border-[#c9a227]/40 inline-block px-6">
                    {user?.display_name || user?.username || "Student"}
                  </p>

                  {/* Stars */}
                  <div className="my-3">
                    <div className="flex justify-center gap-1 mb-1">
                      {[1, 2, 3].map((star) => {
                        const avgStars =
                          selectedCert.totalStars / selectedCert.totalLevels;
                        return (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${star <= Math.round(avgStars) ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-300"}`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-[#8b7355] uppercase tracking-widest">
                      Achievement Rating
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-center gap-6 py-3 border-t border-b border-[#e8dcc8] my-3">
                    <div className="text-center">
                      <p className="text-base font-serif font-semibold text-[#2d2418]">
                        {selectedCert.totalLevels}
                      </p>
                      <p className="text-[9px] text-[#8b7355] uppercase tracking-wider">
                        Levels
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-serif font-semibold text-[#2d2418]">
                        {selectedCert.totalStars}/{selectedCert.maxStars}
                      </p>
                      <p className="text-[9px] text-[#8b7355] uppercase tracking-wider">
                        Stars
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-serif font-semibold text-[#2d2418]">
                        {selectedCert.totalXpEarned.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-[#8b7355] uppercase tracking-wider">
                        XP
                      </p>
                    </div>
                  </div>

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
                  className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => downloadCertificate(selectedCert)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-purple-700 hover:to-purple-800 transition-colors"
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
