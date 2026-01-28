"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import LoginOverlay from "@/components/auth/LoginOverlay";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Share2,
  Bookmark,
} from "lucide-react";

// Mock data for learning resources (same as learn page)
const learningResources: {
  [key: string]: {
    id: string;
    title: string;
    description: string;
    category: string;
    language: string;
    difficulty: string;
    pages: number;
    readTime: string;
    views: number;
    color: string;
    icon: string;
    content: { page: number; title: string; content: string }[];
  };
} = {
  "html-basics": {
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
    color: "from-orange-500 to-red-500",
    icon: "🌐",
    content: [
      {
        page: 1,
        title: "Introduction to HTML",
        content: `
# Introduction to HTML

HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page semantically.

## What is HTML?

- HTML stands for Hyper Text Markup Language
- HTML is the standard markup language for creating Web pages
- HTML describes the structure of a Web page
- HTML consists of a series of elements
- HTML elements tell the browser how to display the content

## A Simple HTML Document

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>
\`\`\`

## Example Explained

- \`<!DOCTYPE html>\` declaration defines that this document is an HTML5 document
- \`<html>\` element is the root element of an HTML page
- \`<head>\` element contains meta information about the HTML page
- \`<title>\` element specifies a title for the HTML page
- \`<body>\` element defines the document's body
- \`<h1>\` element defines a large heading
- \`<p>\` element defines a paragraph
      `,
      },
      {
        page: 2,
        title: "HTML Elements",
        content: `
# HTML Elements

An HTML element is defined by a start tag, some content, and an end tag.

## HTML Element Structure

\`\`\`
<tagname>Content goes here...</tagname>
\`\`\`

## Examples of HTML Elements

### Headings
\`\`\`html
<h1>This is heading 1</h1>
<h2>This is heading 2</h2>
<h3>This is heading 3</h3>
\`\`\`

### Paragraphs
\`\`\`html
<p>This is a paragraph.</p>
<p>This is another paragraph.</p>
\`\`\`

### Links
\`\`\`html
<a href="https://www.example.com">This is a link</a>
\`\`\`

### Images
\`\`\`html
<img src="image.jpg" alt="Description">
\`\`\`

## Nested HTML Elements

HTML elements can be nested (this means that elements can contain other elements).

\`\`\`html
<div>
    <h1>Welcome</h1>
    <p>This is a nested paragraph.</p>
</div>
\`\`\`
      `,
      },
      {
        page: 3,
        title: "HTML Attributes",
        content: `
# HTML Attributes

HTML attributes provide additional information about HTML elements.

## Key Points

- All HTML elements can have attributes
- Attributes provide additional information about elements
- Attributes are always specified in the start tag
- Attributes usually come in name/value pairs like: name="value"

## Common Attributes

### The href Attribute
\`\`\`html
<a href="https://www.example.com">Visit Example</a>
\`\`\`

### The src Attribute
\`\`\`html
<img src="image.jpg">
\`\`\`

### The width and height Attributes
\`\`\`html
<img src="image.jpg" width="500" height="600">
\`\`\`

### The alt Attribute
\`\`\`html
<img src="image.jpg" alt="A beautiful sunset">
\`\`\`

### The style Attribute
\`\`\`html
<p style="color:red;">This is a red paragraph.</p>
\`\`\`

### The id Attribute
\`\`\`html
<h1 id="header">My Header</h1>
\`\`\`

### The class Attribute
\`\`\`html
<p class="intro">This is an introduction.</p>
\`\`\`
      `,
      },
    ],
  },
  "css-styling": {
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
    color: "from-blue-500 to-cyan-500",
    icon: "🎨",
    content: [
      {
        page: 1,
        title: "Introduction to CSS",
        content: `
# Introduction to CSS

CSS (Cascading Style Sheets) is used to style and layout web pages.

## What is CSS?

- CSS stands for Cascading Style Sheets
- CSS describes how HTML elements are to be displayed on screen
- CSS saves a lot of work by controlling the layout of multiple web pages
- External stylesheets are stored in CSS files

## CSS Syntax

\`\`\`css
selector {
    property: value;
}
\`\`\`

## Example

\`\`\`css
body {
    background-color: lightblue;
}

h1 {
    color: navy;
    text-align: center;
}

p {
    font-family: verdana;
    font-size: 20px;
}
\`\`\`

## Three Ways to Insert CSS

1. **External CSS** - Using a separate .css file
2. **Internal CSS** - Using a <style> element in the <head>
3. **Inline CSS** - Using the style attribute
      `,
      },
      {
        page: 2,
        title: "CSS Selectors",
        content: `
# CSS Selectors

CSS selectors are used to "find" (or select) the HTML elements you want to style.

## Types of Selectors

### Element Selector
\`\`\`css
p {
    color: red;
}
\`\`\`

### ID Selector
\`\`\`css
#myId {
    color: blue;
}
\`\`\`

### Class Selector
\`\`\`css
.myClass {
    color: green;
}
\`\`\`

### Universal Selector
\`\`\`css
* {
    margin: 0;
    padding: 0;
}
\`\`\`

### Grouping Selector
\`\`\`css
h1, h2, p {
    text-align: center;
}
\`\`\`

## Combinator Selectors

\`\`\`css
/* Descendant selector */
div p { color: blue; }

/* Child selector */
div > p { color: red; }

/* Adjacent sibling */
div + p { color: green; }

/* General sibling */
div ~ p { color: yellow; }
\`\`\`
      `,
      },
    ],
  },
  "javascript-essentials": {
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
    color: "from-yellow-400 to-orange-500",
    icon: "⚡",
    content: [
      {
        page: 1,
        title: "Introduction to JavaScript",
        content: `
# Introduction to JavaScript

JavaScript is the programming language of the Web.

## What is JavaScript?

- JavaScript is the world's most popular programming language
- JavaScript is the programming language of the Web
- JavaScript is easy to learn
- JavaScript can change HTML content, styles, and attributes

## JavaScript Example

\`\`\`javascript
// Change HTML content
document.getElementById("demo").innerHTML = "Hello JavaScript!";

// Change HTML attribute
document.getElementById("image").src = "picture.gif";

// Change CSS style
document.getElementById("demo").style.fontSize = "35px";
\`\`\`

## Where To Place JavaScript

JavaScript code must be inserted between <script> tags:

\`\`\`html
<script>
document.getElementById("demo").innerHTML = "My First JavaScript";
</script>
\`\`\`

Or in external files:

\`\`\`html
<script src="myScript.js"></script>
\`\`\`
      `,
      },
      {
        page: 2,
        title: "Variables & Data Types",
        content: `
# Variables & Data Types

JavaScript variables are containers for storing data values.

## Declaring Variables

\`\`\`javascript
// Using var (old way)
var x = 5;

// Using let (block-scoped)
let y = 10;

// Using const (constant)
const PI = 3.14159;
\`\`\`

## Data Types

### Primitive Types
\`\`\`javascript
// String
let name = "John";

// Number
let age = 25;
let price = 19.99;

// Boolean
let isActive = true;

// Undefined
let x;

// Null
let y = null;

// Symbol (ES6)
let sym = Symbol("id");

// BigInt (ES2020)
let bigNum = 1234567890123456789012345678901234567890n;
\`\`\`

### Reference Types
\`\`\`javascript
// Object
let person = { name: "John", age: 25 };

// Array
let colors = ["red", "green", "blue"];

// Function
function greet() {
    return "Hello!";
}
\`\`\`
      `,
      },
    ],
  },
  "python-programming": {
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
    color: "from-green-500 to-teal-500",
    icon: "🐍",
    content: [
      {
        page: 1,
        title: "Introduction to Python",
        content: `
# Introduction to Python

Python is a popular programming language created by Guido van Rossum in 1991.

## What can Python do?

- Web development (server-side)
- Software development
- Mathematics
- System scripting
- Data science and machine learning

## Why Python?

- Works on different platforms (Windows, Mac, Linux, etc.)
- Has a simple syntax similar to English
- Allows developers to write programs with fewer lines
- Runs on an interpreter system, meaning code can be executed immediately
- Can be treated in a procedural, object-oriented, or functional way

## Python Syntax

\`\`\`python
# This is a comment
print("Hello, World!")

# Variables
x = 5
y = "Hello"

# Print variable
print(x)
print(y)
\`\`\`

## Python Indentation

Python uses indentation to indicate a block of code:

\`\`\`python
if 5 > 2:
    print("Five is greater than two!")
\`\`\`
      `,
      },
      {
        page: 2,
        title: "Python Variables",
        content: `
# Python Variables

Variables are containers for storing data values.

## Creating Variables

\`\`\`python
x = 5
y = "John"
print(x)
print(y)
\`\`\`

## Variable Names

- Must start with a letter or underscore
- Cannot start with a number
- Can only contain alphanumeric characters and underscores
- Are case-sensitive

\`\`\`python
# Valid variable names
myvar = "John"
my_var = "John"
_my_var = "John"
myVar = "John"
MYVAR = "John"
myvar2 = "John"
\`\`\`

## Multiple Values

\`\`\`python
# Many values to multiple variables
x, y, z = "Orange", "Banana", "Cherry"

# One value to multiple variables
x = y = z = "Orange"

# Unpack a collection
fruits = ["apple", "banana", "cherry"]
x, y, z = fruits
\`\`\`

## Global Variables

\`\`\`python
x = "awesome"  # Global variable

def myfunc():
    print("Python is " + x)

myfunc()
\`\`\`
      `,
      },
    ],
  },
};

// Default content for resources without detailed content
const defaultContent = [
  {
    page: 1,
    title: "Coming Soon",
    content: `
# Content Coming Soon

This learning resource is currently being developed.

Check back soon for comprehensive content on this topic!

## What to Expect

- Detailed explanations
- Code examples
- Practice exercises
- Quizzes to test your knowledge

Stay tuned! 📚
  `,
  },
];

export default function LearnResourcePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const resourceId = params.id as string;
  const resource = learningResources[resourceId];

  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  const content = resource?.content || defaultContent;
  const totalPages = content.length;
  const currentContent = content[currentPage - 1];

  useEffect(() => {
    // Reset page when resource changes
    setCurrentPage(1);
  }, [resourceId]);

  // Show login overlay if not authenticated (after loading completes)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowLoginOverlay(true);
    }
  }, [authLoading, isAuthenticated]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    if (zoom < 150) setZoom(zoom + 10);
  };

  const zoomOut = () => {
    if (zoom > 70) setZoom(zoom - 10);
  };

  if (!resource) {
    return (
      <Navbar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="pixel-box p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Resource Not Found
            </h2>
            <p className="text-gray-400 mb-4">
              This learning resource doesn&apos;t exist.
            </p>
            <Link href="/learn" className="btn-primary px-6 py-2 inline-block">
              Back to Library
            </Link>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      {/* Login Overlay for unauthenticated users */}
      <LoginOverlay
        isOpen={showLoginOverlay}
        onClose={() => setShowLoginOverlay(false)}
        message="Sign in to read learning materials and track your progress."
      />

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-[#2d2d44] bg-[#1a1a2e]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/learn"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <span className="text-sm font-bold text-white block">
                  {resource.title}
                </span>
                <span className="text-xs text-gray-400">
                  {resource.language}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 transition-colors ${isBookmarked ? "text-yellow-400" : "text-gray-400 hover:text-white"}`}
              >
                <Bookmark
                  className="w-5 h-5"
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="border-b border-[#2d2d44] bg-[#151525]">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-400">
                Page <span className="text-white">{currentPage}</span> of{" "}
                <span className="text-white">{totalPages}</span>
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                disabled={zoom <= 70}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-400 w-12 text-center">
                {zoom}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoom >= 150}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors ml-2">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto bg-[#0a0a12]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div
              className="pixel-box p-8 bg-[#1a1a2e] prose prose-invert max-w-none"
              style={{ fontSize: `${zoom}%` }}
            >
              {/* Chapter Title */}
              <div className="mb-6 pb-4 border-b border-[#2d2d44]">
                <span className="text-purple-400 text-sm font-medium">
                  Chapter {currentPage}
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">
                  {currentContent.title}
                </h1>
              </div>

              {/* Content - rendered as formatted text */}
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
                {currentContent.content.split("```").map((part, index) => {
                  if (index % 2 === 1) {
                    // Code block
                    const lines = part.split("\n");
                    const language = lines[0];
                    const code = lines.slice(1).join("\n");
                    return (
                      <pre
                        key={index}
                        className="bg-[#0f0f1a] p-4 my-4 overflow-x-auto border border-[#2d2d44]"
                      >
                        <code className="text-green-400">{code}</code>
                      </pre>
                    );
                  }
                  // Regular text - handle markdown-like formatting
                  return (
                    <div key={index}>
                      {part.split("\n").map((line, lineIndex) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h2
                              key={lineIndex}
                              className="text-2xl font-bold text-white mt-6 mb-4"
                            >
                              {line.slice(2)}
                            </h2>
                          );
                        }
                        if (line.startsWith("## ")) {
                          return (
                            <h3
                              key={lineIndex}
                              className="text-xl font-bold text-white mt-5 mb-3"
                            >
                              {line.slice(3)}
                            </h3>
                          );
                        }
                        if (line.startsWith("### ")) {
                          return (
                            <h4
                              key={lineIndex}
                              className="text-lg font-bold text-white mt-4 mb-2"
                            >
                              {line.slice(4)}
                            </h4>
                          );
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <li key={lineIndex} className="ml-4 text-gray-300">
                              {line.slice(2)}
                            </li>
                          );
                        }
                        if (line.includes("`") && !line.includes("```")) {
                          const parts = line.split("`");
                          return (
                            <p key={lineIndex} className="text-gray-300 my-2">
                              {parts.map((p, i) =>
                                i % 2 === 1 ? (
                                  <code
                                    key={i}
                                    className="bg-[#0f0f1a] px-1 text-purple-400"
                                  >
                                    {p}
                                  </code>
                                ) : (
                                  p
                                ),
                              )}
                            </p>
                          );
                        }
                        if (line.trim() === "") {
                          return <br key={lineIndex} />;
                        }
                        return (
                          <p key={lineIndex} className="text-gray-300 my-2">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-[#2d2d44] bg-[#1a1a2e]">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-purple-500 text-white"
                      : "bg-[#0f0f1a] text-gray-400 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
