import { ElectricField } from './electric_field.js'

export class Charge extends ElectricField {
  constructor (x, y, q, width, height) {
    super(width, height)
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    this.fx = 0
    this.fy = 0
    this.q = q
  }

  calcCoulombForce (electricFieldX, electricFieldY) {
    const x = this.x
    const y = this.y
    const q = this.q
    this.fx = q * electricFieldX[y][x]
    this.fy = q * electricFieldY[y][x]
    return this
  }

  calcPositions () {
    const w = this.width
    const h = this.height
    const fx = this.fx
    const fy = this.fy
    const CoefficientOfRestitution = -0.1
    this.vx = this.vx - fx / 1000
    this.x = this.x + Math.trunc(this.vx / 1000 + fx / 600000)
    if (this.x >= w - 1) {
      this.vx = CoefficientOfRestitution * this.vx
      this.x = w - 1
    } else if (this.x <= 0) {
      this.vx = CoefficientOfRestitution * this.vx
      this.x = 0
    }
    this.vy = this.vy - fy / 1000
    this.y = this.y + Math.trunc(this.vy / 1000 + fy / 600000)
    if (this.y >= h - 1) {
      this.vy = CoefficientOfRestitution * this.vy
      this.y = h - 1
    } else if (this.y <= 0) {
      this.vy = CoefficientOfRestitution * this.vy
      this.y = 0
    }
    return this
  }
};
