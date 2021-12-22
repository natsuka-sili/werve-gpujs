function tri (ctx) {
  ctx.moveTo(-3, 0)
  ctx.lineTo(3, 0)
  ctx.moveTo(1, 2)
  ctx.lineTo(3, 0)
  ctx.lineJoin = 'miter'
  ctx.miterLimit = 10
  ctx.lineTo(1, -2)
}
function tri2 (ctx) {
  ctx.moveTo(-3, 0)
  ctx.lineTo(3, 0)
  ctx.moveTo(1, -4)
  ctx.lineTo(3, 0)
  ctx.lineJoin = 'miter'
  ctx.miterLimit = 10
  ctx.lineTo(1, 4)
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
  ctx.strokeStyle = '#FFF701'
  const frequency = 14
  for (let i = 0; i < w; i += frequency) {
    for (let j = 0; j < h; j += frequency) {
      let scale = arrayR[j][i] / 2000000
      if (scale > 3) { scale = 3 }
      ctx.beginPath()
      ctx.strokeStyle = `rgb(${Math.floor(scale * 85)}, 0, ${255 - Math.floor(scale * 85)})`
      ctx.save()
      ctx.translate(i, h - j)
      ctx.rotate(Math.PI - arrayTheta[j][i])
      ctx.scale(scale, 1)
      tri(ctx)
      ctx.restore()
      ctx.stroke()
    }
  }
}

export function RenderCircle (h, c, ctx) {
  for (let i = 0; i < c.l; i++) {
    if (c.q[i] > 0) {
      ctx.fillStyle = '#FD3A4B'
    } else {
      ctx.fillStyle = '#2196E2'
    }
    ctx.beginPath()
    ctx.arc(c.x[i], h - c.y[i], 15 * Math.abs(c.q[i]), 0, 2 * Math.PI, false)
    ctx.fill()
  }
}

export function RenderForce (h, c, ctx) {
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.strokeStyle = '#FF8A00'
  for (let i = 0; i < c.l; i++) {
    let scale = c.fr[i] / 100000
    if (scale > 20) { scale = 20 }
    ctx.save()
    ctx.translate(c.x[i], h - c.y[i])
    ctx.rotate(Math.PI - c.ftheta[i])
    ctx.scale(scale, 1)
    tri2(ctx)
    ctx.restore()
  }
  ctx.stroke()
}
