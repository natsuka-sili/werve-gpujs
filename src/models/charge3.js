export class Charge extends ElectricField {
    constructor (x, y, q){
        this.x = [x]
        this.y = [y]
        this.vx = [0]
        this.vy = [0]
        this.fx = [0]
        this.fy = [0]
        this.q = [q]
        this.l = 1
    }

    setElectricCharge (x, y, q){
        this.x.push(x)
        this.y.push(y)
        this.vx.push(0)
        this.vy.push(0)
        this.fx.push(0)
        this.fy.push(0)
        this.q.push(q)
        this.l++
        return this
    }

    calcCoulombForce (electricFieldX, electricFieldY) {
        for (let i = 0; i < q.length; i++) {
            this.fx[i] = q[i] * electricFieldX[y][x]
            this.fy[i] = q[i] * electricFieldY[y][x]
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
        const q = this.q
        for (let i = 0; i < q.length; i++) {
          const CoefficientOfRestitution = -0.1
          vx[i] = vx[i] -fx[i] / 1000
          x[i] = x[i] + Math.trunc(vx[i] / 1000 +fx[i] / 600000)
          if (x[i] >= w - 1) {
            vx[i] = CoefficientOfRestitution * vx[i]
            x[i] = w - 1
          } else if (x[i] <= 0) {
            vx[i] = CoefficientOfRestitution * vx[i]
            x[i] = 0
          }
          vy[i] = vy[i] -fy[i] / 1000
          y[i] = y[i] + Math.trunc(vy[i] / 1000 +fy[i] / 600000)
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