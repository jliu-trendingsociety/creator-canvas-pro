import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ThumbnailHighlightProps {
  hoveredIndex: number | null;
  activeIndex: number | null;
  thumbnailWidth: number;
  thumbnailHeight: number;
  thumbnailGap: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ThumbnailHighlight = ({
  hoveredIndex,
  activeIndex,
  thumbnailWidth,
  thumbnailHeight,
  thumbnailGap,
  containerRef,
}: ThumbnailHighlightProps) => {
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);

  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  useEffect(() => {
    if (targetIndex === null || !containerRef.current) {
      setIsVisible(false);
      return;
    }

    const thumbnailElement = containerRef.current.children[targetIndex] as HTMLElement;
    if (!thumbnailElement) {
      setIsVisible(false);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const thumbnailRect = thumbnailElement.getBoundingClientRect();

    setHighlightStyle({
      left: thumbnailRect.left - containerRect.left,
      width: thumbnailWidth,
      height: thumbnailHeight,
    });
    setIsVisible(true);
  }, [targetIndex, thumbnailWidth, thumbnailHeight, containerRef]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute top-0 border-2 border-neon rounded pointer-events-none z-40",
        "transition-all duration-150 ease-out"
      )}
      style={highlightStyle}
    />
  );
};
