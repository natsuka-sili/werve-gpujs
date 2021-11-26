import { GPU } from 'gpu.js'
import { Verve } from './models/verve.js'

const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const width = 200
const height = 200

const a = new Verve(width, height)
a.calcElectricFieldTemplate(gpu)
a.setElectricCharge(0, 0, 1)
a.setElectricCharge(99, 50, 1)
a.setElectricCharge(50, 25, 1)

const kernelSuperposeElectricField = gpu.createKernel(a.superposeElectricFieldGpu).setConstants({ w: width, h: height }).setOutput([height, width])
const kernelconvertPolarElectricFieldR = gpu.createKernel(a.convertPolarElectricFieldGpuR).setOutput([height, width])
const kernelconvertPolarElectricFieldTheta = gpu.createKernel(a.convertPolarElectricFieldGpuTheta).setOutput([height, width])
const kernelRenderR = gpuCanvas.createKernel(a.renderRGpu).setOutput([height, width]).setGraphical(true)

const move = () => {
  a.superposeElectricFieldKernel(kernelSuperposeElectricField)
  // a.superposeElectricField(gpu)
  a.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
  // a.convertPolarElectricField(gpu)
  a.calcSumCoulombForce()
  a.calcPositions()
  a.renderRKernel(kernelRenderR)
  // a.renderR(gpuCanvas)
  requestAnimationFrame(move)
}

move()
