"use client";

import { useRef, useEffect } from "react";

export default function ThreeVideoPlayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // We will initialize Three.js here later
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-[700px] h-[400px] bg-black rounded-lg"
    />
  );
}
