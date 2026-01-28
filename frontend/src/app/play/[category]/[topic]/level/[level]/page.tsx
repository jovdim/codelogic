"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import {
  Heart,
  Zap,
  X,
  Check,
  Trophy,
  ArrowRight,
  RotateCcw,
  Clock,
  Star,
  Circle,
  Minus,
} from "lucide-react";

// Syntax highlighting function
const highlightCode = (code: string): ReactNode[] => {
  const tokens: { type: string; value: string }[] = [];
  let remaining = code;

  const patterns: [RegExp, string][] = [
    [/^(\/\/.*?)(?=\n|$)/, "comment"],
    [/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, "string"],
    [/^(\d+\.?\d*)/, "number"],
    [/^(const|let|var|function|return|if|else|for|while|class|new|this|typeof|instanceof|try|catch|throw|async|await|import|export|from|default)\b/, "keyword"],
    [/^(true|false|null|undefined|NaN|Infinity)\b/, "boolean"],
    [/^(console|document|window|Math|Array|Object|String|Number|Boolean|Date|JSON|Promise)\b/, "builtin"],
    [/^(\.\s*)(log|push|pop|map|filter|reduce|forEach|find|indexOf|slice|splice|join|split|toString|parse|stringify)\b/, "method"],
    [/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/, "function"],
    [/^([a-zA-Z_$][a-zA-Z0-9_$]*)/, "identifier"],
    [/^(===|!==|==|!=|<=|>=|=>|&&|\|\||[+\-*/%=<>!&|^~?:])/, "operator"],
    [/^([{}[\]();,\.])/, "punctuation"],
    [/^(\s+)/, "whitespace"],
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const [pattern, type] of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        const value = type === "method" ? match[0] : match[1];
        if (type === "method") {
          tokens.push({ type: "punctuation", value: match[1] });
          tokens.push({ type: "method", value: match[2] });
        } else {
          tokens.push({ type, value });
        }
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "text", value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  const colorMap: { [key: string]: string } = {
    keyword: "text-purple-400",
    string: "text-green-400",
    number: "text-orange-400",
    boolean: "text-yellow-400",
    comment: "text-gray-500 italic",
    builtin: "text-cyan-400",
    method: "text-blue-400",
    function: "text-blue-400",
    operator: "text-pink-400",
    punctuation: "text-gray-400",
    identifier: "text-white",
    whitespace: "",
    text: "text-gray-300",
  };

  return tokens.map((token, i) => (
    <span key={i} className={colorMap[token.type] || "text-gray-300"}>
      {token.value}
    </span>
  ));
};

// Question types
type QuestionType = "multiple-choice" | "find-error" | "fill-blank" | "output";

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  highlightLine?: number;
}

// JavaScript questions organized by level
const levelQuestions: { [key: number]: Question[] } = {
  1: [
    // Level 1: Basics
    {
      id: 1,
      type: "multiple-choice",
      question: "What is JavaScript primarily used for?",
      options: [
        "Styling web pages",
        "Adding interactivity to websites",
        "Creating databases",
        "Designing layouts",
      ],
      correctAnswer: 1,
      explanation:
        "JavaScript is primarily used to add interactivity and dynamic behavior to websites.",
    },
    {
      id: 2,
      type: "find-error",
      question: "What is wrong with this code?",
      code: `console.log("Hello World)`,
      options: [
        "Missing semicolon",
        "Missing closing quote",
        "Wrong function name",
        "Nothing is wrong",
      ],
      correctAnswer: 1,
      explanation:
        'The string is missing a closing quotation mark. It should be: console.log("Hello World")',
      highlightLine: 1,
    },
    {
      id: 3,
      type: "output",
      question: "What will this code output?",
      code: `console.log(2 + 2);`,
      options: ["22", "4", '"2 + 2"', "Error"],
      correctAnswer: 1,
      explanation:
        "JavaScript performs arithmetic addition, so 2 + 2 equals 4.",
    },
    {
      id: 4,
      type: "multiple-choice",
      question: "Which keyword is used to declare a variable in modern JavaScript?",
      options: ["var", "let", "const", "Both let and const"],
      correctAnswer: 3,
      explanation:
        "Both 'let' and 'const' are used in modern JavaScript. 'let' for variables that can change, 'const' for constants.",
    },
    {
      id: 5,
      type: "find-error",
      question: "Find the syntax error in this code:",
      code: `let message = "Hello";
console.log(mesage);`,
      options: [
        "Missing semicolon",
        "Variable name is misspelled",
        "Wrong quotes used",
        "console.log is wrong",
      ],
      correctAnswer: 1,
      explanation:
        'The variable is declared as "message" but called as "mesage" (missing an s).',
      highlightLine: 2,
    },
  ],
  2: [
    // Level 2: Variables
    {
      id: 1,
      type: "find-error",
      question: "What's wrong with this variable declaration?",
      code: `const age = 25;
age = 26;`,
      options: [
        "Can't use numbers",
        "const variables cannot be reassigned",
        "Missing semicolon",
        "Variable name is invalid",
      ],
      correctAnswer: 1,
      explanation:
        "Variables declared with 'const' cannot be reassigned. Use 'let' if you need to change the value.",
      highlightLine: 2,
    },
    {
      id: 2,
      type: "output",
      question: "What will this code output?",
      code: `let x = 10;
let y = "10";
console.log(x == y);`,
      options: ["true", "false", "Error", "undefined"],
      correctAnswer: 0,
      explanation:
        "The == operator performs type coercion, so '10' (string) is converted to 10 (number), making them equal.",
    },
    {
      id: 3,
      type: "find-error",
      question: "Find the error in this code:",
      code: `let 2fast = "car";
console.log(2fast);`,
      options: [
        "Missing quotes",
        "Variable names cannot start with a number",
        "Wrong keyword",
        "Syntax is correct",
      ],
      correctAnswer: 1,
      explanation:
        "Variable names in JavaScript cannot start with a number. Use: let fast2 or let _2fast instead.",
      highlightLine: 1,
    },
    {
      id: 4,
      type: "output",
      question: "What will be logged?",
      code: `let name;
console.log(name);`,
      options: ["null", "undefined", '""', "Error"],
      correctAnswer: 1,
      explanation:
        "Variables declared but not initialized have the value 'undefined'.",
    },
    {
      id: 5,
      type: "multiple-choice",
      question: "Which is the correct way to create a constant?",
      options: [
        "constant PI = 3.14",
        "const PI = 3.14",
        "let const PI = 3.14",
        "var const PI = 3.14",
      ],
      correctAnswer: 1,
      explanation: "The 'const' keyword is used to declare constants in JavaScript.",
    },
  ],
  3: [
    // Level 3: Data Types
    {
      id: 1,
      type: "output",
      question: "What will typeof return?",
      code: `console.log(typeof []);`,
      options: ['"array"', '"object"', '"list"', '"undefined"'],
      correctAnswer: 1,
      explanation:
        "In JavaScript, arrays are technically objects, so typeof [] returns 'object'.",
    },
    {
      id: 2,
      type: "find-error",
      question: "What's wrong with this code?",
      code: `let isActive = "true";
if (isActive === true) {
  console.log("Active");
}`,
      options: [
        'Nothing, it will log "Active"',
        '"true" (string) is not equal to true (boolean)',
        "if syntax is wrong",
        "Missing semicolons",
      ],
      correctAnswer: 1,
      explanation:
        '"true" is a string, not a boolean. Use: let isActive = true; (without quotes)',
      highlightLine: 1,
    },
    {
      id: 3,
      type: "output",
      question: "What will this output?",
      code: `console.log(typeof null);`,
      options: ['"null"', '"undefined"', '"object"', '"empty"'],
      correctAnswer: 2,
      explanation:
        "This is a known JavaScript quirk. typeof null returns 'object' even though null is not an object.",
    },
    {
      id: 4,
      type: "output",
      question: "What is the result?",
      code: `console.log("5" + 3);`,
      options: ["8", '"53"', "Error", "NaN"],
      correctAnswer: 1,
      explanation:
        "When using + with a string, JavaScript converts the number to a string and concatenates them.",
    },
    {
      id: 5,
      type: "find-error",
      question: "Find the issue:",
      code: `let data = {
  name: "John"
  age: 30
};`,
      options: [
        "Missing comma between properties",
        "Wrong brackets",
        "Invalid property names",
        "Code is correct",
      ],
      correctAnswer: 0,
      explanation:
        "Object properties must be separated by commas. Add a comma after \"John\".",
      highlightLine: 2,
    },
  ],
  4: [
    // Level 4: Operators
    {
      id: 1,
      type: "output",
      question: "What will this output?",
      code: `console.log(5 === "5");`,
      options: ["true", "false", "Error", "undefined"],
      correctAnswer: 1,
      explanation:
        "The === operator checks both value AND type. 5 (number) is not the same type as '5' (string).",
    },
    {
      id: 2,
      type: "output",
      question: "What is the result?",
      code: `let x = 10;
console.log(x++);
console.log(x);`,
      options: ["10, 10", "11, 11", "10, 11", "11, 12"],
      correctAnswer: 2,
      explanation:
        "x++ returns the value THEN increments. So first log shows 10, then x becomes 11.",
    },
    {
      id: 3,
      type: "output",
      question: "What will be logged?",
      code: `console.log(true && false);`,
      options: ["true", "false", "1", "0"],
      correctAnswer: 1,
      explanation:
        "The && (AND) operator returns true only if BOTH sides are true. Since false is present, result is false.",
    },
    {
      id: 4,
      type: "find-error",
      question: "What's the bug here?",
      code: `let a = 5;
let b = 10;
if (a = b) {
  console.log("Equal");
}`,
      options: [
        "Nothing wrong",
        "Using = instead of == or ===",
        "Missing brackets",
        "Wrong variable names",
      ],
      correctAnswer: 1,
      explanation:
        "Using = assigns the value instead of comparing. Use == or === for comparison.",
      highlightLine: 3,
    },
    {
      id: 5,
      type: "output",
      question: "What does this return?",
      code: `console.log(10 % 3);`,
      options: ["3", "3.33", "1", "0"],
      correctAnswer: 2,
      explanation:
        "The % (modulo) operator returns the remainder. 10 divided by 3 is 3 remainder 1.",
    },
  ],
  5: [
    // Level 5: Checkpoint
    {
      id: 1,
      type: "find-error",
      question: "Fix this code:",
      code: `const greet = (name) {
  return "Hello " + name;
}`,
      options: [
        "Missing => for arrow function",
        "Missing function keyword",
        "Both A and B could fix it",
        "Code is correct",
      ],
      correctAnswer: 2,
      explanation:
        "This needs either 'function' keyword: function greet(name) or arrow syntax: const greet = (name) =>",
      highlightLine: 1,
    },
    {
      id: 2,
      type: "output",
      question: "What will this log?",
      code: `let arr = [1, 2, 3];
console.log(arr[3]);`,
      options: ["3", "null", "undefined", "Error"],
      correctAnswer: 2,
      explanation:
        "Array index 3 doesn't exist (arrays are 0-indexed). Accessing non-existent indices returns undefined.",
    },
    {
      id: 3,
      type: "find-error",
      question: "What's wrong here?",
      code: `for (let i = 0, i < 5, i++) {
  console.log(i);
}`,
      options: [
        "Wrong variable name",
        "Commas should be semicolons",
        "Missing brackets",
        "i++ is wrong",
      ],
      correctAnswer: 1,
      explanation:
        "for loop parts must be separated by semicolons, not commas: for (let i = 0; i < 5; i++)",
      highlightLine: 1,
    },
    {
      id: 4,
      type: "output",
      question: "What's the output?",
      code: `const obj = { a: 1, b: 2 };
const { a, c = 3 } = obj;
console.log(c);`,
      options: ["undefined", "2", "3", "Error"],
      correctAnswer: 2,
      explanation:
        "Destructuring with default value: since 'c' doesn't exist in obj, it uses the default value 3.",
    },
    {
      id: 5,
      type: "find-error",
      question: "Find the bug:",
      code: `function add(a, b) {
  a + b;
}
console.log(add(2, 3));`,
      options: [
        "Missing return statement",
        "Wrong function syntax",
        "Parameters are wrong",
        "Code is correct",
      ],
      correctAnswer: 0,
      explanation:
        "The function calculates a + b but doesn't return it. Add: return a + b;",
      highlightLine: 2,
    },
    {
      id: 6,
      type: "output",
      question: "What does this return?",
      code: `console.log([1, 2] + [3, 4]);`,
      options: ["[1, 2, 3, 4]", '"1,23,4"', "Error", "[1, 2, [3, 4]]"],
      correctAnswer: 1,
      explanation:
        "Arrays are converted to strings when using +. [1,2] becomes '1,2' and [3,4] becomes '3,4'.",
    },
    {
      id: 7,
      type: "find-error",
      question: "What's the issue?",
      code: `const nums = [1, 2, 3];
nums.push(4);
nums = [5, 6];`,
      options: [
        "Can't use push on const",
        "Can't reassign const variable",
        "push syntax is wrong",
        "Array syntax is wrong",
      ],
      correctAnswer: 1,
      explanation:
        "const prevents reassignment, but you CAN modify the array contents. Line 3 tries to reassign, which fails.",
      highlightLine: 3,
    },
  ],
};

// Default questions for levels without specific data
const defaultQuestions: Question[] = [
  {
    id: 1,
    type: "multiple-choice",
    question: "This level's questions are coming soon!",
    options: ["Got it!", "Okay!", "Can't wait!", "Awesome!"],
    correctAnswer: 0,
    explanation: "More questions are being added. Check back soon!",
  },
];

export default function LevelQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const categoryId = params.category as string;
  const topicId = params.topic as string;
  const levelId = parseInt(params.level as string) || 1;

  const questions = levelQuestions[levelId] || defaultQuestions;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xpEarned, setXpEarned] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const question = questions[currentQuestion];
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Timer
  useEffect(() => {
    if (isAnswered || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, showResult, currentQuestion]);

  const handleTimeout = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
      setSelectedAnswer(-1);
      setHearts((prev) => Math.max(0, prev - 1));
      setStreak(0);
    }
  }, [isAnswered]);

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (answerIndex === question.correctAnswer) {
      const baseXP = 50;
      const streakBonus = streak * 5;
      const timeBonus = Math.floor(timeLeft / 3) * 2;
      const earnedXP = baseXP + streakBonus + timeBonus;

      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + earnedXP);
      setStreak((prev) => prev + 1);
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (hearts <= 0) {
      setShowResult(true);
      return;
    }

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setHearts(5);
    setXpEarned(0);
    setShowResult(false);
    setStreak(0);
    setTimeLeft(30);
  };

  // Calculate stars
  const getStars = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Out of hearts
  if (hearts <= 0 && !showResult) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-sm w-full text-center border border-[#2d2d44]">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Out of Hearts!</h2>
            <p className="text-gray-400 text-sm mb-6">
              You've run out of hearts. Try again later or restart.
            </p>
            <div className="bg-[#0f0f1a] rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Score</span>
                <span className="text-white">
                  {score}/{totalQuestions}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">XP Earned</span>
                <span className="text-yellow-400">+{xpEarned}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="flex-1 py-2.5 bg-[#2d2d44] text-white rounded-lg font-medium"
              >
                Exit
              </Link>
              <button
                onClick={restartQuiz}
                className="flex-1 py-2.5 bg-purple-500 text-white rounded-lg font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Results screen
  if (showResult) {
    const stars = getStars();
    const passed = stars >= 1;

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-sm w-full text-center border border-[#2d2d44]">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed ? "bg-yellow-500/20" : "bg-gray-500/20"
              }`}
            >
              <Trophy
                className={`w-8 h-8 ${passed ? "text-yellow-400" : "text-gray-500"}`}
              />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              {passed ? "Level Complete!" : "Try Again"}
            </h2>
            <p className="text-gray-400 text-sm mb-4">Level {levelId}</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= stars
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-700"
                  }`}
                />
              ))}
            </div>

            <div className="bg-[#0f0f1a] rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Score</span>
                <span className="text-white">
                  {score}/{totalQuestions}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Accuracy</span>
                <span className="text-white">
                  {Math.round((score / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[#2d2d44]">
                <span className="text-gray-400">XP Earned</span>
                <span className="text-yellow-400 font-bold">+{xpEarned}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={restartQuiz}
                className="flex-1 py-2.5 bg-[#2d2d44] text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="flex-1 py-2.5 bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f0f1a]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0f0f1a] border-b border-[#2d2d44]">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Link
                href={`/play/${categoryId}/${topicId}`}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3">
                {/* Timer */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                    timeLeft <= 10
                      ? "bg-red-500/20 text-red-400"
                      : "bg-[#1a1a2e] text-gray-400"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{timeLeft}s</span>
                </div>

                {/* Hearts */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-5 h-5 ${
                        i < hearts ? "text-red-500 fill-red-500" : "text-gray-700"
                      }`}
                    />
                  ))}
                </div>

                {/* XP */}
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">
                    {xpEarned}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {question.type === "find-error" && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  Find the Error
                </span>
              )}
              {question.type === "output" && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  What's the Output?
                </span>
              )}
              {question.type === "fill-blank" && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Fill in the Blank
                </span>
              )}
              <span className="text-gray-500 text-sm">
                {currentQuestion + 1} / {totalQuestions}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{question.question}</h2>
          </div>

          {/* Code Block - Terminal Style */}
          {question.code && (
            <div className="mb-6 rounded-xl overflow-hidden border border-[#2d2d44] shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e2e]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-3 h-3 text-red-500 fill-red-500" />
                    <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#0d0d14] rounded-md">
                  <span className="text-xs text-gray-500 font-medium">script.js</span>
                </div>
                <div className="w-12" />
              </div>
              
              {/* Code Content */}
              <div className="bg-[#0d0d14] p-4 font-mono text-sm overflow-x-auto">
                {question.code.split("\n").map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start leading-6 ${
                      question.highlightLine === idx + 1 && isAnswered
                        ? selectedAnswer === question.correctAnswer
                          ? "bg-green-500/10 -mx-4 px-4 border-l-2 border-green-500"
                          : "bg-red-500/10 -mx-4 px-4 border-l-2 border-red-500"
                        : ""
                    }`}
                  >
                    <span className="w-8 text-gray-600 select-none text-right pr-4 shrink-0">
                      {idx + 1}
                    </span>
                    <code className="flex-1">{highlightCode(line)}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correctAnswer;
              const isSelected = selectedAnswer === index;
              const showCorrect = isAnswered && isCorrect;
              const showWrong = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    showCorrect
                      ? "bg-green-500/10 border-green-500 text-green-400"
                      : showWrong
                        ? "bg-red-500/10 border-red-500 text-red-400"
                        : isSelected
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "bg-[#1a1a2e] border-[#2d2d44] text-gray-300 hover:border-[#3d3d5c]"
                  } ${isAnswered && !isSelected && !isCorrect ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold ${
                          showCorrect
                            ? "bg-green-500/20"
                            : showWrong
                              ? "bg-red-500/20"
                              : "bg-[#0f0f1a]"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium">{option}</span>
                    </div>
                    {showCorrect && <Check className="w-5 h-5" />}
                    {showWrong && <X className="w-5 h-5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="bg-[#1a1a2e] rounded-xl p-4 mb-6 border border-[#2d2d44]">
              <h4
                className={`font-bold mb-1 ${
                  selectedAnswer === question.correctAnswer
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {selectedAnswer === question.correctAnswer
                  ? "Correct!"
                  : "Explanation"}
              </h4>
              <p className="text-gray-400 text-sm">{question.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
            >
              {currentQuestion < totalQuestions - 1 ? "Next Question" : "See Results"}
            </button>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
