export class Charge {
  constructor () {
    this.x = []
    this.y = []
    this.vx = []
    this.vy = []
    this.fx = []
    this.fy = []
    this.q = []
    this.l = 0
  }

  setElectricCharge (array) {
    this.x.push(array[0])
    this.y.push(array[1])
    this.vx.push(0)
    this.vy.push(0)
    this.fx.push(0)
    this.fy.push(0)
    this.q.push(array[2])
    this.l++
    return this
  }

  calcCoulombForce (electricFieldX, electricFieldY) {
    const q = this.q
    const x = this.x
    const y = this.y
    for (let i = 0; i < this.l; i++) {
      this.fx[i] = q[i] * electricFieldX[y[i]][x[i]]
      this.fy[i] = q[i] * electricFieldY[y[i]][x[i]]
    }
    return this
  }

  calcPositions (w, h) {
    const x = this.x
    const y = this.y
    const vx = this.vx
    const vy = this.vy
    const fx = this.fx
    const fy = this.fy
    for (let i = 0; i < this.l; i++) {
      const CoefficientOfRestitution = -0.1
      vx[i] = vx[i] - fx[i] / 1000
      x[i] = x[i] + Math.trunc(vx[i] / 1000 + fx[i] / 600000)
      if (x[i] >= w - 1) {
        vx[i] = CoefficientOfRestitution * vx[i]
        x[i] = w - 1
      } else if (x[i] <= 0) {
        vx[i] = CoefficientOfRestitution * vx[i]
        x[i] = 0
      }
      vy[i] = vy[i] - fy[i] / 1000
      y[i] = y[i] + Math.trunc(vy[i] / 1000 + fy[i] / 600000)
      if (y[i] >= h - 1) {
        vy[i] = CoefficientOfRestitution * vy[i]
        y[i] = h - 1
      } else if (y[i] <= 0) {
        vy[i] = CoefficientOfRestitution * vy[i]
        y[i] = 0
      }
    }
    return this
  }
};
