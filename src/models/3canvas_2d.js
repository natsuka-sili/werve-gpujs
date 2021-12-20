function tri (ctx) {
  ctx.moveTo(-5, -3)
  ctx.lineTo(5, 0)
  ctx.lineTo(-5, 3)
  ctx.closePath()
}
export function renderTest (x, y, ctx, i) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(x / Math.sqrt(y) * i / 100)
  tri(ctx)
  ctx.restore()
}

export function Render (w, h, arrayR, arrayTheta, ctx) {
  ctx.clearRect(0, 0, 300, 300)
  ctx.lineWidth = 1
  ctx.beginPath()
  const frequency = 14
  for (let i = 0; i < w; i += frequency) {
    for (let j = 0; j < h; j += frequency) {
      ctx.save()
      ctx.translate(i, h - j)
      ctx.rotate(-(arrayTheta[j][i]))

      // ctx.scale(arrayR[i][j], arrayR[i][j])
      tri(ctx)
      ctx.restore()
    }
  }
  ctx.stroke()
}
