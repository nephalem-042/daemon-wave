/** Draws the hacker's ICE-breaker shape. Shared by the player and its fork copies. */
export function drawChevron(ctx, { x, y, width, height }, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width / 2, y + height - 6);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
