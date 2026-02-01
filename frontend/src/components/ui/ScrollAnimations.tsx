"use client";

import {
  useState,
  useEffect,
  useRef,
  ReactNode,
  Children,
  cloneElement,
  isValidElement,
} from "react";

interface ScrollRevealProps {
  children: ReactNode;
  animation?:
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "scale"
    | "scale-bounce"
    | "blur"
    | "rotate"
    | "flip"
    | "bounce"
    | "glow";
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  stagger?: boolean;
  staggerDelay?: number;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = "",
  stagger = false,
  staggerDelay = 100,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (stagger) {
            const children = container.querySelectorAll("[data-scroll-child]");
            children.forEach((child, index) => {
              setTimeout(
                () => {
                  (child as HTMLElement).style.opacity = "1";
                  (child as HTMLElement).style.transform = "none";
                  (child as HTMLElement).style.filter = "none";
                },
                delay + index * staggerDelay,
              );
            });
          } else {
            setTimeout(() => {
              container.style.opacity = "1";
              container.style.transform = "none";
              container.style.filter = "none";
            }, delay);
          }
          observer.unobserve(container);
        }
      },
      { threshold },
    );

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [delay, threshold, stagger, staggerDelay]);

  const getInitialStyles = () => {
    const base = {
      opacity: 0,
      transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    };

    switch (animation) {
      case "fade-up":
        return { ...base, transform: "translateY(60px)" };
      case "fade-down":
        return { ...base, transform: "translateY(-60px)" };
      case "fade-left":
        return { ...base, transform: "translateX(60px)" };
      case "fade-right":
        return { ...base, transform: "translateX(-60px)" };
      case "scale":
        return { ...base, transform: "scale(0.8)" };
      case "scale-bounce":
        return { ...base, transform: "scale(0.5)" };
      case "blur":
        return { ...base, filter: "blur(20px)", transform: "scale(0.95)" };
      case "rotate":
        return { ...base, transform: "rotate(-10deg) scale(0.9)" };
      case "flip":
        return {
          ...base,
          transform: "perspective(1000px) rotateX(-60deg)",
          transformOrigin: "top",
        };
      case "bounce":
        return { ...base, transform: "translateY(100px) scale(0.8)" };
      case "glow":
        return { ...base, transform: "scale(0.95)" };
      default:
        return base;
    }
  };

  if (stagger) {
    return (
      <div ref={containerRef} className={className}>
        {Children.map(children, (child, index) => {
          if (isValidElement(child)) {
            const childProps = child.props as { style?: React.CSSProperties };
            return cloneElement(
              child as React.ReactElement<{
                style?: React.CSSProperties;
                "data-scroll-child"?: boolean;
              }>,
              {
                style: {
                  ...(childProps.style || {}),
                  ...getInitialStyles(),
                  transitionDelay: `${index * staggerDelay}ms`,
                },
                "data-scroll-child": true,
              },
            );
          }
          return child;
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={getInitialStyles()}>
      {children}
    </div>
  );
}

// Animated counter component
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  className = "",
}: AnimatedCounterProps) {
  const countRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          let startTime: number | null = null;
          const startValue = 0;

          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutExpo = 1 - Math.pow(2, -10 * progress);
            const currentValue = Math.floor(
              startValue + (end - startValue) * easeOutExpo,
            );

            if (element) {
              element.textContent = `${prefix}${currentValue.toLocaleString()}${suffix}`;
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [end, duration, suffix, prefix]);

  return (
    <span ref={countRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

// Text reveal animation component
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number;
}

export function TextReveal({
  text,
  className = "",
  delay = 0,
  charDelay = 30,
}: TextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const chars = container.querySelectorAll("span");
          chars.forEach((char, index) => {
            setTimeout(
              () => {
                char.style.opacity = "1";
                char.style.transform = "translateY(0)";
              },
              delay + index * charDelay,
            );
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [delay, charDelay]);

  return (
    <span ref={containerRef} className={className}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          style={{
            display: "inline-block",
            opacity: 0,
            transform: "translateY(20px)",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// Floating animation wrapper
interface FloatingProps {
  children: ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}

export function Floating({
  children,
  duration = 3,
  distance = 10,
  className = "",
}: FloatingProps) {
  return (
    <div
      className={className}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
      }}
    >
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-${distance}px);
          }
        }
      `}</style>
      {children}
    </div>
  );
}

// Scroll progress indicator
export function ScrollProgressBar() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / docHeight) * 100;

      if (progressRef.current) {
        progressRef.current.style.width = `${Math.min(progress, 100)}%`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        zIndex: 9999,
        background: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        ref={progressRef}
        style={{
          height: "100%",
          width: "0%",
          background: "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s linear infinite",
          transition: "width 0.1s ease-out",
        }}
      />
    </div>
  );
}

// Scroll to top button
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
