"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type Spark = {
  id: number;
  x: number;
  y: number;
};

const FIREFLIES = [
  { id: 0, size: 7, lag: 0.24 },
  { id: 1, size: 5, lag: 0.18 },
  { id: 2, size: 4, lag: 0.14 },
  { id: 3, size: 4, lag: 0.1 },
  { id: 4, size: 3, lag: 0.08 }
];

export function CursorMagic() {
  const [enabled, setEnabled] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchOnly = window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0;
    const nextEnabled = !motion.matches && !touchOnly;

    setEnabled(nextEnabled);
    document.documentElement.classList.toggle("cursor-magic-enabled", nextEnabled);

    function syncMotion() {
      const isEnabled = !motion.matches && !touchOnly;
      setEnabled(isEnabled);
      document.documentElement.classList.toggle("cursor-magic-enabled", isEnabled);
    }

    motion.addEventListener("change", syncMotion);

    return () => {
      motion.removeEventListener("change", syncMotion);
      document.documentElement.classList.remove("cursor-magic-enabled");
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let frame = 0;
    const target = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    const points = FIREFLIES.map((_, index) => ({
      x: target.x - index * 5,
      y: target.y - index * 5
    }));

    function draw() {
      points.forEach((point, index) => {
        const firefly = FIREFLIES[index];
        point.x += (target.x - point.x) * firefly.lag;
        point.y += (target.y - point.y) * firefly.lag;

        document.documentElement.style.setProperty(`--firefly-${index}-x`, `${point.x}px`);
        document.documentElement.style.setProperty(`--firefly-${index}-y`, `${point.y}px`);
      });

      frame = window.requestAnimationFrame(draw);
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") {
        return;
      }

      target.x = event.clientX;
      target.y = event.clientY;
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType === "touch") {
        return;
      }

      const id = sparkId.current;
      sparkId.current += 1;
      setSparks((items) => [...items, { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => {
        setSparks((items) => items.filter((item) => item.id !== id));
      }, 850);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="cursor-magic" aria-hidden="true">
      {FIREFLIES.map((firefly) => (
        <span
          key={firefly.id}
          className={`cursor-magic__firefly cursor-magic__firefly--${firefly.id}`}
          style={{ "--firefly-size": `${firefly.size}px` } as CSSProperties}
        />
      ))}

      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="cursor-magic__star"
          style={
            {
              "--star-x": `${spark.x}px`,
              "--star-y": `${spark.y}px`
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
