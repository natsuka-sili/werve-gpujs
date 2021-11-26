export class ElectricField {
  constructor (w, h) {
    this.w = w
    this.h = h
  }

  calcElectricFieldTemplate (gpu) {
    const w = this.w
    const h = this.h
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
    const kernel = gpu.createKernel(function (array1, array2, xc, yc, q) {
      const x = this.thread.x
      const y = this.thread.y
      return array1[y][x] + array2[y + this.constants.h - 1 - yc][x + this.constants.w - 1 - xc] * q
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
};
