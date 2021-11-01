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
    this.charge.push([x, y, q])
    return this
  }

  calcElectricFieldTemplate (gpu) {
    const kernelX = gpu.createKernel(function () {
      const x = (this.constants.w - this.thread.x - 1)
      const y = (this.constants.h - this.thread.y - 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * x
    }, {
      constants: { k: 9E+9, w: this.width / 2, h: this.height / 2 },
      output: [2 * this.width - 1, 2 * this.height - 1]
    })
    const kernelY = gpu.createKernel(function () {
      const x = (this.constants.w - this.thread.x - 1)
      const y = (this.constants.h - this.thread.y - 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * y
    }, {
      constants: { k: 9E+9, w: this.width / 2, h: this.height / 2 },
      output: [2 * this.width - 1, 2 * this.height - 1]
    })
    this.template_electric_field_x = kernelX()
    this.template_electric_field_y = kernelY()
    this.template_electric_field_x[this.height - 1][this.width - 1] = 0.0
    this.template_electric_field_y[this.height - 1][this.width - 1] = 0.0
    return this
  }

  superposeElectricField (gpu) {
    this.electric_field_x = new Array(this.height).fill(new Array(this.width).fill(0.0))
    this.electric_field_y = new Array(this.height).fill(new Array(this.width).fill(0.0))
    for (let i = 0; i < this.charge.length; i++) {
      const x = this.charge[i][0]
      const y = this.charge[i][1]
      const q = this.charge[i][2]
      const kernel = gpu.createKernel(function (array1, array2) {
        const x = this.thread.x
        const y = this.thread.y
        return array1[y][x] + array2[y - this.constants.y][x - this.constants.x] * this.constants.q
      }, {
        constants: { x: x, y: y, q: q },
        output: [this.height, this.width]
      })
      this.electric_field_x = kernel(this.electric_field_x, this.template_electric_field_x)
      this.electric_field_y = kernel(this.electric_field_y, this.template_electric_field_y)
    }
    return this
  }

  convertPolarElectricField (gpu) {
    const kernelR = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      return Math.sqrt(array1[y][x] * array1[y][x] + array2[y][x] * array2[y][x])
    }, {
      output: [this.height, this.width]
    })
    const kernelTheta = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      let theta = Math.atan(array2[y][x] / array1[y][x])
      if (array2[y][x] === 0 && array1[y][x] === 0) { theta = 0 }
      return theta
    }, {
      output: [this.height, this.width]
    })
    this.electric_field_r = kernelR(this.electric_field_x, this.electric_field_y)
    this.electric_field_theta = kernelTheta(this.electric_field_x, this.electric_field_y)
    return this
  }

  calcCoulombForce () {
    const k = 9E+9
    const tentativeForceX = []
    const tentativeForceY = []
    for (let i = 0; i < this.charge.length - 1; i++) {
      for (let j = i + 1; j < this.charge.length; j++) {
        const x1 = this.width / 2 - this.charge[i][0]
        const y1 = this.height / 2 - this.charge[i][1]
        const q1 = this.charge[i][2]
        const x2 = this.width / 2 - this.charge[j][0]
        const y2 = this.height / 2 - this.charge[j][1]
        const q2 = this.charge[j][2]
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
    for (let i = 0; i < this.charge.length; i++) {
      const temporaryX = []
      const temporaryY = []
      for (let j = 0; j < this.charge.length; j++) {
        if (i !== j) {
          const index = tentativeForceX.map((elm, idx) => elm[0] === i && elm[1] === j ? idx : '').find(String)
          temporaryX.push(tentativeForceX[index][2])
          temporaryY.push(tentativeForceY[index][2])
        }
      }
      this.force_x.push(temporaryX)
      this.force_y.push(temporaryY)
    }
    return this
  }

  convertPolarCoulombForce () {
    for (let i = 0; i < this.charge.length; i++) {
      const temporaryR = []
      const temporaryTheta = []
      for (let j = 0; j < this.charge.length - 1; j++) {
        temporaryR.push(Math.sqrt(this.force_x[i][j] * this.force_x[i][j] + this.force_y[i][j] * this.force_y[i][j]))
        let theta = Math.atan(this.force_y[i][j] / this.force_x[i][j])
        if (this.force_x[i][j] === 0 && this.force_y[i][j] === 0) { theta = 0 }
        temporaryTheta.push(theta)
      }
      this.force_r.push(temporaryR)
      this.force_theta.push(temporaryTheta)
    }
    return this
  }

  sumCoulombForce () {
    const reducer = (previousValue, currentValue) => previousValue + currentValue
    for (let i = 0; i < this.charge.length; i++) {
      this.sum_force_x.push(this.force_x[i].reduce(reducer))
      this.sum_force_y.push(this.force_y[i].reduce(reducer))
      this.sum_force_r.push(Math.sqrt(this.sum_force_x[i] * this.sum_force_x[i] + this.sum_force_y[i] * this.sum_force_y[i]))
      let theta = Math.atan(this.sum_force_y[i] / this.sum_force_x[i])
      if (this.sum_force_x[i] === 0 && this.sum_force_y[i] === 0) { theta = 0 }
      this.sum_force_theta.push(theta)
    }
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

  /*
  #####################
  #####################
  #####################
  #####################
  #####################
  #####################
  #####################
  #####################
  */

  /*
  // 点電荷による電界の作成
  createTemplate (gpu, xa, ya, q) {
    const kernelX = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.xf - this.constants.w + 1)
      const y = (this.thread.y - this.constants.yf - this.constants.h + 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * x * this.constants.q
    }, {
      constants: { k: 9E+9, w: this.width / 2, h: this.height / 2, xf: xa, yf: ya, q: q },
      output: [2 * this.width - 1, 2 * this.height - 1]
    })
    const kernelY = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.xf - this.constants.w + 1)
      const y = (this.thread.y - this.constants.yf - this.constants.h + 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * y * this.constants.q
    }, {
      constants: { k: 9E+9, w: this.width / 2, h: this.height / 2, xf: xa, yf: ya, q: q },
      output: [2 * this.width - 1, 2 * this.height - 1]
    })
    this.buffer_x = kernelX()
    this.buffer_y = kernelY()
    this.buffer_x[this.height - 1][this.width - 1] = 0.0
    this.buffer_y[this.height - 1][this.width - 1] = 0.0
    return this
  }

  // 配列を0で満たす
  fillZero () {
    this.buffer_x = new Array(this.height).fill(new Array(this.width).fill(0.0))
    this.buffer_y = new Array(this.height).fill(new Array(this.width).fill(0.0))
  }

  // 配列の足し算を行う
  // 多分この書き方ではなくてconstantsでxaとかyaを渡す方が良い
  plusTemplate (gpu, template, xa, ya) {
    const kernel = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      return array1[y][x] + array2[y - this.constants.yf][x - this.constants.xf]
    }, {
      constants: { xf: xa, yf: ya },
      output: [this.height, this.width]
    })
    this.buffer_x = kernel(this.buffer_x, template.buffer_x)
    this.buffer_y = kernel(this.buffer_y, template.buffer_y)
    return this
  }

  // Xに大きさをYに角度を代入する
  convertAbsPhase (gpu) {
    const kernelAbs = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      return Math.sqrt(array1[y][x] * array1[y][x] + array2[y][x] * array2[y][x])
    }, {
      output: [this.height, this.width]
    })
    const kernelPhase = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      let phase = Math.atan(array2[y][x] / array1[y][x])
      if (array2[y][x] === 0 && array1[y][x] === 0) { phase = 0 }
      return phase
    }, {
      output: [this.height, this.width]
    })
    const abs = kernelAbs(this.buffer_x, this.buffer_y)
    this.buffer_y = kernelPhase(this.buffer_x, this.buffer_y)
    this.buffer_x = abs
    return this
  }

  // 結果を表示する
  displayOutput (gpuCanvas) {
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
    kernel(this.buffer_x)
  }
*/
};
