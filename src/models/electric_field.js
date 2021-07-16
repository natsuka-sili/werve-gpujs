const { GPU } = require('gpu.js')
const gpu = new GPU()

class ElectricField {
  constructor (xs, ys) {
    this.xs = xs
    this.ys = ys
  }

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

  fillZero () {
    this.buffer_x = new Array(this.ys).fill(new Array(this.xs).fill(0.0))
    this.buffer_y = new Array(this.ys).fill(new Array(this.xs).fill(0.0))
  }

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

  convertColor () {
    const kernel = gpu.createKernel(function (array) {
      const x = this.thread.x
      const y = this.thread.y
      return array[y][x] / this.constants.m * 255
    }, {
      constants: { m: Math.max(Math.max(...this.buffer_y.map(Function.apply.bind(Math.max, null))), Math.max(...this.buffer_x.map(Function.apply.bind(Math.max, null))))},
      output: [this.ys, this.xs]
    })
    // 二次元配列から最大値を取ってくる→console.log(Math.max(...this.buffer_x.map(Function.apply.bind(Math.max, null))))
    // 2つの二次元配列から最大値を取ってくる→console.log(Math.max(Math.max(...this.buffer_y.map(Function.apply.bind(Math.max, null))), Math.max(...this.buffer_x.map(Function.apply.bind(Math.max, null)))))
    this.buffer_x = kernel(this.buffer_x)
    this.buffer_y = kernel(this.buffer_y)
    return this
  }
};
module.exports = ElectricField
