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
    this.template_electric_field_x[h - 1][w - 1] = 0.0
    this.template_electric_field_y = kernelY()
    this.template_electric_field_y[h - 1][w - 1] = 0.0
    return this
  }

  superposeElectricFieldFirstGpu = function (array1, xc, yc, qc) {
    const x = this.thread.x
    const y = this.thread.y
    return array1[y + this.constants.h - 1 - yc][x + this.constants.w - 1 - xc] * qc
  }

  superposeElectricFieldGpu = function (array1, array2, xc, yc, qc) {
    const x = this.thread.x
    const y = this.thread.y
    return array1[y][x] + array2[y + this.constants.h - 1 - yc][x + this.constants.w - 1 - xc] * qc
  }

  superposeElectricFieldKernel (kernel1, kernel) {
    const charge = this.charge
    const tempX = this.template_electric_field_x
    const tempY = this.template_electric_field_y
    this.electric_field_x = kernel1(this.template_electric_field_x, charge[0].x, charge[0].y, charge[0].q)
    this.electric_field_y = kernel1(this.template_electric_field_y, charge[0].x, charge[0].y, charge[0].q)
    for (let i = 1; i < this.charge.length; i++) {
      this.electric_field_x = kernel(this.electric_field_x, tempX, charge[i].x, charge[i].y, charge[i].q)
      this.electric_field_y = kernel(this.electric_field_y, tempY, charge[i].x, charge[i].y, charge[i].q)
    }
    return this
  }

  convertPolarElectricFieldGpuR = function (array1, array2) {
    const x = this.thread.x
    const y = this.thread.y
    return Math.sqrt(array1[y][x] * array1[y][x] + array2[y][x] * array2[y][x])
  }

  convertPolarElectricFieldGpuTheta = function (array1, array2) {
    const x = this.thread.x
    const y = this.thread.y
    let theta = Math.atan(array2[y][x] / array1[y][x])
    if (array2[y][x] === 0 && array1[y][x] === 0) { theta = 0 }
    return theta
  }

  convertPolarElectricFieldKernel (kernelR, kernelTheta) {
    const electricFieldX = this.electric_field_x
    const electricFieldY = this.electric_field_y
    this.electric_field_r = kernelR(electricFieldX, electricFieldY)
    this.electric_field_theta = kernelTheta(electricFieldX, electricFieldY)
    return this
  }

  renderRGpu = function (array) {
    const x = this.thread.x
    const y = this.thread.y
    // 8987551792がmax(Q)=1C、min(r)=1mにおけるmax(E)
    const color = array[y][x] / 8987551
    this.color(color, color, color, 1)
  }

  renderRKernel (kernel) {
    kernel(this.electric_field_r)
  }
};
