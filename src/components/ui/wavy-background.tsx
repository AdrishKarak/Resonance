/**
 * WavyBackground animated canvas backdrop.
 * Renders layered, noise-driven sine waves on an HTML canvas with configurable colors,
 * speed, blur, and opacity, and layers children above the animation.
 * Adapted from the Aceternity UI "Wavy Background" effect for use across app features.
 */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  waveYOffset,
  waveCount = 5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  waveYOffset?: number;
  waveCount?: number;
  [key: string]: any;
}) => {
  const noise = useMemo(() => createNoise3D(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSafari, setIsSafari] = useState(false);

  const getSpeed = useCallback(() => {
    switch (speed) {
      case "slow":
        return 0.0008;
      case "fast":
        return 0.003;
      default:
        return 0.0008;
    }
  }, [speed]);

  const waveColors = useMemo(() => colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ], [colors]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSafari(
      typeof window !== "undefined" &&
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome")
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number;
    let h: number;
    let nt = 0;
    let animationId: number;

    const setCanvasSize = () => {
      w = canvas.width = container.offsetWidth;
      h = canvas.height = container.offsetHeight;
      if (!isSafari) {
        ctx.filter = `blur(${blur}px)`;
      }
    };

    const drawWave = (n: number) => {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        ctx.globalAlpha = waveOpacity;
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.15 * i, nt) * 100;
          ctx.lineTo(x, y + (waveYOffset ?? h * 0.28));
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      if (backgroundFill) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = backgroundFill;
        ctx.fillRect(0, 0, w, h);
      }
      drawWave(waveCount);
      animationId = requestAnimationFrame(render);
    };

    setCanvasSize();
    render();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [blur, getSpeed, waveOpacity, waveYOffset, waveWidth, backgroundFill, waveColors, isSafari, noise, waveCount]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
