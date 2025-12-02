import { useEffect, useRef } from "react";
import { RenderEngine } from "../engine/RenderEngine";

export function useRenderLoop(
  engine: RenderEngine,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  getState: () => {
    currentTime: number;
    tracks: any[];
  }
) {
  const rafRef = useRef<number>();

  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { currentTime, tracks } = getState();

      engine.renderFrame({
        ctx,
        currentTime,
        width: canvas.width,
        height: canvas.height,
        tracks,
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [engine, canvasRef, getState]);
}
