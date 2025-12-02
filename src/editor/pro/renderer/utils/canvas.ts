export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const { width, height } = canvas.getBoundingClientRect();
  const needResize =
    canvas.width !== Math.floor(width) ||
    canvas.height !== Math.floor(height);

  if (needResize) {
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
  }
}
