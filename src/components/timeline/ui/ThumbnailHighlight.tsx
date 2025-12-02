import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThumbnailHighlightProps {
  hoveredIndex: number | null;
  activeIndex: number | null;
  thumbnailWidth: number;
  thumbnailHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ThumbnailHighlight = ({
  hoveredIndex,
  activeIndex,
  thumbnailWidth,
  thumbnailHeight,
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

    // Calculate position using the same coordinate system as thumbnails
    const leftPos = Math.round(targetIndex * thumbnailWidth);

    setHighlightStyle({
      left: leftPos,
      width: Math.round(thumbnailWidth),
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
