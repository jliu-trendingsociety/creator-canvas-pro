import React, { useEffect, useRef } from "react";
import { RenderEngine } from "../engine/RenderEngine";
import { useRenderLoop } from "../hooks/useRenderLoop";
import { resizeCanvasToDisplaySize } from "../utils/canvas";

interface Props {
  engine: RenderEngine;
  getState: () => {
    currentTime: number;
    tracks: any[];
  };
}

export const MasterCanvas: React.FC<Props> = ({ engine, getState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obs = new ResizeObserver(() =>
      resizeCanvasToDisplaySize(canvas)
    );
    obs.observe(canvas);

    return () => obs.disconnect();
  }, []);

  useRenderLoop(engine, canvasRef, getState);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-black rounded-md"
      style={{ display: "block" }}
    />
  );
};
