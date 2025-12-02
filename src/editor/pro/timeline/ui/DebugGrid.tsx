/**
 * DebugGrid
 * Visual grid overlay for debugging alignment issues
 */

interface DebugGridProps {
  width: number;
  height: number;
  cellSize?: number;
  enabled?: boolean;
}

export const DebugGrid = ({ 
  width, 
  height, 
  cellSize = 20,
  enabled = false 
}: DebugGridProps) => {
  if (!enabled) return null;

  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const cells = [];

  for (let i = 0; i < cols * rows; i++) {
    cells.push(
      <div 
        key={i} 
        className="border border-green-500/20"
        style={{ width: cellSize, height: cellSize }}
      />
    );
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}
    >
      {cells}
    </div>
  );
};
