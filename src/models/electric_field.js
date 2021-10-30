export class ElectricField {
  constructor (width, height) {
    this.width = width
    this.height = height
    this.charge = []
  }

  setElectricCharge (x, y, q) {
    this.charge.push([x, y, q])
    return this
  }

  calcElectricField (gpu) {
    const kernelX = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.w + 1)
      const y = (this.thread.y - this.constants.h + 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * x
    }, {
      constants: { k: 9E+9, w: this.width / 2, h: this.height / 2 },
      output: [2 * this.width - 1, 2 * this.height - 1]
    })
    const kernelY = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.w + 1)
      const y = (this.thread.y - this.constants.h + 1)
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
      const kernel = gpu.createKernel(function (array1, array2) {
        const x = this.thread.x
        const y = this.thread.y
        return array1[y][x] + array2[y - this.constants.y][x - this.constants.x]
      }, {
        constants: { x: x, y: y },
        output: [this.height, this.width]
      })
      this.electric_field_x = kernel(this.electric_field_x, this.template_electric_field_x)
      this.electric_field_y = kernel(this.electric_field_y, this.template_electric_field_y)
    }
    return this
  }

  convertPolar (gpu) {
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
      let r = Math.atan(array2[y][x] / array1[y][x])
      if (array2[y][x] === 0 && array1[y][x] === 0) { r = 0 }
      return r
    }, {
      output: [this.height, this.width]
    })
    this.electric_field_r = kernelR(this.electric_field_x, this.electric_field_y)
    this.electric_field_theta = kernelTheta(this.electric_field_x, this.electric_field_y)
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
};
