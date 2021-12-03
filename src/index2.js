import { GPU } from 'gpu.js'
import { Charge } from './models/charge.js'
import { ElectricField } from './models/electric_field.js'

const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const width = 200
const height = 200

const e = new ElectricField(width, height)
e.setArrays()
e.calcElectricFieldTemplate(gpu)

const c1 = new Charge(0, 0, 1, width, height)
const c2 = new Charge(99, 50, 1, width, height)
const c3 = new Charge(150, 199, 1, width, height)

e.inputCharge(c1)
e.inputCharge(c2)
e.inputCharge(c3)

const kernelSuperposeElectricFieldFirst = gpu.createKernel(e.superposeElectricFieldFirstGpu).setConstants({ w: width, h: height }).setOutput([height, width])
const kernelSuperposeElectricField = gpu.createKernel(e.superposeElectricFieldGpu).setConstants({ w: width, h: height }).setOutput([height, width])
const kernelconvertPolarElectricFieldR = gpu.createKernel(e.convertPolarElectricFieldGpuR).setOutput([height, width])
const kernelconvertPolarElectricFieldTheta = gpu.createKernel(e.convertPolarElectricFieldGpuTheta).setOutput([height, width])
const kernelRenderR = gpuCanvas.createKernel(e.renderRGpu).setOutput([height, width]).setGraphical(true)

const move = () => {
  e.superposeElectricFieldKernel(kernelSuperposeElectricFieldFirst, kernelSuperposeElectricField)
  e.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
  e.renderRKernel(kernelRenderR)

  c1.calcCoulombForce(e.electric_field_x, e.electric_field_y)
  c1.calcPositions()
  c2.calcCoulombForce(e.electric_field_x, e.electric_field_y)
  c2.calcPositions()
  c3.calcCoulombForce(e.electric_field_x, e.electric_field_y)
  c3.calcPositions()

  requestAnimationFrame(move)
}

move()
