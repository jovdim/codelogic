"use client";

import { Code2, Database, Terminal } from "lucide-react";

interface TopicIconProps {
  icon: string;
  size?: number;
  className?: string;
}

const iconMap: { [key: string]: (size: number) => React.ReactElement } = {
  javascript: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <rect width="24" height="24" fill="#f7df1e" rx="2" />
      <path
        d="M6 18.2V16.5l1.8.1c.4 0 .7-.3.7-.7v-5.8h2v5.9c0 1.6-.9 2.4-2.5 2.4-1.1 0-1.8-.1-2-.2zm7.3-.3c-.6-.3-1-.8-1.2-1.3l1.6-.9c.2.4.4.6.7.8.3.2.6.2 1 .2.5 0 .9-.2.9-.6 0-.5-.6-.7-1.4-1-.9-.3-2.1-.8-2.1-2.2 0-1.4 1.2-2.3 2.7-2.3.9 0 1.7.2 2.3.7l-1.4 1c-.3-.3-.7-.4-1-.4-.4 0-.7.2-.7.5 0 .4.5.6 1.2.8 1.1.4 2.3.9 2.3 2.3 0 1.5-1.2 2.6-3 2.6-.9 0-1.6-.2-2.2-.5z"
        fill="#000"
      />
    </svg>
  ),
  python: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
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
  html: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        fill="#e44d26"
        d="M4 2l1.5 17L12 22l6.5-3L20 2H4zm12.5 6H8.3l.2 2.5h7.8l-.6 6.5-3.7 1-3.7-1-.2-3h2.4l.1 1.5 1.4.4 1.4-.4.1-2H7.9l-.5-5.5h9.2l-.1 1z"
      />
    </svg>
  ),
  css: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        fill="#264de4"
        d="M4 2l1.5 17L12 22l6.5-3L20 2H4zm12.6 5.9l-.1.8-.1.5-.1.5H8.3l.2 2h7.2l-.1.6-.6 6.6-3 .8-3-.8-.2-2.5h2.1l.1 1.3 1 .3 1-.3.1-1.4.1-1.3H7.6l-.5-5.5h9.6l-.1.9z"
      />
    </svg>
  ),
  react: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx="12" cy="12" r="2.2" fill="#61dafb" />
      <g fill="none" stroke="#61dafb" strokeWidth="1">
        <ellipse rx="10" ry="4" cx="12" cy="12" />
        <ellipse rx="10" ry="4" cx="12" cy="12" transform="rotate(60 12 12)" />
        <ellipse rx="10" ry="4" cx="12" cy="12" transform="rotate(120 12 12)" />
      </g>
    </svg>
  ),
  typescript: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <rect width="24" height="24" fill="#3178c6" rx="2" />
      <path
        fill="#fff"
        d="M6 13.5v-1h4.5v1H8.8v5h-1v-5H6zm5.3 1.8v-.7c.4.2 1 .4 1.5.4.6 0 .8-.2.8-.5 0-.2-.1-.3-.2-.4-.1-.1-.3-.2-.5-.2l-.5-.2c-.8-.3-1.2-.8-1.2-1.5 0-.5.2-.9.5-1.2.4-.3.9-.4 1.5-.4.5 0 1 .1 1.3.2v.7c-.4-.2-.8-.3-1.3-.3-.5 0-.8.2-.8.5 0 .2.1.3.2.4.1.1.3.2.5.2l.5.2c.4.1.7.3.9.6.2.2.3.5.3.9 0 .5-.2.9-.5 1.2-.4.3-.9.5-1.6.5-.5 0-1.1-.1-1.4-.3zm3.9-1.8v-1h4.5v1h-1.7v5h-1v-5h-1.8z"
      />
    </svg>
  ),
  nodejs: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        fill="#68a063"
        d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.5 3.7v7.3l-6.5 3.6-6.5-3.6V7.9L12 4.2z"
      />
      <path fill="#68a063" d="M12 8v8l-4-2.2V10l4-2z" />
    </svg>
  ),
  java: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
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
    </svg>
  ),
  cpp: (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
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
  sql: (size) => <Database size={size} className="text-[#336791]" />,
  bash: (size) => <Terminal size={size} className="text-[#4EAA25]" />,
  code: (size) => (
    <Code2 size={size} style={{ color: "var(--primary-light)" }} />
  ),
};

export function TopicIcon({ icon, size = 24, className = "" }: TopicIconProps) {
  const iconKey = icon.toLowerCase();
  const renderIcon = iconMap[iconKey] || iconMap.code;

  return <span className={className}>{renderIcon(size)}</span>;
}

export default TopicIcon;
