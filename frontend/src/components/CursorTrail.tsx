"use client";

import { useEffect, useRef } from "react";

type TrailPoint = {
  x: number;
  y: number;
  time: number;
};

const CSS_PIXELS_PER_CM = 96 / 2.54;
const MAX_DISTANCE = CSS_PIXELS_PER_CM * 10;
const MAX_POINTS = 40;
const FADE_DURATION = 900; // ms

function distance(a: TrailPoint, b: TrailPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const prunePoints = () => {
      const now = performance.now();
      const points = pointsRef.current;
      pointsRef.current = points.filter((point) => now - point.time < FADE_DURATION);

      let totalDistance = 0;
      for (let i = pointsRef.current.length - 1; i > 0; i--) {
        totalDistance += distance(pointsRef.current[i], pointsRef.current[i - 1]);
        if (totalDistance > MAX_DISTANCE) {
          pointsRef.current.splice(0, i);
          break;
        }
      }
      if (pointsRef.current.length > MAX_POINTS) {
        pointsRef.current.splice(0, pointsRef.current.length - MAX_POINTS);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      prunePoints();

      const points = pointsRef.current;
      if (points.length < 2) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < points.length; i++) {
        const current = points[i];
        const prev = points[i - 1];
        const age = performance.now() - current.time;
        const lifeProgress = 1 - Math.min(age / FADE_DURATION, 1);
        const width = 12 * lifeProgress + 3;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + lifeProgress * 0.45})`;
        ctx.shadowColor = `rgba(0, 108, 255, ${0.1 + lifeProgress * 0.4})`;
        ctx.shadowBlur = 12 * lifeProgress;
        ctx.lineWidth = width;

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    const handlePointerMove = (event: PointerEvent) => {
      pointsRef.current.push({ x: event.clientX, y: event.clientY, time: performance.now() });
    };

    const handlePointerLeave = () => {
      pointsRef.current = [];
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      aria-hidden
    />
  );
}
