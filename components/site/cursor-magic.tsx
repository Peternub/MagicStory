"use client";

import { useEffect, useState } from "react";

const interactiveSelector = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "article",
  "form",
  ".magic-hover"
].join(",");

export function CursorMagic() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchOnly = window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0;
    let seenPointer = false;

    function setCursorState(nextEnabled: boolean) {
      setEnabled(nextEnabled);
      document.documentElement.classList.toggle("cursor-magic-enabled", nextEnabled);
      document.documentElement.classList.toggle("cursor-magic-ready", nextEnabled);
    }

    function enableFromPointer(event: PointerEvent) {
      if (motion.matches || event.pointerType === "touch") {
        setCursorState(false);
        return;
      }

      seenPointer = true;
      setCursorState(true);
    }

    function syncMotion() {
      if (motion.matches) {
        setCursorState(false);
        return;
      }

      if (seenPointer) {
        setCursorState(true);
      }
    }

    setCursorState(!motion.matches && !touchOnly);
    window.addEventListener("pointermove", enableFromPointer, { passive: true });
    motion.addEventListener("change", syncMotion);

    return () => {
      window.removeEventListener("pointermove", enableFromPointer);
      motion.removeEventListener("change", syncMotion);
      document.documentElement.classList.remove(
        "cursor-magic-enabled",
        "cursor-magic-ready",
        "cursor-magic-active"
      );
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let glowX = x;
    let glowY = y;

    function draw() {
      glowX += (x - glowX) * 0.32;
      glowY += (y - glowY) * 0.32;

      document.documentElement.style.setProperty("--cursor-x", `${glowX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${glowY}px`);
      frame = window.requestAnimationFrame(draw);
    }

    function handlePointerMove(event: PointerEvent) {
      x = event.clientX;
      y = event.clientY;
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Element && target.closest(interactiveSelector)) {
        document.documentElement.classList.add("cursor-magic-active");
      }
    }

    function handlePointerOut(event: PointerEvent) {
      const target = event.relatedTarget;

      if (!(target instanceof Element) || !target.closest(interactiveSelector)) {
        document.documentElement.classList.remove("cursor-magic-active");
      }
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);
      document.documentElement.classList.remove("cursor-magic-active");
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="cursor-magic" aria-hidden="true">
      <span className="cursor-magic__halo" />
      <span className="cursor-magic__core" />
      <span className="cursor-magic__dot" />
      <span className="cursor-magic__spark cursor-magic__spark--one" />
      <span className="cursor-magic__spark cursor-magic__spark--two" />
      <span className="cursor-magic__spark cursor-magic__spark--three" />
    </div>
  );
}
