"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

const revealSelector = [
  "main > section:not(.story-sequence):not(#contact)",
  "main article",
  ".magic-hover"
].join(",");

export function ScrollReveal() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
  }, [pathname]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motion.matches) {
      return;
    }

    const items = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    document.documentElement.classList.add("scroll-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.14
      }
    );

    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("scroll-reveal-ready");
    };
  }, [pathname]);

  return null;
}
