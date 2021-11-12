export class ElectricField {
  constructor (width, height) {
    this.width = width
    this.height = height
    this.charge = []
    this.template_electric_field_x = []
    this.template_electric_field_y = []
    this.electric_field_x = []
    this.electric_field_y = []
    this.electric_field_r = []
    this.electric_field_theta = []
    this.force_x = []
    this.force_y = []
    this.force_r = []
    this.force_theta = []
    this.sum_force_x = []
    this.sum_force_y = []
    this.sum_force_r = []
    this.sum_force_theta = []
  }

  setElectricCharge (x, y, q) {
    this.charge.push([x, y, 0, 0, q])
    return this
  }

  calcElectricFieldTemplate (gpu) {
    const w = this.width
    const h = this.height
    const kernelX = gpu.createKernel(function () {
      const x = (this.constants.w - this.thread.x - 1)
      const y = (this.constants.h - this.thread.y - 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * x
    }, {
      constants: { k: 9E+9, w: w, h: h },
      output: [2 * w - 1, 2 * h - 1]
    })
    const kernelY = gpu.createKernel(function () {
      const x = (this.constants.w - this.thread.x - 1)
      const y = (this.constants.h - this.thread.y - 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * y
    }, {
      constants: { k: 9E+9, w: w, h: h },
      output: [2 * w - 1, 2 * h - 1]
    })
    this.template_electric_field_x = kernelX()
    this.template_electric_field_y = kernelY()
    this.template_electric_field_x[h - 1][w - 1] = 0.0
    this.template_electric_field_y[h - 1][w - 1] = 0.0
    return this
  }

  superposeElectricField (gpu) {
    const w = this.width
    const h = this.height
    this.electric_field_x = new Array(h).fill(new Array(w).fill(0.0))
    this.electric_field_y = new Array(h).fill(new Array(w).fill(0.0))
    const charge = this.charge
    for (let i = 0; i < charge.length; i++) {
      const chargeI = charge[i]
      const x = chargeI[0]
      const y = chargeI[1]
      const q = chargeI[4]
      const kernel = gpu.createKernel(function (array1, array2) {
        const x = this.thread.x
        const y = this.thread.y
        return array1[y][x] + array2[y + this.constants.y][x + this.constants.x] * this.constants.q
      }, {
        constants: { x: x, y: y, q: q },
        output: [h, w]
      })
      this.electric_field_x = kernel(this.electric_field_x, this.template_electric_field_x)
      this.electric_field_y = kernel(this.electric_field_y, this.template_electric_field_y)
    }
    return this
  }

  convertPolarElectricField (gpu) {
    const w = this.width
    const h = this.height
    const kernelR = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      return Math.sqrt(array1[y][x] * array1[y][x] + array2[y][x] * array2[y][x])
    }, {
      output: [h, w]
    })
    const kernelTheta = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      let theta = Math.atan(array2[y][x] / array1[y][x])
      if (array2[y][x] === 0 && array1[y][x] === 0) { theta = 0 }
      return theta
    }, {
      output: [h, w]
    })
    const electricFieldX = this.electric_field_x
    const electricFieldY = this.electric_field_y
    this.electric_field_r = kernelR(electricFieldX, electricFieldY)
    this.electric_field_theta = kernelTheta(electricFieldX, electricFieldY)
    return this
  }

  calcCoulombForce () {
    const w = this.width
    const h = this.height
    const charge = this.charge
    const chargeL = charge.length
    this.force_x = new Array(chargeL).fill(new Array(chargeL - 1).fill(0.0))
    this.force_y = new Array(chargeL).fill(new Array(chargeL - 1).fill(0.0))
    const k = 9E+9
    const tentativeForceX = []
    const tentativeForceY = []
    for (let i = 0; i < chargeL - 1; i++) {
      const chargeI = charge[i]
      for (let j = i + 1; j < chargeL; j++) {
        const chargeJ = charge[j]
        const x1 = w / 2 - chargeI[0]
        const y1 = h / 2 - chargeI[1]
        const q1 = chargeI[4]
        const x2 = w / 2 - chargeJ[0]
        const y2 = h / 2 - chargeJ[1]
        const q2 = chargeJ[4]
        const ri = 1 / ((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
        const f = k * Math.sqrt(ri * ri * ri) * q1 * q2
        const fx = f * (x1 - x2)
        const fy = f * (y1 - y2)
        tentativeForceX.push([i, j, fx])
        tentativeForceX.push([j, i, -fx])
        tentativeForceY.push([i, j, fy])
        tentativeForceY.push([j, i, -fy])
      }
    }
    for (let i = 0; i < chargeL; i++) {
      const temporaryX = []
      const temporaryY = []
      for (let j = 0; j < chargeL; j++) {
        if (i !== j) {
          const index = tentativeForceX.map((elm, idx) => elm[0] === i && elm[1] === j ? idx : '').find(String)
          temporaryX.push(tentativeForceX[index][2])
          temporaryY.push(tentativeForceY[index][2])
        }
      }
      this.force_x[i] = temporaryX
      this.force_y[i] = temporaryY
    }
    return this
  }

  convertPolarCoulombForce () {
    const forceX = this.force_x
    const forceY = this.force_y
    const chargeL = this.charge.length
    for (let i = 0; i < chargeL; i++) {
      const temporaryR = []
      const temporaryTheta = []
      for (let j = 0; j < chargeL - 1; j++) {
        const forceXIJ = forceX[i][j]
        const forceYIJ = forceY[i][j]
        temporaryR.push(Math.sqrt(forceXIJ * forceXIJ + forceYIJ[i][j] * forceYIJ[i][j]))
        let theta = Math.atan(forceYIJ[i][j] / forceXIJ)
        if (forceXIJ === 0 && forceYIJ[i][j] === 0) { theta = 0 }
        temporaryTheta.push(theta)
      }
      this.force_r.push(temporaryR)
      this.force_theta.push(temporaryTheta)
    }
    return this
  }

  sumCoulombForce () {
    const chargeL = this.charge.length
    this.sum_force_x = new Array(chargeL).fill(0.0)
    this.sum_force_y = new Array(chargeL).fill(0.0)
    this.sum_force_r = new Array(chargeL).fill(0.0)
    this.sum_force_theta = new Array(chargeL).fill(0.0)
    const reducer = (previousValue, currentValue) => previousValue + currentValue
    for (let i = 0; i < chargeL; i++) {
      this.sum_force_x[i] = this.force_x[i].reduce(reducer)
      this.sum_force_y[i] = this.force_y[i].reduce(reducer)
      const sumForceXI = this.sum_force_x[i]
      const sumForceYI = this.sum_force_y[i]
      this.sum_force_r[i] = Math.sqrt(sumForceXI * sumForceXI + sumForceYI * sumForceYI)
      let theta = Math.atan(sumForceYI / sumForceXI)
      if (sumForceXI === 0 && sumForceYI === 0) { theta = 0 }
      this.sum_force_theta[i] = theta
    }
    return this
  }

  calcSumCoulombForce () {
    const charge = this.charge
    const chargeL = charge.length
    this.sum_force_from_electric_field_x = new Array(chargeL).fill(0.0)
    for (let i = 0; i < chargeL; i++) {
      this.sum_force_from_electric_field_x[i] = charge[i][4] * this.electric_field_x[Math.round(charge[i][1])][Math.round(charge[i][0])]
    }
  }

  calcPositions () {
    const width = this.width
    const height = this.height
    const sumForceX = this.sum_force_x
    const sumForceY = this.sum_force_y
    const charge = this.charge
    for (let i = 0; i < charge.length; i++) {
      const sumForceXI = sumForceX[i]
      const sumForceYI = sumForceY[i]
      const chargeI = charge[i]
      if (chargeI[0] >= width - 1) {
        chargeI[2] = -0.9 * (chargeI[2] - sumForceXI / 1000)
        chargeI[0] = width - 1
      } else if (chargeI[0] <= 0) {
        chargeI[2] = -0.9 * (chargeI[2] - sumForceXI / 1000)
        chargeI[0] = 0
      } else {
        chargeI[2] = chargeI[2] - sumForceXI / 1000
        chargeI[0] = chargeI[0] + chargeI[2] / 1000 + sumForceXI / 600000
      }
      if (chargeI[1] >= height - 1) {
        chargeI[3] = -0.9 * (chargeI[3] - sumForceYI / 1000)
        chargeI[1] = height - 1
      } else if (chargeI[1] <= 0) {
        chargeI[3] = -0.9 * (chargeI[3] - sumForceYI / 1000)
        chargeI[1] = 0
      } else {
        chargeI[3] = chargeI[3] - sumForceYI / 1000
        chargeI[1] = chargeI[1] + chargeI[3] / 1000 + sumForceYI / 600000
      }
    }
    return this
  }

  renderR (gpuCanvas) {
    const kernel = gpuCanvas.createKernel(function (array) {
      const x = this.thread.x
      const y = this.thread.y
      // 8987551792がmax(Q)=1C、min(r)=1mにおけるmax(E)
      const color = array[y][x] / 8987551
      this.color(color, color, color, 1)
    }, {
      output: [this.height, this.width],
      graphical: true
    })
    kernel(this.electric_field_r)
  }

  renderTemplate (gpuCanvas) {
    const kernel = gpuCanvas.createKernel(function (array) {
      const x = this.thread.x
      const y = this.thread.y
      // 8987551792がmax(Q)=1C、min(r)=1mにおけるmax(E)
      const color = array[y][x] / 8987551
      this.color(color, 0, -color, 1)
    }, {
      output: [2 * this.height - 1, 2 * this.width - 1],
      graphical: true
    })
    kernel(this.template_electric_field_x)
  }
};
