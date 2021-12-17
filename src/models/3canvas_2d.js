function tri (ctx) {
  ctx.moveTo(-5, -3)
  ctx.lineTo(5, 0)
  ctx.lineTo(-5, 3)
  ctx.closePath()
}
export function render (x, y, ctx, i) {
  ctx.save()
  ctx.translate(x - i % 123, y - i % 123)
  ctx.rotate(x / Math.sqrt(y) * i / 100)
  tri(ctx)
  ctx.restore()
}
