import { Charge } from './charge.js'

export class ElectricField extends Charge {
  constructor (width, height) {
    super(width, height)
    this.template_electric_field_x = []
    this.template_electric_field_y = []
    this.electric_field_x = []
    this.electric_field_y = []
    this.electric_field_r = []
    this.electric_field_theta = []
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
      output: [2 * h - 1, 2 * w - 1]
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
    const kernel = gpu.createKernel(function (array1, array2, xc, yc, qc) {
      const x = this.thread.x
      const y = this.thread.y
      return array1[y][x] + array2[y + this.constants.h - 1 - yc][x + this.constants.w - 1 - xc] * qc
    }, {
      constants: { w: w, h: h },
      output: [h, w]
    })
    for (let i = 0; i < charge.length; i++) {
      const chargeI = charge[i]
      const x = chargeI[0]
      const y = chargeI[1]
      const q = chargeI[4]
      this.electric_field_x = kernel(this.electric_field_x, this.template_electric_field_x, x, y, q)
      this.electric_field_y = kernel(this.electric_field_y, this.template_electric_field_y, x, y, q)
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
    kernel(this.template_electric_field_y)
  }
};
