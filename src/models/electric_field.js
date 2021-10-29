export class ElectricField {
  constructor (xs, ys) {
    this.xs = xs
    this.ys = ys

    // ########################### //

    this.charge = []
    this.electric_field_x = []
    this.electric_field_y = []
  }

  // 点電荷による電界の作成
  createTemplate (gpu, xa, ya, q) {
    const kernelX = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.xf - this.constants.w + 1)
      const y = (this.thread.y - this.constants.yf - this.constants.h + 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * x * this.constants.q
    }, {
      constants: { k: 9E+9, w: this.xs / 2, h: this.ys / 2, xf: xa, yf: ya, q: q },
      output: [2 * this.xs - 1, 2 * this.ys - 1]
    })
    const kernelY = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.xf - this.constants.w + 1)
      const y = (this.thread.y - this.constants.yf - this.constants.h + 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * y * this.constants.q
    }, {
      constants: { k: 9E+9, w: this.xs / 2, h: this.ys / 2, xf: xa, yf: ya, q: q },
      output: [2 * this.xs - 1, 2 * this.ys - 1]
    })
    this.buffer_x = kernelX()
    this.buffer_y = kernelY()
    this.buffer_x[this.ys - 1][this.xs - 1] = 0.0
    this.buffer_y[this.ys - 1][this.xs - 1] = 0.0
    return this
  }

  // 配列を0で満たす
  fillZero () {
    this.buffer_x = new Array(this.ys).fill(new Array(this.xs).fill(0.0))
    this.buffer_y = new Array(this.ys).fill(new Array(this.xs).fill(0.0))
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
      output: [this.ys, this.xs]
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
      output: [this.ys, this.xs]
    })
    const kernelPhase = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      let phase = Math.atan(array2[y][x] / array1[y][x])
      if (array2[y][x] === 0 && array1[y][x] === 0) { phase = 0 }
      return phase
    }, {
      output: [this.ys, this.xs]
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
      output: [this.ys, this.xs],
      graphical: true
    })
    kernel(this.buffer_x)
  }

  // ############################################################ //

  setElectricCharge (x, y, q) {
    this.charge.push([x, y, q])
    return this
  }

  calcElectricField (gpu) {
    for (let i = 0; i < this.charge.length; i++) {
      const x = this.charge[i][0]
      const y = this.charge[i][1]
      const q = this.charge[i][2]
      const kernelX = gpu.createKernel(function () {
        const x = (this.thread.x - this.constants.x - this.constants.w + 1)
        const y = (this.thread.y - this.constants.y - this.constants.h + 1)
        const ri = 1 / (x * x + y * y)
        const k = this.constants.k * Math.sqrt(ri * ri * ri)
        return k * x * this.constants.q
      }, {
        constants: { k: 9E+9, w: this.xs / 2, h: this.ys / 2, x: x, y: y, q: q },
        output: [2 * this.xs - 1, 2 * this.ys - 1]
      })
      const kernelY = gpu.createKernel(function () {
        const x = (this.thread.x - this.constants.x - this.constants.w + 1)
        const y = (this.thread.y - this.constants.y - this.constants.h + 1)
        const ri = 1 / (x * x + y * y)
        const k = this.constants.k * Math.sqrt(ri * ri * ri)
        return k * y * this.constants.q
      }, {
        constants: { k: 9E+9, w: this.xs / 2, h: this.ys / 2, x: x, y: y, q: q },
        output: [2 * this.xs - 1, 2 * this.ys - 1]
      })
      this.electric_field_x.push(kernelX())
      this.electric_field_y.push(kernelY())
      this.electric_field_x[this.electric_field_x.length - 1][this.ys - 1][this.xs - 1] = 0.0
      this.electric_field_y[this.electric_field_x.length - 1][this.ys - 1][this.xs - 1] = 0.0
    }
    return this
  }

  superposeElectricField (gpu) {
    this.all_electric_field_x = new Array(this.ys).fill(new Array(this.xs).fill(0.0))
    this.all_electric_field_y = new Array(this.ys).fill(new Array(this.xs).fill(0.0))
    for (let i = 0; i < this.charge.length; i++) {
      const x = this.charge[i][0]
      const y = this.charge[i][1]

      const kernel = gpu.createKernel(function (array1, array2) {
        const x = this.thread.x
        const y = this.thread.y
        return array1[y][x] + array2[y - this.constants.y][x - this.constants.x]
      }, {
        constants: { x: x, y: y },
        output: [this.ys, this.xs]
      })

      this.all_electric_field_x = kernel(this.all_electric_field_x, this.electric_field_x[i])
      this.all_electric_field_y = kernel(this.all_electric_field_y, this.electric_field_y[i])
    }
    return this
  }

  convertPolar (gpu) {
    const kernelR = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      return Math.sqrt(array1[y][x] * array1[y][x] + array2[y][x] * array2[y][x])
    }, {
      output: [this.ys, this.xs]
    })
    const kernelTheta = gpu.createKernel(function (array1, array2) {
      const x = this.thread.x
      const y = this.thread.y
      let r = Math.atan(array2[y][x] / array1[y][x])
      if (array2[y][x] === 0 && array1[y][x] === 0) { r = 0 }
      return r
    }, {
      output: [this.ys, this.xs]
    })
    this.all_electric_field_r = kernelR(this.all_electric_field_x, this.all_electric_field_y)
    this.all_electric_field_theta = kernelTheta(this.all_electric_field_x, this.all_electric_field_y)
    return this
  }
};
