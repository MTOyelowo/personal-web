"use client";

import { useEffect, useRef } from "react";

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  ph: number;
}

/** Dust drifting through a diagonal beam of light. Fades in and out with `on`. */
export default function Motes({ on }: { on: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0);
  const startRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const cx = canvas?.getContext("2d");
    if (!canvas || !cx) return;

    // Soft dots need no more than 1.5x resolution; full phone resolution
    // made every frame redraw millions of pixels
    const dpr = Math.min(devicePixelRatio, 1.5);
    const count = innerWidth < 640 ? 36 : 60;
    const motes: Mote[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.7 + Math.random() * 1.7,
      vx: (0.2 + Math.random() * 0.6) / 9000,
      vy: (Math.random() * 0.5 - 0.15) / 9000,
      ph: Math.random() * 6.28,
    }));
    let level = 0;
    let running = false;
    let raf = 0;

    const size = () => {
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
    };
    size();
    addEventListener("resize", size);

    const frame = (t: number) => {
      level += (targetRef.current - level) * 0.03;
      cx.clearRect(0, 0, canvas.width, canvas.height);
      if (level < 0.004 && targetRef.current === 0) {
        running = false;
        // A hidden canvas is not a layer the phone has to blend every frame
        canvas.style.display = "none";
        return;
      }
      const { width: W, height: H } = canvas;
      for (const p of motes) {
        p.x += p.vx * 16;
        p.y += p.vy * 16 + Math.sin(t * 0.0006 + p.ph) * 0.00009;
        if (p.x > 1) p.x = 0;
        if (p.y > 1) p.y = 0;
        if (p.y < 0) p.y = 1;
        const beam = Math.max(0, 1 - Math.abs(p.y - (0.08 + p.x * 0.75)) / 0.28);
        const a = level * beam * (0.35 + 0.3 * Math.sin(t * 0.002 + p.ph));
        if (a <= 0) continue;
        cx.fillStyle = `rgba(150,112,52,${a.toFixed(3)})`;
        cx.beginPath();
        cx.arc(p.x * W, p.y * H, p.r * dpr, 0, 6.283);
        cx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    startRef.current = () => {
      if (!running && (targetRef.current > 0 || level > 0.004)) {
        running = true;
        canvas.style.display = "";
        raf = requestAnimationFrame(frame);
      }
    };
    startRef.current();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, []);

  useEffect(() => {
    targetRef.current = on ? 1 : 0;
    startRef.current();
  }, [on]);

  return (
    <canvas
      ref={canvasRef}
      className="reader-layer"
      style={{ display: "none" }}
      aria-hidden="true"
    />
  );
}
