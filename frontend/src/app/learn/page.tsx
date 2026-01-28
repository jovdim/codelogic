"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import LoginOverlay from "@/components/auth/LoginOverlay";
import {
  BookOpen,
  FileText,
  Search,
  Filter,
  Clock,
  Eye,
  Lock,
} from "lucide-react";

// Mock data for learning resources
const learningResources = [
  {
    id: "html-basics",
    title: "HTML Fundamentals",
    description:
      "Learn the building blocks of web pages - tags, elements, and structure.",
    category: "Web Development",
    language: "HTML",
    difficulty: "Beginner",
    pages: 45,
    readTime: "2 hours",
    views: 12453,
    thumbnail: "/thumbnails/html.png",
    color: "from-orange-500 to-red-500",
    icon: "🌐",
  },
  {
    id: "css-styling",
    title: "CSS Mastery",
    description:
      "Master styling with selectors, flexbox, grid, and animations.",
    category: "Web Development",
    language: "CSS",
    difficulty: "Beginner",
    pages: 62,
    readTime: "3 hours",
    views: 10892,
    thumbnail: "/thumbnails/css.png",
    color: "from-blue-500 to-cyan-500",
    icon: "🎨",
  },
  {
    id: "javascript-essentials",
    title: "JavaScript Essentials",
    description:
      "Variables, functions, DOM manipulation, and modern ES6+ features.",
    category: "Web Development",
    language: "JavaScript",
    difficulty: "Intermediate",
    pages: 120,
    readTime: "6 hours",
    views: 18234,
    thumbnail: "/thumbnails/javascript.png",
    color: "from-yellow-400 to-orange-500",
    icon: "⚡",
  },
  {
    id: "python-programming",
    title: "Python Programming",
    description:
      "From basics to advanced concepts - loops, functions, OOP, and more.",
    category: "Programming",
    language: "Python",
    difficulty: "Beginner",
    pages: 95,
    readTime: "5 hours",
    views: 22156,
    thumbnail: "/thumbnails/python.png",
    color: "from-green-500 to-teal-500",
    icon: "🐍",
  },
  {
    id: "react-framework",
    title: "React Development",
    description:
      "Components, hooks, state management, and building modern UIs.",
    category: "Web Development",
    language: "React",
    difficulty: "Intermediate",
    pages: 88,
    readTime: "4 hours",
    views: 15678,
    thumbnail: "/thumbnails/react.png",
    color: "from-cyan-400 to-blue-500",
    icon: "⚛️",
  },
  {
    id: "java-fundamentals",
    title: "Java Fundamentals",
    description:
      "Object-oriented programming, classes, inheritance, and polymorphism.",
    category: "Programming",
    language: "Java",
    difficulty: "Intermediate",
    pages: 110,
    readTime: "5.5 hours",
    views: 9845,
    thumbnail: "/thumbnails/java.png",
    color: "from-red-500 to-orange-600",
    icon: "☕",
  },
  {
    id: "sql-databases",
    title: "SQL & Databases",
    description: "Queries, joins, indexes, and database design fundamentals.",
    category: "Data",
    language: "SQL",
    difficulty: "Beginner",
    pages: 55,
    readTime: "2.5 hours",
    views: 8932,
    thumbnail: "/thumbnails/sql.png",
    color: "from-indigo-500 to-purple-600",
    icon: "🗄️",
  },
  {
    id: "typescript-guide",
    title: "TypeScript Complete Guide",
    description:
      "Types, interfaces, generics, and building type-safe applications.",
    category: "Web Development",
    language: "TypeScript",
    difficulty: "Intermediate",
    pages: 78,
    readTime: "4 hours",
    views: 11234,
    thumbnail: "/thumbnails/typescript.png",
    color: "from-blue-600 to-blue-800",
    icon: "📘",
  },
];

const categories = ["All", "Web Development", "Programming", "Data"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const filteredResources = learningResources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.language.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" ||
      resource.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleResourceClick = (resourceId: string, e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setSelectedResourceId(resourceId);
      setShowLoginOverlay(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginOverlay(false);
    if (selectedResourceId) {
      router.push(`/learn/${selectedResourceId}`);
    }
  };

  return (
    <Navbar>
      <div className="min-h-screen pb-8">
        {/* Login Overlay */}
        <LoginOverlay
          isOpen={showLoginOverlay}
          onClose={handleLoginSuccess}
          message="Login to access our learning resources and track your progress!"
        />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-500" />
              Learning Library
            </h1>
            <p className="text-gray-400 mt-1">
              Browse our collection of programming guides and resources
            </p>
          </div>

          {/* Search & Filters */}
          <div className="pixel-box p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-[#2d2d44] px-4 py-2 pl-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#0f0f1a] border border-[#2d2d44] px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-[#0f0f1a] border border-[#2d2d44] px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => (
              <Link
                key={resource.id}
                href={`/learn/${resource.id}`}
                onClick={(e) => handleResourceClick(resource.id, e)}
                className="pixel-box overflow-hidden hover:border-purple-500/50 transition-colors group relative"
              >
                {/* Lock overlay for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#1a1a2e] px-4 py-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm font-medium">
                        Login to Read
                      </span>
                    </div>
                  </div>
                )}

                {/* Thumbnail */}
                <div
                  className={`h-32 bg-gradient-to-br ${resource.color} flex items-center justify-center relative overflow-hidden`}
                >
                  <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform">
                    {resource.icon}
                  </span>
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Difficulty Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium ${
                      resource.difficulty === "Beginner"
                        ? "bg-green-500"
                        : resource.difficulty === "Intermediate"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    } text-white`}
                  >
                    {resource.difficulty}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-bold group-hover:text-purple-400 transition-colors">
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
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{resource.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{resource.views.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Language Tag */}
                  <div className="mt-3 pt-3 border-t border-[#2d2d44]">
                    <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium">
                      {resource.language}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredResources.length === 0 && (
            <div className="pixel-box p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No resources found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Coming Soon Banner */}
          <div className="pixel-box p-6 mt-8 border-purple-500/30 bg-purple-500/5 text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              📚 More Resources Coming Soon!
            </h3>
            <p className="text-gray-400">
              We&apos;re constantly adding new programming guides and tutorials.
              Check back regularly for updates!
            </p>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
