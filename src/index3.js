import { GPU } from 'gpu.js'
import { Charge } from './models/charge3.js'
import { ElectricField } from './models/electric_field3.js'

const canvas = document.getElementById('canvas')
const gpu = new GPU()
const gpuCanvas = new GPU({ canvas: canvas })
const width = 300
const height = 300

let callback
function simulate () {
  if (c.l === 0) {
    callback = requestAnimationFrame(simulate)
  } else {
    e.superposeElectricFieldKernel(kernelSuperposeElectricFieldFirst, kernelSuperposeElectricField, c)
    e.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
    e.renderRKernel(kernelRenderR)
    c.calcCoulombForce(e.electric_field_x, e.electric_field_y)
    c.calcPositions(width, height)
    callback = requestAnimationFrame(simulate)
  }
}
function addChargeFunction () {
  const tmp = nameText.value.split(',').map(Number)
  const x = Math.min(width - 1, tmp[0])
  const y = Math.min(height - 1, tmp[1])
  c.setElectricCharge([x, y, tmp[2]])
}
function stopSimulationFunction () {
  console.log('test')
  cancelAnimationFrame(callback)
}
function startSimulationFunction () {
  console.log('test')
  cancelAnimationFrame(callback)
  simulate()
}
const nameText = document.getElementById('Charge')
const addCharge = document.getElementById('addCharge')
if (addCharge) {
  addCharge.addEventListener('click', addChargeFunction)
}
const stopSimulation = document.getElementById('stopSimulation')
if (stopSimulation) {
  stopSimulation.addEventListener('click', stopSimulationFunction)
}
const startSimulation = document.getElementById('startSimulation')
if (startSimulation) {
  startSimulation.addEventListener('click', startSimulationFunction)
}

const e = new ElectricField(width, height)
e.calcElectricFieldTemplate(gpu)

const c = new Charge()
// c.setElectricCharge([150, 50, 1])
// c.setElectricCharge([50, 150, 1])

const kernelSuperposeElectricFieldFirst = gpu.createKernel(e.superposeElectricFieldFirstGpu).setConstants({ w: width, h: height }).setOutput([height, width])
const kernelSuperposeElectricField = gpu.createKernel(e.superposeElectricFieldGpu).setConstants({ w: width, h: height }).setOutput([height, width])
const kernelconvertPolarElectricFieldR = gpu.createKernel(e.convertPolarElectricFieldGpuR).setOutput([height, width])
const kernelconvertPolarElectricFieldTheta = gpu.createKernel(e.convertPolarElectricFieldGpuTheta).setOutput([height, width])
const kernelRenderR = gpuCanvas.createKernel(e.renderRGpu).setOutput([height, width]).setGraphical(true)

const move = () => {
  if (c.l === 0) {
    requestAnimationFrame(move)
  } else {
    e.superposeElectricFieldKernel(kernelSuperposeElectricFieldFirst, kernelSuperposeElectricField, c)
    e.convertPolarElectricFieldKernel(kernelconvertPolarElectricFieldR, kernelconvertPolarElectricFieldTheta)
    e.renderRKernel(kernelRenderR)
    c.calcCoulombForce(e.electric_field_x, e.electric_field_y)
    c.calcPositions(width, height)
    requestAnimationFrame(move)
  }
}
// move()
simulate()
