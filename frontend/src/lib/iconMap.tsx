/**
 * Icon mapping for programming languages and technologies.
 * Maps icon names (stored in backend) to React Icons components.
 */

import {
  FaHtml5,
  FaPython,
  FaJs,
  FaDatabase,
  FaTerminal,
  FaCss3Alt,
  FaReact,
  FaJava,
  FaNodeJs,
  FaPhp,
  FaDocker,
  FaGitAlt,
  FaLinux,
  FaAws,
  FaAngular,
  FaVuejs,
  FaSwift,
  FaRust,
  FaGolang,
  FaAndroid,
  FaApple,
  FaSass,
  FaBootstrap,
  FaNpm,
  FaYarn,
  FaFigma,
  FaMarkdown,
  FaWordpress,
  FaLaravel,
  FaCode,
  FaServer,
  FaCloud,
  FaMobile,
  FaDesktop,
  FaGamepad,
  FaCube,
  FaBrain,
  FaRobot,
  FaLock,
  FaNetworkWired,
} from "react-icons/fa";
import {
  SiTypescript,
  SiCplusplus,
  SiCsharp,
  SiKotlin,
  SiFlutter,
  SiDart,
  SiRuby,
  SiPerl,
  SiScala,
  SiElixir,
  SiHaskell,
  SiClojure,
  SiLua,
  SiR,
  SiJulia,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiGraphql,
  SiFirebase,
  SiSupabase,
  SiNextdotjs,
  SiNuxtdotjs,
  SiSvelte,
  SiTailwindcss,
  SiMui,
  SiPrisma,
  SiDjango,
  SiFastapi,
  SiFlask,
  SiSpring,
  SiExpress,
  SiNestjs,
  SiRails,
  SiDotnet,
  SiElectron,
  SiTauri,
  SiReact,
  SiWebpack,
  SiVite,
  SiRollup,
  SiJest,
  SiCypress,
  SiPlaywright,
  SiSelenium,
  SiKubernetes,
  SiTerraform,
  SiAnsible,
  SiJenkins,
  SiGithubactions,
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiDigitalocean,
  SiGooglecloud,
  SiAzuredevops,
  SiUnity,
  SiUnrealengine,
  SiGodotengine,
  SiTensorflow,
  SiPytorch,
  SiOpenai,
  SiSolidity,
  SiWeb3Dotjs,
  SiIpfs,
  SiArduino,
  SiRaspberrypi,
  SiZig,
  SiOcaml,
  SiErlang,
  SiFortran,
  SiCobol,
  SiAssemblyscript,
  SiGnubash,
  SiPowershell,
  SiVim,
  SiNeovim,
  SiVisualstudiocode,
  SiSublimetext,
  SiPostman,
  SiInsomnia,
  SiSwagger,
  SiApachekafka,
  SiRabbitmq,
  SiNginx,
  SiApache,
  SiCaddy,
} from "react-icons/si";
import { IconType } from "react-icons";

// Icon mapping - backend stores the key, frontend maps to component
export const iconMap: Record<string, IconType> = {
  // Languages
  "html": FaHtml5,
  "html5": FaHtml5,
  "css": FaCss3Alt,
  "css3": FaCss3Alt,
  "javascript": FaJs,
  "js": FaJs,
  "typescript": SiTypescript,
  "ts": SiTypescript,
  "python": FaPython,
  "java": FaJava,
  "cpp": SiCplusplus,
  "c++": SiCplusplus,
  "csharp": SiCsharp,
  "c#": SiCsharp,
  "php": FaPhp,
  "ruby": SiRuby,
  "go": FaGolang,
  "golang": FaGolang,
  "rust": FaRust,
  "swift": FaSwift,
  "kotlin": SiKotlin,
  "dart": SiDart,
  "scala": SiScala,
  "elixir": SiElixir,
  "haskell": SiHaskell,
  "clojure": SiClojure,
  "lua": SiLua,
  "perl": SiPerl,
  "r": SiR,
  "julia": SiJulia,
  "zig": SiZig,
  "ocaml": SiOcaml,
  "erlang": SiErlang,
  "fortran": SiFortran,
  "cobol": SiCobol,
  "assembly": SiAssemblyscript,
  
  // Shell & Terminal
  "bash": FaTerminal,
  "terminal": FaTerminal,
  "shell": FaTerminal,
  "gnubash": SiGnubash,
  "powershell": SiPowershell,
  "linux": FaLinux,
  
  // Frontend Frameworks
  "react": FaReact,
  "react-native": FaReact,
  "reactnative": FaReact,
  "angular": FaAngular,
  "vue": FaVuejs,
  "vuejs": FaVuejs,
  "svelte": SiSvelte,
  "next": SiNextdotjs,
  "nextjs": SiNextdotjs,
  "nuxt": SiNuxtdotjs,
  "nuxtjs": SiNuxtdotjs,
  
  // Mobile
  "flutter": SiFlutter,
  "android": FaAndroid,
  "ios": FaApple,
  "mobile": FaMobile,
  
  // CSS Frameworks
  "tailwind": SiTailwindcss,
  "tailwindcss": SiTailwindcss,
  "sass": FaSass,
  "scss": FaSass,
  "bootstrap": FaBootstrap,
  "mui": SiMui,
  "materialui": SiMui,
  
  // Backend Frameworks
  "node": FaNodeJs,
  "nodejs": FaNodeJs,
  "express": SiExpress,
  "nestjs": SiNestjs,
  "django": SiDjango,
  "fastapi": SiFastapi,
  "flask": SiFlask,
  "spring": SiSpring,
  "rails": SiRails,
  "laravel": FaLaravel,
  "dotnet": SiDotnet,
  ".net": SiDotnet,
  
  // Databases
  "sql": FaDatabase,
  "database": FaDatabase,
  "mongodb": SiMongodb,
  "postgres": SiPostgresql,
  "postgresql": SiPostgresql,
  "mysql": SiMysql,
  "redis": SiRedis,
  "graphql": SiGraphql,
  "firebase": SiFirebase,
  "supabase": SiSupabase,
  "prisma": SiPrisma,
  
  // DevOps & Cloud
  "docker": FaDocker,
  "kubernetes": SiKubernetes,
  "k8s": SiKubernetes,
  "terraform": SiTerraform,
  "ansible": SiAnsible,
  "jenkins": SiJenkins,
  "github-actions": SiGithubactions,
  "aws": FaAws,
  "gcp": SiGooglecloud,
  "azure": SiAzuredevops,
  "vercel": SiVercel,
  "netlify": SiNetlify,
  "heroku": SiHeroku,
  "digitalocean": SiDigitalocean,
  "nginx": SiNginx,
  "apache": SiApache,
  "caddy": SiCaddy,
  
  // Build Tools
  "webpack": SiWebpack,
  "vite": SiVite,
  "rollup": SiRollup,
  "npm": FaNpm,
  "yarn": FaYarn,
  
  // Testing
  "jest": SiJest,
  "cypress": SiCypress,
  "playwright": SiPlaywright,
  "selenium": SiSelenium,
  
  // Version Control
  "git": FaGitAlt,
  
  // Desktop
  "electron": SiElectron,
  "tauri": SiTauri,
  "desktop": FaDesktop,
  
  // Game Dev
  "unity": SiUnity,
  "unreal": SiUnrealengine,
  "godot": SiGodotengine,
  "gamedev": FaGamepad,
  
  // AI/ML
  "tensorflow": SiTensorflow,
  "pytorch": SiPytorch,
  "openai": SiOpenai,
  "ai": FaBrain,
  "ml": FaBrain,
  "robot": FaRobot,
  
  // Web3
  "solidity": SiSolidity,
  "web3": SiWeb3Dotjs,
  "blockchain": SiWeb3Dotjs,
  "ipfs": SiIpfs,
  
  // IoT
  "arduino": SiArduino,
  "raspberrypi": SiRaspberrypi,
  "iot": SiArduino,
  
  // Message Queues
  "kafka": SiApachekafka,
  "rabbitmq": SiRabbitmq,
  
  // Editors
  "vim": SiVim,
  "neovim": SiNeovim,
  "vscode": SiVisualstudiocode,
  "sublime": SiSublimetext,
  
  // API Tools
  "postman": SiPostman,
  "insomnia": SiInsomnia,
  "swagger": SiSwagger,
  
  // CMS
  "wordpress": FaWordpress,
  "markdown": FaMarkdown,
  
  // Design
  "figma": FaFigma,
  
  // Generic
  "code": FaCode,
  "server": FaServer,
  "cloud": FaCloud,
  "network": FaNetworkWired,
  "security": FaLock,
  "cube": FaCube,
  "default": FaCode,
};

// Color mapping for icons
export const iconColors: Record<string, string> = {
  // Languages
  "html": "#e34f26",
  "html5": "#e34f26",
  "css": "#264de4",
  "css3": "#264de4",
  "javascript": "#f7df1e",
  "js": "#f7df1e",
  "typescript": "#3178c6",
  "ts": "#3178c6",
  "python": "#3776ab",
  "java": "#f89820",
  "cpp": "#00599C",
  "c++": "#00599C",
  "csharp": "#239120",
  "c#": "#239120",
  "php": "#777BB4",
  "ruby": "#CC342D",
  "go": "#00ADD8",
  "golang": "#00ADD8",
  "rust": "#DEA584",
  "swift": "#F05138",
  "kotlin": "#7F52FF",
  "dart": "#0175C2",
  "scala": "#DC322F",
  "elixir": "#4B275F",
  "haskell": "#5D4F85",
  "clojure": "#5881D8",
  "lua": "#2C2D72",
  "perl": "#39457E",
  "r": "#276DC3",
  "julia": "#9558B2",
  
  // Shell
  "bash": "#4eaa25",
  "terminal": "#4eaa25",
  "shell": "#4eaa25",
  "powershell": "#5391FE",
  "linux": "#FCC624",
  
  // Frontend
  "react": "#61dafb",
  "react-native": "#61dafb",
  "reactnative": "#61dafb",
  "angular": "#DD0031",
  "vue": "#4FC08D",
  "vuejs": "#4FC08D",
  "svelte": "#FF3E00",
  "next": "#000000",
  "nextjs": "#000000",
  "nuxt": "#00DC82",
  
  // Mobile
  "flutter": "#02569B",
  "android": "#3DDC84",
  "ios": "#000000",
  "mobile": "#7c3aed",
  
  // CSS
  "tailwind": "#06B6D4",
  "tailwindcss": "#06B6D4",
  "sass": "#CC6699",
  "bootstrap": "#7952B3",
  "mui": "#007FFF",
  
  // Backend
  "node": "#339933",
  "nodejs": "#339933",
  "express": "#000000",
  "nestjs": "#E0234E",
  "django": "#092E20",
  "fastapi": "#009688",
  "flask": "#000000",
  "spring": "#6DB33F",
  "rails": "#CC0000",
  "laravel": "#FF2D20",
  "dotnet": "#512BD4",
  
  // Databases
  "sql": "#00758f",
  "database": "#00758f",
  "mongodb": "#47A248",
  "postgres": "#4169E1",
  "postgresql": "#4169E1",
  "mysql": "#4479A1",
  "redis": "#DC382D",
  "graphql": "#E10098",
  "firebase": "#FFCA28",
  "supabase": "#3FCF8E",
  "prisma": "#2D3748",
  
  // DevOps
  "docker": "#2496ED",
  "kubernetes": "#326CE5",
  "aws": "#FF9900",
  "gcp": "#4285F4",
  "azure": "#0078D4",
  "vercel": "#000000",
  "netlify": "#00C7B7",
  
  // Generic
  "code": "#7c3aed",
  "server": "#10b981",
  "cloud": "#f59e0b",
  "default": "#7c3aed",
};

// Accent colors for UI elements (borders, progress bars, etc.)
export const accentColors: Record<string, string> = {
  "html": "#f97316",
  "css": "#3b82f6",
  "javascript": "#eab308",
  "typescript": "#3b82f6",
  "python": "#3b82f6",
  "java": "#f97316",
  "cpp": "#6366f1",
  "react": "#06b6d4",
  "react-native": "#06b6d4",
  "vue": "#22c55e",
  "angular": "#ef4444",
  "sql": "#06b6d4",
  "bash": "#22c55e",
  "node": "#22c55e",
  "go": "#06b6d4",
  "rust": "#f97316",
  "swift": "#f97316",
  "kotlin": "#8b5cf6",
  "flutter": "#3b82f6",
  "docker": "#3b82f6",
  "default": "#8b5cf6",
};

/**
 * Get icon component for a given icon name/slug
 */
export function getIcon(iconName: string | undefined | null): IconType {
  if (!iconName) return iconMap.default;
  const key = iconName.toLowerCase().replace(/\s+/g, '-');
  return iconMap[key] || iconMap.default;
}

/**
 * Get icon color for a given icon name/slug
 */
export function getIconColor(iconName: string | undefined | null): string {
  if (!iconName) return iconColors.default;
  const key = iconName.toLowerCase().replace(/\s+/g, '-');
  return iconColors[key] || iconColors.default;
}

/**
 * Get accent color for a given icon name/slug
 */
export function getAccentColor(iconName: string | undefined | null): string {
  if (!iconName) return accentColors.default;
  const key = iconName.toLowerCase().replace(/\s+/g, '-');
  return accentColors[key] || accentColors.default;
}

// Export list of available icons for admin reference
export const availableIcons = Object.keys(iconMap).filter(k => k !== 'default').sort();
