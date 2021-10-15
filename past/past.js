const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })

class ElectricField {
  constructor (xs, ys) {
    this.xs = xs
    this.ys = ys
  }

  // 点電荷による電界の作成
  createTemplate () {
    const kernelX = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.w + 1)
      const y = (this.thread.y - this.constants.h + 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * x
    }, {
      constants: { k: 9E+9, w: this.xs, h: this.ys },
      output: [2 * this.xs - 1, 2 * this.ys - 1]
    })
    const kernelY = gpu.createKernel(function () {
      const x = (this.thread.x - this.constants.w + 1)
      const y = (this.thread.y - this.constants.h + 1)
      const ri = 1 / (x * x + y * y)
      const k = this.constants.k * Math.sqrt(ri * ri * ri)
      return k * y
    }, {
      constants: { k: 9E+9, w: this.xs, h: this.ys },
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
  plusTemplate (template, xa, ya) {
    const kernel = gpu.createKernel(function (array1, array2, xa, ya) {
      const x = this.thread.x
      const y = this.thread.y
      return array1[y][x] + array2[y + ya][x + xa]
    }, {
      output: [this.ys, this.xs]
    })
    this.buffer_x = kernel(this.buffer_x, template.buffer_x, xa, ya)
    this.buffer_y = kernel(this.buffer_y, template.buffer_y, xa, ya)
    return this
  }

  // Xに大きさをYに角度を代入する
  convertAbsPhase () {
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
  displayOutput () {
    const kernel = gpuCanvas.createKernel(function (array) {
      const x = this.thread.x
      const y = this.thread.y
      const color = array[y][x]
      this.color(color, color, color, 1)
    }, {
      output: [this.ys, this.xs],
      graphical: true
    })
    kernel(this.buffer_x)
  }
};
module.exports = ElectricField

const a = new ElectricField(1000, 1000)
a.fillZero()
a.createTemplate()
a.displayOutput()
