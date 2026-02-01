"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import LoginOverlay from "@/components/auth/LoginOverlay";
import {
  ScrollReveal,
  ScrollProgressBar,
  ScrollToTop,
} from "@/components/ui/ScrollAnimations";
import { gameAPI } from "@/lib/api";
import {
  BookOpen,
  FileText,
  Search,
  Filter,
  Clock,
  Eye,
  Lock,
  Loader2,
  X,
  SlidersHorizontal,
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
  is_featured: boolean;
  created_at: string;
}

interface FiltersData {
  categories: string[];
  languages: string[];
}

const categoryLabels: { [key: string]: string } = {
  "web-development": "Web Development",
  programming: "Programming",
  data: "Data",
  mobile: "Mobile Development",
  devops: "DevOps",
  other: "Other",
};

export default function LearnPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [filters, setFilters] = useState<FiltersData>({
    categories: [],
    languages: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [selectedResourceSlug, setSelectedResourceSlug] = useState<
    string | null
  >(null);
  const { isAuthenticated } = useAuth();

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await gameAPI.getResources({
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        language: selectedLanguage !== "all" ? selectedLanguage : undefined,
      });

      setResources(response.data.resources);
      setFilters({
        categories: response.data.filters.categories || [],
        languages: response.data.filters.languages || [],
      });
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLanguage]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchResources();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchResources]);

  const handleResourceClick = (resourceSlug: string, e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setSelectedResourceSlug(resourceSlug);
      setShowLoginOverlay(true);
    }
  };

  const handleLoginClose = () => {
    setShowLoginOverlay(false);
    setSelectedResourceSlug(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLanguage("all");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedLanguage !== "all";

  return (
    <Navbar>
      <ScrollProgressBar />
      <ScrollToTop />
      <div className="min-h-screen pb-8">
        {/* Login Overlay */}
        <LoginOverlay
          isOpen={showLoginOverlay}
          onClose={handleLoginClose}
          message="Login to access our learning resources and track your progress!"
        />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Title */}
          <ScrollReveal animation="fade-up" delay={0}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-500" />
                Learning Library
              </h1>
              <p className="text-gray-400 mt-1">
                Browse our collection of programming guides and resources
              </p>
            </div>
          </ScrollReveal>

          {/* Search & Filters */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="pixel-box p-4 mb-8">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by title, description, or language..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-3 pl-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filter Toggle Button (Mobile) */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`md:hidden px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                      showFilters
                        ? "bg-purple-500/20 border-purple-500 text-purple-400"
                        : "border-[#2d2d44] text-gray-400 hover:border-purple-500"
                    }`}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Filters Row */}
                <div
                  className={`flex flex-col md:flex-row gap-4 ${
                    showFilters ? "block" : "hidden md:flex"
                  }`}
                >
                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500 hidden md:block" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 md:flex-none bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer appearance-none min-w-[160px]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        paddingRight: "36px",
                      }}
                    >
                      <option value="all">All Categories</option>
                      {[...new Set(filters.categories)].map((cat, index) => (
                        <option key={`cat-${index}-${cat}`} value={cat}>
                          {categoryLabels[cat] || cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Filter */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer appearance-none min-w-[160px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: "36px",
                    }}
                  >
                    <option value="all">All Languages</option>
                    {[...new Set(filters.languages)].map((lang, index) => (
                      <option key={`lang-${index}-${lang}`} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : resources.length > 0 ? (
            /* Resource Grid */
            <ScrollReveal
              animation="fade-up"
              stagger
              staggerDelay={50}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/learn/${resource.slug}`}
                  onClick={(e) => handleResourceClick(resource.slug, e)}
                  className="pixel-box overflow-hidden hover:border-purple-500/50 transition-colors group relative"
                >
                  {/* Lock overlay for non-authenticated users */}
                  {!isAuthenticated && (
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-[#1a1a2e] px-4 py-2 rounded-lg flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-sm font-medium">
                          Login to Read
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {resource.is_featured && (
                    <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                      Featured
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="h-32 bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center relative overflow-hidden">
                    {resource.thumbnail_url ? (
                      <img
                        src={resource.thumbnail_url}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-white/40" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-bold group-hover:text-purple-400 transition-colors line-clamp-1">
                        {resource.title}
                      </h3>
                    </div>

                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {resource.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{resource.pages} pages</span>
                      </div>
                      {resource.read_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{resource.read_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{resource.views.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Language Tag */}
                    <div className="mt-3 pt-3 border-t border-[#2d2d44]">
                      <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                        {resource.language}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </ScrollReveal>
          ) : (
            /* No Results */
            <ScrollReveal animation="scale">
              <div className="pixel-box p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No resources found
                </h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your search or filters
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Coming Soon Banner */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="pixel-box p-6 mt-8 border-purple-500/30 bg-purple-500/5 text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                More Resources Coming Soon!
              </h3>
              <p className="text-gray-400">
                We&apos;re constantly adding new programming guides and
                tutorials. Check back regularly for updates!
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Navbar>
  );
}
