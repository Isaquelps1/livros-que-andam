"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; r: number;
  vx: number; vy: number;
  alpha: number; color: string;
}

const COLORS = ["139,92,246", "245,158,11", "45,212,191", "34,197,94"];

export default function ParticleField({ count = 50 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let w = 0, h = 0;

    function resize() {
      w = canvas!.parentElement?.clientWidth || window.innerWidth;
      h = canvas!.parentElement?.clientHeight || window.innerHeight;
      canvas!.width = w; canvas!.height = h;
    }

    const particles: Particle[] = [];
    function init() {
      resize();
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.15,
          alpha: Math.random() * 0.5 + 0.1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
