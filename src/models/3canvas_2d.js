function tri (ctx) {
  // ctx.moveTo(-5, -3)
  // ctx.lineTo(5, 0)
  // ctx.lineTo(-5, 3)
  // ctx.closePath()
  ctx.moveTo(-3, 0)
  ctx.lineTo(3, 0)
  ctx.lineTo(1, 2)
  ctx.moveTo(1, -2)
  ctx.lineTo(3, 0)
}
export function renderTest (x, y, ctx, i) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(x / Math.sqrt(y) * i / 100)
  tri(ctx)
  ctx.restore()
}

export function clear (ctx) {
  ctx.clearRect(0, 0, 300, 300)
}

export function Render (w, h, arrayR, arrayTheta, ctx) {
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.strokeStyle = "green"
  const frequency = 14
  for (let i = 0; i < w; i += frequency) {
    for (let j = 0; j < h; j += frequency) {
      let scale = arrayR[j][i] / 1000000
      if (scale > 3) { scale = 3 }
      ctx.save()
      // ctx.strokeStyle = `rgb(${Math.floor(scale * 85)}, 0, ${255 - Math.floor(scale * 85)})`
      ctx.translate(i, h - j)
      ctx.rotate(Math.PI - arrayTheta[j][i])
      ctx.scale(scale, 1)
      tri(ctx)
      ctx.restore()
    }
  }
  ctx.stroke()
}

export function RenderCircle (h, c, ctx) {
  for (let i = 0; i < c.l; i++) {
    if (c.q[i] > 0) {
      ctx.fillStyle = "red"
    } else {
      ctx.fillStyle = "blue"
    }
    // ctx.fillRect(c.x[i] - 5, h - c.y[i] - 5, 10, 10)
    ctx.beginPath ()
    ctx.arc(c.x[i], h - c.y[i], 15 * Math.abs(c.q[i]), 0, 2 * Math.PI, false )
    ctx.fill()
  }
}